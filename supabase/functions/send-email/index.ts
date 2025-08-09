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
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
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
    const { templateId, recipientEmail, customerId, variables = {}, attachments = [] }: SendEmailRequest = await req.json();
    console.log('Send email request received:', { templateId, recipientEmail, customerId });

    // Get email template by ID
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', { templateError, templateId, foundTemplate: !!template });
      return new Response(
        JSON.stringify({ error: 'Template not found', templateId, details: templateError }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Template found:', { templateName: template.name, templateId: template.id });

    // Replace variables in content
    let emailContent = template.content.content || '';
    let emailSubject = template.subject;
    let emailGreeting = template.content.greeting || '';

    // Generate unsubscribe token (simple hash of email + timestamp)
    const unsubscribeToken = btoa(`${recipientEmail}:${Date.now()}`).replace(/[+/=]/g, '');
    
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
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #f97316; text-decoration: none; font-weight: 600;">$1</a>')
      .replace(/\\n\\n/g, '</p><p style="margin: 16px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">')
      .replace(/\\n/g, '<br>')
      .replace(/\n\n/g, '</p><p style="margin: 16px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">')
      .replace(/\n/g, '<br>');

    // Wrap content in paragraph tags if not already wrapped
    if (!emailContent.startsWith('<p')) {
      emailContent = `<p style="margin: 16px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">${emailContent}</p>`;
    }

    // Create HTML email with brand styling
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${emailSubject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    /* Remove default spacing */
    body { margin: 0 !important; padding: 0 !important; }
    
    /* Base styles */
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background-color: #f8f9fa !important;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .email-container { 
      max-width: 600px !important; 
      margin: 0 auto !important; 
      background-color: #ffffff !important;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .email-header {
      background-color: #f1f5f9 !important;
      padding: 30px 40px !important;
      text-align: center !important;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .email-logo img {
      height: 40px !important;
      width: auto !important;
      display: block !important;
      margin: 0 auto !important;
    }
    
    .email-logo {
      color: #1a1a1a !important;
      font-size: 24px !important;
      font-weight: bold !important;
      text-decoration: none !important;
      display: inline-block;
    }
    
    .email-content { 
      padding: 40px !important;
    }
    
    .email-greeting {
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #1a1a1a !important;
      margin-bottom: 20px !important;
      margin-top: 0 !important;
    }
    
    .email-text {
      color: #1a1a1a !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
      margin: 16px 0 !important;
    }
    
    .email-button {
      display: inline-block !important;
      padding: 12px 24px !important;
      background: linear-gradient(135deg, #f97316, #ea580c) !important;
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 6px !important;
      font-weight: 600 !important;
      margin: 20px 0 !important;
    }
    
    .email-footer {
      background-color: #f1f5f9 !important;
      padding: 30px 40px !important;
      text-align: center !important;
      color: #64748b !important;
      font-size: 14px !important;
    }
    
    .email-footer a {
      color: #f97316 !important;
      text-decoration: none !important;
    }
    
    .email-footer-text {
      margin: 0 0 10px 0 !important;
      color: #64748b !important;
    }
    
    .email-unsubscribe {
      margin-top: 20px !important; 
      font-size: 12px !important; 
      color: #94a3b8 !important;
    }
    
    .email-unsubscribe a {
      color: #94a3b8 !important;
    }
    
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .email-header, .email-content, .email-footer {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
    <tr>
      <td style="padding: 20px 0;">
        <div class="email-container">
          <div class="email-header">
            <a href="https://buyawarranty.co.uk" class="email-logo">
              <span style="color: #1e3a8a; font-weight: bold;">buya</span><span style="color: #f97316; font-weight: bold;">warranty</span>
            </a>
          </div>
          
          <div class="email-content">
            ${emailGreeting ? `<div class="email-greeting">${emailGreeting}</div>` : ''}
            <div class="email-text">${emailContent}</div>
          </div>
          
          <div class="email-footer">
            <p class="email-footer-text">
              <strong>buyawarranty.co.uk</strong><br>
              Your trusted warranty partner<br>
              <a href="tel:0330229504">0330 229 5040</a> | 
              <a href="mailto:info@buyawarranty.co.uk">info@buyawarranty.co.uk</a>
            </p>
            <p class="email-unsubscribe">
              If you no longer wish to receive these emails, you can 
              <a href="https://buyawarranty.co.uk/unsubscribe?email={{recipientEmail}}&token={{unsubscribeToken}}">unsubscribe here</a>.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Replace footer placeholders
    htmlContent = htmlContent
      .replace(/\{\{recipientEmail\}\}/g, encodeURIComponent(recipientEmail))
      .replace(/\{\{unsubscribeToken\}\}/g, unsubscribeToken)
      .replace(/\{\{reinstate_link\}\}/g, 'https://buyawarranty.co.uk/')
      .replace(/\{\{renewal_link\}\}/g, 'https://buyawarranty.co.uk/');

    // Create email log entry
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        template_id: template.id,
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

    // Prepare email options
    const emailOptions: any = {
      from: template.from_email,
      to: [recipientEmail],
      subject: emailSubject,
      html: htmlContent,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        type: attachment.type
      }));
    }

    // Add BCC for Trustpilot integration if this is a feedback template
    if (template.template_type === 'feedback') {
      emailOptions.bcc = ['buyawarranty.co.uk+8fc526946e@invite.trustpilot.com'];
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send(emailOptions);

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