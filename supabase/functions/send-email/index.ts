import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  templateId: string;
  recipientEmail: string;
  customerId?: string;
  variables?: Record<string, any>;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId, recipientEmail, customerId, variables = {} }: SendEmailRequest = await req.json();

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Replace variables in content
    let emailContent = template.content.content || '';
    let emailSubject = template.subject;
    let emailGreeting = template.content.greeting || '';

    // Replace variables in all text fields
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      emailContent = emailContent.replace(new RegExp(placeholder, 'g'), String(value));
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), String(value));
      emailGreeting = emailGreeting.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Convert markdown-style formatting to HTML
    emailContent = emailContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    // Create HTML email with brand styling
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #1a1a1a;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316, #ea580c);
      padding: 30px 40px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
    }
    .content { 
      padding: 40px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 30px 40px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
    }
    a {
      color: #f97316;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://buyawarranty.co.uk" class="logo">Buyawarranty.co.uk</a>
    </div>
    
    <div class="content">
      <div class="greeting">${emailGreeting}</div>
      <div>${emailContent}</div>
    </div>
    
    <div class="footer">
      <p>
        <strong>Buyawarranty.co.uk</strong><br>
        Your trusted warranty partner<br>
        <a href="tel:0330229504">0330 229 5040</a> | 
        <a href="mailto:info@buyawarranty.co.uk">info@buyawarranty.co.uk</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
        If you no longer wish to receive these emails, you can 
        <a href="#" style="color: #94a3b8;">unsubscribe here</a>.
      </p>
    </div>
  </div>
</body>
</html>`;

    // Create email log entry
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        template_id: templateId,
        recipient_email: recipientEmail,
        customer_id: customerId,
        subject: emailSubject,
        status: 'pending',
        metadata: { variables }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: template.from_email,
      to: [recipientEmail],
      subject: emailSubject,
      html: htmlContent,
    });

    // Update email log with result
    if (emailLog) {
      const updateData = emailResponse.data ? {
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { ...emailLog.metadata, resend_id: emailResponse.data.id }
      } : {
        status: 'failed',
        error_message: emailResponse.error?.message || 'Unknown error',
        metadata: { ...emailLog.metadata, error: emailResponse.error }
      };

      await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', emailLog.id);
    }

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResponse.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Email sent successfully:', emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      logId: emailLog?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);