import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  email: string;
  firstName?: string;
  vehicleReg?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleType?: string; // Added for special vehicles (EV, PHEV, MOTORBIKE)
  triggerType: 'pricing_page_view' | 'plan_selected';
  planName?: string;
  paymentType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const emailRequest: SendEmailRequest = await req.json();
    console.log('Sending abandoned cart email:', emailRequest);

    // Check if we've already sent this type of email to this person recently
    const { data: recentEmails, error: checkError } = await supabase
      .from('triggered_emails_log')
      .select('*')
      .eq('email', emailRequest.email)
      .eq('trigger_type', emailRequest.triggerType)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Error checking recent emails:', checkError);
    }

    // If we already sent this type of email in the last 24 hours, skip
    if (recentEmails && recentEmails.length > 0) {
      console.log(`Skipping email - already sent ${emailRequest.triggerType} email to ${emailRequest.email} recently`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email already sent recently" 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the email template
    const { data: template, error: templateError } = await supabase
      .from('abandoned_cart_email_templates')
      .select('*')
      .eq('trigger_type', emailRequest.triggerType)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Email template not found');
    }

    // Generate URLs based on vehicle registration and type
    const baseUrl = 'https://buyawarranty.co.uk';
    const encodedReg = encodeURIComponent(emailRequest.vehicleReg || '');
    
    let continueUrl = `${baseUrl}`;
    let checkoutUrl = `${baseUrl}`;

    // If we have vehicle registration, create a state parameter to restore the flow
    if (emailRequest.vehicleReg) {
      const stateParam = btoa(JSON.stringify({
        regNumber: emailRequest.vehicleReg,
        email: emailRequest.email,
        firstName: emailRequest.firstName,
        vehicleMake: emailRequest.vehicleMake,
        vehicleModel: emailRequest.vehicleModel,
        vehicleType: emailRequest.vehicleType, // Important for special vehicles
        step: emailRequest.triggerType === 'pricing_page_view' ? 3 : 4,
        planName: emailRequest.planName,
        paymentType: emailRequest.paymentType
      }));
      continueUrl = `${baseUrl}?restore=${encodeURIComponent(stateParam)}`;
      checkoutUrl = continueUrl;
    }

    // Replace template variables
    const variables = {
      firstName: emailRequest.firstName || 'there',
      vehicleReg: emailRequest.vehicleReg || '',
      vehicleMake: emailRequest.vehicleMake || '',
      vehicleModel: emailRequest.vehicleModel || '',
      planName: emailRequest.planName || '',
      paymentType: emailRequest.paymentType || '',
      continueUrl,
      checkoutUrl
    };

    let htmlContent = template.html_content;
    let textContent = template.text_content || '';
    let subject = template.subject;

    // Replace all variables in content and subject
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Send email using Resend with improved deliverability
    const emailResponse = await resend.emails.send({
      from: "Buy A Warranty <noreply@buyawarranty.co.uk>",
      reply_to: "info@buyawarranty.co.uk",
      to: [emailRequest.email],
      subject: subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Entity-Ref-ID': `baw-cart-${Date.now()}-${emailRequest.email.substring(0, 8)}`,
        'List-Unsubscribe': '<mailto:unsubscribe@buyawarranty.co.uk>',
      },
      tags: [
        { name: 'category', value: 'transactional' },
        { name: 'type', value: 'abandoned-cart' },
        { name: 'vehicle-reg', value: (emailRequest.vehicleReg || 'unknown').replace(/\s+/g, '-') }
      ]
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the sent email
    const { error: logError } = await supabase
      .from('triggered_emails_log')
      .insert([{
        email: emailRequest.email,
        trigger_type: emailRequest.triggerType,
        template_id: template.id,
        vehicle_reg: emailRequest.vehicleReg,
        email_status: 'sent'
      }]);

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Abandoned cart email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-abandoned-cart-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);