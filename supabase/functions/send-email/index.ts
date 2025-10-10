import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY not found in environment variables");
}
console.log("Resend API key available:", !!resendApiKey);
const resend = new Resend(resendApiKey);

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
    console.log('=== Send Email Function Started ===');
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { templateId, recipientEmail, customerId, variables = {}, attachments = [] }: SendEmailRequest = requestBody;
    console.log('Parsed request:', { templateId, recipientEmail, customerId, variablesCount: Object.keys(variables).length });
    
    // Generate tracking ID for this email
    const trackingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate required fields
    if (!templateId || !recipientEmail) {
      console.error('Missing required fields:', { templateId: !!templateId, recipientEmail: !!recipientEmail });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: templateId and recipientEmail are required' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Attempting to fetch template with ID/type:', templateId);
    
    // Get email template by ID or template_type
    // If templateId looks like a UUID, search by id, otherwise search by template_type
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateId);
    
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq(isUUID ? 'id' : 'template_type', templateId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Template query result:', { 
      found: !!template, 
      error: templateError ? JSON.stringify(templateError) : null,
      templateName: template?.name,
      searchType: isUUID ? 'id' : 'template_type'
    });

    if (templateError || !template) {
      console.error('Template not found:', { templateError, templateId, foundTemplate: !!template, searchType: isUUID ? 'id' : 'template_type' });
      return new Response(
        JSON.stringify({ error: 'Template not found', templateId, details: templateError, searchType: isUUID ? 'id' : 'template_type' }),
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

    // Generate UTM parameters for tracking
    const baseUrl = Deno.env.get('SUPABASE_URL') || 'https://buyawarranty.co.uk';
    const utmParams = {
      utm_campaign: template.template_type,
      utm_source: 'email',
      utm_medium: 'email',
      utm_content: template.name.toLowerCase().replace(/\s+/g, '_'),
    };
    
    // Add UTM parameters to all links in content
    const addUTMToLink = (url: string) => {
      if (!url.startsWith('http')) return url;
      const urlObj = new URL(url);
      Object.entries(utmParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });
      return urlObj.toString();
    };
    
    // Wrap links with click tracking
    emailContent = emailContent.replace(
      /href="([^"]*)"/g,
      (match, url) => {
        if (url.startsWith('http') || url.startsWith('//')) {
          const utmUrl = addUTMToLink(url);
          const trackingUrl = `${baseUrl}/functions/v1/track-email-click?tracking_id=${trackingId}&url=${encodeURIComponent(utmUrl)}`;
          return `href="${trackingUrl}"`;
        }
        return match;
      }
    );
    
    // Create HTML email with brand styling and tracking pixel
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${emailSubject}</title>
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17325228149"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-17325228149');
    gtag('event', 'email_open', {
      'event_category': 'Email',
      'event_label': '${template.template_type}',
      'tracking_id': '${trackingId}'
    });
  </script>
  
  <!-- Meta Pixel -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('trackCustom', 'EmailOpen', {
      tracking_id: '${trackingId}',
      template_type: '${template.template_type}'
    });
  </script>
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
  
  <!-- Tracking Pixel -->
  <img src="${baseUrl}/functions/v1/track-email-open?tracking_id=${trackingId}" width="1" height="1" alt="" style="display:none;" />
</body>
</html>`;

    // Replace footer placeholders
    htmlContent = htmlContent
      .replace(/\{\{recipientEmail\}\}/g, encodeURIComponent(recipientEmail))
      .replace(/\{\{unsubscribeToken\}\}/g, unsubscribeToken)
      .replace(/\{\{reinstate_link\}\}/g, 'https://buyawarranty.co.uk/')
      .replace(/\{\{renewal_link\}\}/g, 'https://buyawarranty.co.uk/');

    // Create email log entry with tracking information
    const { data: emailLog, error: logError } = await supabase
      .from('email_logs')
      .insert({
        template_id: template.id,
        recipient_email: recipientEmail,
        customer_id: customerId,
        subject: emailSubject,
        status: 'pending',
        tracking_id: trackingId,
        utm_campaign: utmParams.utm_campaign,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_content: utmParams.utm_content,
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
    if (template.template_type === 'feedback' || template.template_type === 'feedback_reminder') {
      emailOptions.bcc = ['buyawarranty.co.uk+8fc526946e@invite.trustpilot.com'];
    }

    console.log('Attempting to send email with Resend...', { 
      from: emailOptions.from, 
      to: emailOptions.to[0],
      subject: emailOptions.subject.substring(0, 50) + '...',
      hasResendKey: !!resendApiKey
    });
    
    // Send email with Resend
    const emailResponse = await resend.emails.send(emailOptions);
    
    console.log('Resend response received:', { 
      hasData: !!emailResponse.data, 
      hasError: !!emailResponse.error,
      errorMessage: emailResponse.error?.message 
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