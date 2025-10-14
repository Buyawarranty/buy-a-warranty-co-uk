import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const requestBody = await req.json();
    logStep("Request body received", requestBody);
    
    const { templateId, recipientEmail, variables, attachments } = requestBody;
    
    logStep("Request received", { 
      templateId, 
      recipientEmail, 
      hasVariables: !!variables,
      attachmentsCount: attachments?.length || 0
    });

    if (!recipientEmail) {
      logStep("ERROR: Missing recipient email");
      throw new Error("Recipient email is required");
    }

    // Verify Resend API key is set
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      logStep("ERROR: RESEND_API_KEY not found");
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    logStep("Resend API key found");

    // Build email subject based on template
    let subject = "Buy A Warranty - Policy Documents";
    let htmlContent = "";
    
    if (templateId === 'policy_documents' || templateId === 'welcome_email') {
      subject = `Your ${variables?.planType || 'Warranty'} Policy Documents - ${variables?.policyNumber || ''}`;
      
      // Build HTML email content
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a365d; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1a365d; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: bold; color: #1a365d; }
            .info-value { color: #333; }
            .login-box { background: #e8f4f8; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #1a365d; }
            .button { display: inline-block; padding: 12px 30px; background: #1a365d; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Buy A Warranty</h1>
              <p>Your comprehensive vehicle protection</p>
            </div>
            
            <div class="content">
              <h2>Dear ${variables?.customerName || 'Valued Customer'},</h2>
              
              <p>Thank you for choosing Buy A Warranty for your vehicle protection needs. We're pleased to confirm that your warranty is now active.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a365d;">Policy Details</h3>
                <div class="info-row">
                  <span class="info-label">Policy Number:</span>
                  <span class="info-value">${variables?.policyNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Plan Type:</span>
                  <span class="info-value">${variables?.planType || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Registration Plate:</span>
                  <span class="info-value">${variables?.registrationPlate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Coverage Period:</span>
                  <span class="info-value">${variables?.coveragePeriod || variables?.periodInMonths + ' months' || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Start Date:</span>
                  <span class="info-value">${variables?.policyStartDate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">End Date:</span>
                  <span class="info-value">${variables?.policyEndDate || variables?.policyExpiryDate || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${variables?.paymentMethod || variables?.paymentType || 'N/A'}</span>
                </div>
              </div>
              
              ${variables?.temporaryPassword && !variables?.isExistingCustomer ? `
              <div class="login-box">
                <h3 style="margin-top: 0; color: #1a365d;">🔐 Your Customer Portal Access</h3>
                <p><strong>Welcome! We've created your customer account.</strong></p>
                <p>Access your policy documents, manage your warranty, and submit claims through our customer portal:</p>
                <div class="info-row">
                  <span class="info-label">Login URL:</span>
                  <span class="info-value">${variables?.loginUrl || 'https://buyawarranty.co.uk/customer-dashboard'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${variables?.loginEmail || recipientEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Temporary Password:</span>
                  <span class="info-value"><strong>${variables?.temporaryPassword}</strong></span>
                </div>
                <p style="color: #d97706; font-weight: bold;">⚠️ Please change your password after your first login for security.</p>
                <a href="${variables?.loginUrl || 'https://buyawarranty.co.uk/customer-dashboard'}" class="button">Access Customer Portal</a>
              </div>
              ` : variables?.isExistingCustomer ? `
              <div class="login-box">
                <h3 style="margin-top: 0; color: #1a365d;">🔐 Welcome Back!</h3>
                <p><strong>You can access your updated policy through your existing customer portal account.</strong></p>
                <div class="info-row">
                  <span class="info-label">Login URL:</span>
                  <span class="info-value">${variables?.loginUrl || 'https://buyawarranty.co.uk/customer-dashboard'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${variables?.loginEmail || recipientEmail}</span>
                </div>
                <p><em>${variables?.temporaryPassword || 'Use your existing password'}</em></p>
                <a href="${variables?.loginUrl || 'https://buyawarranty.co.uk/customer-dashboard'}" class="button">Access Customer Portal</a>
              </div>
              ` : ''}
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a365d;">📎 Attached Documents</h3>
                <p>Please find your warranty policy documents attached to this email:</p>
                <ul>
                  <li>Warranty Policy Certificate</li>
                  <li>Terms & Conditions</li>
                </ul>
                <p><strong>Important:</strong> Please keep these documents safe. You'll need them when making a claim.</p>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #1a365d;">📞 Need Help?</h3>
                <p>If you have any questions or need assistance, our customer support team is here to help:</p>
                <p>
                  <strong>Email:</strong> support@buyawarranty.co.uk<br>
                  <strong>Phone:</strong> 0300 303 2044<br>
                  <strong>Hours:</strong> Monday - Friday, 9am - 5pm
                </p>
              </div>
              
              <p>Thank you for choosing Buy A Warranty. We look forward to providing you with peace of mind on the road.</p>
              
              <p>Best regards,<br>
              <strong>The Buy A Warranty Team</strong></p>
            </div>
            
            <div class="footer">
              <p>Buy A Warranty Ltd | Protecting Your Journey</p>
              <p>This email was sent to ${recipientEmail}</p>
              <p>&copy; ${new Date().getFullYear()} Buy A Warranty. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Prepare email payload
    const emailPayload: any = {
      from: "Buy A Warranty <support@buyawarranty.co.uk>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map((attachment: any) => ({
        filename: attachment.filename,
        content: attachment.content,
      }));
      logStep("Added attachments to email", { count: attachments.length });
    }

    logStep("Sending email via Resend", { to: recipientEmail, subject });

    let data, error;
    try {
      const result = await resend.emails.send(emailPayload);
      data = result.data;
      error = result.error;
    } catch (resendError) {
      logStep("Resend API exception", { error: resendError });
      throw new Error(`Resend API exception: ${resendError.message || String(resendError)}`);
    }

    if (error) {
      logStep("Resend API error", error);
      throw new Error(`Resend API error: ${error.message || JSON.stringify(error)}`);
    }

    logStep("Email sent successfully", { messageId: data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data?.id,
        message: "Email sent successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
