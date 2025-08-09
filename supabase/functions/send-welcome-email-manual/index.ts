import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ManualEmailRequest {
  policyId?: string;
  customerId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Manual Welcome Email Send Started ===');
    const { policyId, customerId }: ManualEmailRequest = await req.json();
    
    if (!policyId && !customerId) {
      throw new Error('Either policyId or customerId is required');
    }

    // Get policy and customer data
    let query = supabase
      .from('customer_policies')
      .select(`
        *,
        customers!customer_id (
          id,
          name,
          email
        )
      `);

    if (policyId) {
      query = query.eq('id', policyId);
    } else {
      query = query.eq('customer_id', customerId);
    }

    const { data: policies, error: policyError } = await query;

    if (policyError || !policies || policies.length === 0) {
      throw new Error('Policy not found');
    }

    const policy = policies[0];
    const customer = policy.customers;

    if (!customer) {
      throw new Error('Customer data not found');
    }

    console.log('Sending manual welcome email for policy:', policy.warranty_number);

    // Check for idempotency - don't send if already sent recently (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (policy.email_sent_status === 'sent' && 
        policy.email_sent_at && 
        new Date(policy.email_sent_at) > oneHourAgo) {
      
      return new Response(JSON.stringify({ 
        error: 'Email already sent within the last hour. Please wait before resending.' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the welcome email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'welcome')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error('Welcome email template not found');
    }

    // Validate mandatory fields
    if (!policy.warranty_number) {
      throw new Error('Missing warranty number - cannot send email');
    }
    if (!customer.name) {
      throw new Error('Missing customer name - cannot send email');
    }
    if (!policy.pdf_document_path) {
      throw new Error('Missing PDF document path - cannot send email');
    }

    // Prepare email variables
    const emailVariables = {
      customer_name: customer.name,
      warranty_number: policy.warranty_number,
      policy_start_date: new Date(policy.policy_start_date).toLocaleDateString('en-GB'),
      policy_end_date: new Date(policy.policy_end_date).toLocaleDateString('en-GB'),
      secure_download_link: `https://buyawarranty.co.uk/download-policy/${policy.id}`
    };

    // Prepare PDF attachment (simplified - you'll need to implement actual PDF retrieval)
    const attachments = [{
      filename: `warranty-policy-${policy.warranty_number}.pdf`,
      content: policy.pdf_document_path, // This should be the actual PDF content
      type: 'application/pdf'
    }];

    // Send welcome email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        templateId: template.id,
        recipientEmail: customer.email,
        customerId: customer.id,
        variables: emailVariables,
        attachments: attachments
      }
    });

    if (emailResponse.error) {
      console.error('Error sending welcome email:', emailResponse.error);
      
      // Update policy status to indicate email failed
      await supabase
        .from('customer_policies')
        .update({ 
          email_sent_status: 'failed',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', policy.id);

      // Log the email failure
      await supabase.rpc('log_warranty_event', {
        p_policy_id: policy.id,
        p_customer_id: customer.id,
        p_event_type: 'email_failed_manual',
        p_event_data: { error: emailResponse.error },
        p_created_by: 'admin'
      });

      throw new Error(`Failed to send email: ${emailResponse.error.message || 'Unknown error'}`);
    } else {
      console.log('Welcome email sent successfully');
      
      // Update policy status to indicate email sent
      await supabase
        .from('customer_policies')
        .update({ 
          email_sent_status: 'sent',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', policy.id);

      // Log the email success
      await supabase.rpc('log_warranty_event', {
        p_policy_id: policy.id,
        p_customer_id: customer.id,
        p_event_type: 'email_sent_manual',
        p_event_data: { 
          template_id: template.id,
          email_id: emailResponse.data?.emailId 
        },
        p_created_by: 'admin'
      });
    }

    console.log('=== Manual Welcome Email Send Complete ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email sent successfully',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in manual welcome email send:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);