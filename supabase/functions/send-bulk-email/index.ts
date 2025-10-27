import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { customerIds, templateId } = await req.json();

    console.log('Bulk email request:', { customerIds: customerIds?.length, templateId });

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      throw new Error('Customer IDs are required');
    }

    if (!templateId) {
      throw new Error('Template ID is required');
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Get customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, email')
      .in('id', customerIds);

    if (customersError) {
      throw customersError;
    }

    console.log(`Sending to ${customers.length} customers`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Send emails
    for (const customer of customers) {
      try {
        // Replace template variables
        let emailContent = template.content.html || '';
        let emailSubject = template.subject;
        
        emailContent = emailContent.replace(/\{name\}/g, customer.name || 'Customer');
        emailSubject = emailSubject.replace(/\{name\}/g, customer.name || 'Customer');

        const emailResponse = await resend.emails.send({
          from: template.from_email,
          to: [customer.email],
          subject: emailSubject,
          html: emailContent,
        });

        console.log(`Email sent to ${customer.email}:`, emailResponse);

        // Log email
        await supabase.from('email_logs').insert({
          recipient_email: customer.email,
          subject: emailSubject,
          template_id: templateId,
          delivery_status: 'sent',
          metadata: { resend_id: emailResponse.id }
        });

        results.success++;
      } catch (error: any) {
        console.error(`Failed to send to ${customer.email}:`, error);
        results.failed++;
        results.errors.push({
          email: customer.email,
          error: error.message
        });

        // Log failure
        await supabase.from('email_logs').insert({
          recipient_email: customer.email,
          subject: template.subject,
          template_id: templateId,
          delivery_status: 'failed',
          error_message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Bulk email error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
