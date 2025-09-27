import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

// Generate random password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { email, planType, paymentType, policyNumber, registrationPlate, customerName } = await req.json();
    logStep("Request data", { email, planType, paymentType, policyNumber, registrationPlate, customerName });

    if (!email || !planType || !paymentType || !policyNumber) {
      logStep("Missing required parameters", { email: !!email, planType: !!planType, paymentType: !!paymentType, policyNumber: !!policyNumber });
      throw new Error("Missing required parameters: email, planType, paymentType, and policyNumber are all required");
    }

    // Check if welcome email already sent for this email address
    logStep("Checking for existing welcome email record");
    const { data: existingWelcomeEmail } = await supabaseClient
      .from('welcome_emails')
      .select('temporary_password, email_sent_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If welcome email already sent recently (within 1 hour), skip sending another one
    if (existingWelcomeEmail) {
      const sentAt = new Date(existingWelcomeEmail.email_sent_at);
      const now = new Date();
      const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
      
      // Temporarily allowing resends after 1 hour instead of 24 hours for testing
      if (hoursSinceSent < 1) {
        logStep("Welcome email already sent recently", { 
          sentAt: existingWelcomeEmail.email_sent_at,
          hoursSinceSent 
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Welcome email already sent recently',
          skipped: true
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Use existing password or generate new one
    const tempPassword = existingWelcomeEmail?.temporary_password || generateTempPassword();
    logStep(existingWelcomeEmail ? "Using existing temporary password" : "Generated new temporary password");

    // Check if user already exists first by email
    logStep("Checking if user exists");
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === email);
    
    let userId = null;
    
    if (userExists) {
      logStep("User already exists", { userId: userExists.id });
      userId = userExists.id;
      
    // Update existing user's password
      await supabaseClient.auth.admin.updateUserById(userExists.id, {
        password: tempPassword,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });
      logStep("Updated existing user password and metadata", { userId: userExists.id, tempPasswordLength: tempPassword.length });
    } else {
      // Create user with Supabase Auth
      logStep("Creating new user with auth");
      const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });

      if (userError) {
        logStep("User creation failed", userError);
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      if (!userData.user) {
        throw new Error("User creation returned no user data");
      }

      userId = userData.user.id;
      logStep("User created successfully", { userId, email, tempPasswordLength: tempPassword.length });
    }

    // Store welcome email record for audit
    try {
      const { error: welcomeEmailError } = await supabaseClient
        .from('welcome_emails')
        .insert({
          user_id: userId,
          email: email,
          temporary_password: tempPassword,
          email_sent_at: new Date().toISOString()
        });

      if (welcomeEmailError) {
        logStep("Warning: Could not store welcome email record", welcomeEmailError);
      }
    } catch (auditError) {
      logStep("Warning: Welcome email audit failed", auditError);
    }

    // Create or update policy record
    const policyEndDate = calculatePolicyEndDate(paymentType);
    
    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .upsert({
        user_id: userId,
        email: email,
        plan_type: planType.toLowerCase(),
        payment_type: paymentType,
        policy_number: policyNumber,
        policy_end_date: policyEndDate,
        status: 'active',
        email_sent_status: 'sent',
        email_sent_at: new Date().toISOString()
      }, {
        onConflict: 'policy_number'
      })
      .select()
      .single();

    if (policyError) {
      logStep("Policy creation failed", policyError);
      throw new Error(`Failed to create policy: ${policyError.message}`);
    }
    logStep("Created policy record", { policyId: policyData.id });

    // Get environment variables for email
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFrom = 'Buy A Warranty <noreply@buyawarranty.co.uk>';
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Use the new Premium Plan PDF for all warranty types
    const planDocumentUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf`;
    const termsUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-7.pdf`;
    
    logStep("Document URLs determined", { planType, planDocumentUrl, termsUrl });

    // Registration plate styling - optimized for both light and dark modes
    const regPlate = registrationPlate || 'N/A';
    const regPlateStyle = `
      display: inline-block;
      background: #1a1a1a;
      color: #ffffff;
      font-family: 'Charles Wright', monospace;
      font-weight: bold;
      font-size: 18px;
      padding: 8px 12px;
      border: 2px solid #1a1a1a;
      border-radius: 4px;
      letter-spacing: 2px;
      text-align: center;
      min-width: 120px;
      text-shadow: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    const finalCustomerName = customerName || email.split('@')[0];

    // Calculate coverage period in months and dates
    const coverageMonths = getCoverageInMonths(paymentType);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + coverageMonths);

    // Format dates
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Load the required PDF attachments
    const attachments = [];
    
    try {
      // Load Terms and Conditions PDF (updated to v2.2-7 for all warranty types)
      const termsPath = '/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-7.pdf';
      const termsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents${termsPath}`);
      if (termsResponse.ok) {
        const termsBuffer = await termsResponse.arrayBuffer();
        const termsBytes = new Uint8Array(termsBuffer);
        let termsBase64 = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < termsBytes.length; i += chunkSize) {
          const chunk = termsBytes.slice(i, i + chunkSize);
          termsBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        attachments.push({
          filename: 'Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-7.pdf',
          content: termsBase64,
          type: 'application/pdf'
        });
      }
      
      // Load Premium Extended Warranty Plan PDF (new standard for all warranty types)
      const premiumPath = '/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf';
      const premiumResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents${premiumPath}`);
      if (premiumResponse.ok) {
        const premiumBuffer = await premiumResponse.arrayBuffer();
        const premiumBytes = new Uint8Array(premiumBuffer);
        let premiumBase64 = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < premiumBytes.length; i += chunkSize) {
          const chunk = premiumBytes.slice(i, i + chunkSize);
          premiumBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        attachments.push({
          filename: 'Premium-Extended-Warranty-Plan-2.0.pdf',
          content: premiumBase64,
          type: 'application/pdf'
        });
      }
    } catch (error) {
      logStep("Warning: Could not load PDF attachments", error);
    }

    // Send welcome email directly using Resend
    const emailPayload = {
      from: resendFrom,
      to: [email],
      subject: `🎉 Congratulations — Your Buyawarranty.co.uk Protection is Now Registered!`,
      ...(attachments.length > 0 && { attachments }),
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #333333;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 20px; padding: 15px 0; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Buy A Warranty</h1>
            <p style="color: #5a6c7d; margin: 10px 0 0 0; font-size: 16px;">Your Buy-A-Warranty Protection is Now Registered</p>
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 22px; font-weight: 500;">Hi ${finalCustomerName},</h2>
            <p style="color: #5a6c7d; line-height: 1.6; margin: 0;">Thank you for choosing Buy A Warranty. Your vehicle protection is now registered and active. We're here to provide you with peace of mind on the road.</p>
          </div>

          <!-- Policy Details -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e9ecef;">
            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Your Policy Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; color: #5a6c7d; font-weight: 500;">Vehicle Registration:</td>
                <td style="padding: 10px 0; text-align: right;"><span style="${regPlateStyle}">${regPlate}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; color: #5a6c7d; font-weight: 500;">Plan Type:</td>
                <td style="padding: 10px 0; text-align: right; color: #2c3e50; font-weight: 600;">${planType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; color: #5a6c7d; font-weight: 500;">Policy Number:</td>
                <td style="padding: 10px 0; text-align: right; color: #2c3e50; font-weight: 600;">${policyNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; color: #5a6c7d; font-weight: 500;">Coverage Period:</td>
                <td style="padding: 10px 0; text-align: right; color: #2c3e50; font-weight: 600;">${formatDate(startDate)} - ${formatDate(endDate)}</td>
              </tr>
            </table>
            <div style="margin-top: 15px; padding: 12px; background-color: #fff8e1; border-radius: 6px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #2c3e50; font-weight: 600; line-height: 1.5;">
                📎 <strong>We've attached your documents to this email. Be sure to keep them somewhere safe so you can easily find them when you need them</strong>
              </p>
            </div>
          </div>

          <!-- Customer Portal Access -->
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #d4e6f1;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Your Customer Portal Access</h3>
            <p style="color: #5a6c7d; line-height: 1.6; margin-bottom: 15px;">Access your customer portal to view warranty details, submit claims, and manage your account:</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #d4e6f1; margin-bottom: 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #5a6c7d; font-weight: 500; width: 30%;">Login URL:</td>
                  <td style="padding: 6px 0;"><a href="https://buyawarranty.co.uk/customer-dashboard" style="color: #1a73e8; text-decoration: none;">https://buyawarranty.co.uk/customer-dashboard</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #5a6c7d; font-weight: 500;">Email:</td>
                  <td style="padding: 6px 0; color: #2c3e50; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #5a6c7d; font-weight: 500;">Password:</td>
                  <td style="padding: 6px 0;"><code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #2c3e50; border: 1px solid #e9ecef;">${tempPassword}</code></td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6c757d; font-size: 14px; margin: 0; font-style: italic;">Please change your password after your first login for security.</p>
          </div>

          <!-- Important Actions -->
          <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #ffe082;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Next Steps</h3>
            <ol style="color: #5a6c7d; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li><strong>Log into your customer portal</strong> using the credentials above</li>
              <li><strong>Download your warranty documents</strong> (attached to this email)</li>
              <li><strong>Save your policy number</strong> for future reference</li>
              <li><strong>Contact us</strong> if you have any questions about your coverage</li>
            </ol>
          </div>

           <!-- Warranty Documents -->
          <div style="margin: 15px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Your Premium Warranty Documents</h3>
            <p style="color: #5a6c7d; line-height: 1.6; margin-bottom: 10px;">Your premium warranty documents are attached to this email and also available for download:</p>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                📄 <a href="${planDocumentUrl}" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Your Premium Extended Warranty Policy</a>
              </li>
              <li style="margin-bottom: 8px; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                📋 <a href="${termsUrl}" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Terms and Conditions</a>
              </li>
            </ul>
          </div>

          <!-- Support Information -->
          <div style="text-align: center; margin: 15px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Need Help?</h3>
            <p style="color: #5a6c7d; margin-bottom: 15px;">Our customer service team is here to help:</p>
            <div style="margin-bottom: 10px;">
              <p style="margin: 5px 0;">📧 <strong>Customer support:</strong> <a href="mailto:support@buyawarranty.co.uk" style="color: #1a73e8; text-decoration: none; font-weight: 500;">support@buyawarranty.co.uk</a></p>
              <p style="margin: 5px 0;">📞 <strong>Customer support:</strong> <a href="tel:03302295040" style="color: #1a73e8; text-decoration: none; font-weight: 500;">0330 229 5040</a></p>
              <p style="margin: 5px 0;">📧 <strong>Claims line:</strong> <a href="mailto:claims@buyawarranty.co.uk" style="color: #1a73e8; text-decoration: none; font-weight: 500;">claims@buyawarranty.co.uk</a></p>
              <p style="margin: 5px 0;">📞 <strong>Claims line:</strong> <a href="tel:03302295045" style="color: #1a73e8; text-decoration: none; font-weight: 500;">0330 229 5045</a></p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
              Thank you for choosing buyawarranty.co.uk
            </p>
            <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
              Kind regards,<br>
              The Buy-A-Warranty Team
            </p>
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              <strong>buyawarranty.co.uk</strong><br>
              Your trusted warranty partner<br>
              <strong>Claims line:</strong> 0330 229 5045 | claims@buyawarranty.co.uk<br>
              <strong>Customer support:</strong> 0330 229 5040 | support@buyawarranty.co.uk
            </p>
          </div>
        </div>
      `
    };

    logStep("Sending email with attachments", { attachmentCount: attachments.length });
    
    if (attachments.length === 0) {
      logStep("WARNING: No PDF attachments loaded - email will be sent without documents");
    }
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      const emailResult = await response.json();

      if (!response.ok) {
        logStep("Email sending failed", { status: response.status, error: emailResult });
        throw new Error(`Email sending failed: ${emailResult.message || 'Unknown error'}`);
      }

      logStep("Welcome email sent successfully", emailResult);
    } catch (emailError) {
      logStep("Error sending welcome email", emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      throw new Error(`Email sending error: ${errorMessage}`);
    }

    // Schedule Trustpilot review emails according to new schedule
    try {
      const { data: feedbackTemplate, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('id')
        .eq('template_type', 'feedback')
        .eq('is_active', true)
        .single();

      if (feedbackTemplate && !templateError) {
        // Calculate first Tuesday at 10am after purchase
        const purchaseDate = new Date();
        const firstTuesday = getNextTuesday(purchaseDate);
        firstTuesday.setHours(10, 0, 0, 0); // Set to 10am

        // Schedule first review invitation
        const { error: scheduleError1 } = await supabaseClient
          .from('scheduled_emails')
          .insert({
            template_id: feedbackTemplate.id,
            customer_id: userId,
            recipient_email: email,
            scheduled_for: firstTuesday.toISOString(),
            metadata: {
              customerFirstName: finalCustomerName,
              expiryDate: calculatePolicyEndDate(paymentType),
              portalUrl: 'https://buyawarranty.co.uk/customer-dashboard',
              referralLink: `https://buyawarranty.co.uk/refer/${userId || 'guest'}`,
              emailType: 'first_invitation'
            }
          });

        if (scheduleError1) {
          logStep('Failed to schedule first Trustpilot email', { error: scheduleError1 });
        } else {
          logStep('First Trustpilot email scheduled successfully', { scheduledFor: firstTuesday });
        }

        // Calculate following Thursday at 6pm for reminder (only if no review left)
        const followingThursday = getFollowingThursday(firstTuesday);
        followingThursday.setHours(18, 0, 0, 0); // Set to 6pm

        // Get the reminder template
        const { data: reminderTemplate, error: reminderTemplateError } = await supabaseClient
          .from('email_templates')
          .select('id')
          .eq('template_type', 'feedback_reminder')
          .eq('is_active', true)
          .single();

        // Schedule reminder email if template exists
        if (reminderTemplate && !reminderTemplateError) {
          const { error: scheduleError2 } = await supabaseClient
            .from('scheduled_emails')
            .insert({
              template_id: reminderTemplate.id,
              customer_id: userId,
              recipient_email: email,
              scheduled_for: followingThursday.toISOString(),
              metadata: {
                customerFirstName: finalCustomerName,
                expiryDate: calculatePolicyEndDate(paymentType),
                portalUrl: 'https://buyawarranty.co.uk/customer-dashboard',
                referralLink: `https://buyawarranty.co.uk/refer/${userId || 'guest'}`,
                emailType: 'reminder'
              }
            });

          if (scheduleError2) {
            logStep('Failed to schedule reminder Trustpilot email', { error: scheduleError2 });
          } else {
            logStep('Reminder Trustpilot email scheduled successfully', { scheduledFor: followingThursday });
          }
        }
      }
    } catch (error) {
      logStep("Error scheduling Trustpilot emails", error);
      // Don't fail the whole process if scheduling fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email process completed",
      policyId: policyData.id,
      userId: userId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    let errorMessage = 'Unknown error';
    let errorDetails = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      errorMessage = String(error);
      errorDetails = error;
    }
    
    logStep("ERROR in send-welcome-email", errorDetails);
    console.error("Full error object:", JSON.stringify(errorDetails, null, 2));
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      details: errorDetails
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Centralized warranty duration utilities to ensure consistency across all systems
// This should be the single source of truth for warranty duration calculations

/**
 * Get warranty duration in months based on payment type
 * This is the MASTER function for warranty duration calculation
 */
function getWarrantyDurationInMonths(paymentType: string): number {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
    case '12months':
    case '12month':
    case 'yearly':
    case '1year':
    case 'year':
      return 12;
    case '24months':
    case '24month':
    case 'twomonthly':
    case '2monthly':
    case 'twoyearly':
    case '2year':
    case 'twoyear':
      return 24;
    case '36months':
    case '36month':
    case 'threemonthly':
    case '3monthly':
    case 'threeyearly':
    case '3year':
    case 'threeyear':
      return 36;
    case '48months':
    case '48month':
    case 'fourmonthly':
    case '4monthly':
      return 48;
    case '60months':
    case '60month':
    case 'fivemonthly':
    case '5monthly':
      return 60;
    default:
      console.warn(`[SEND-WELCOME-EMAIL] Unknown payment type: ${paymentType}, defaulting to 12 months`);
      return 12;
  }
}
// Helper function to get coverage period in months - updated to use centralized logic
function getCoverageInMonths(paymentType: string): number {
  return getWarrantyDurationInMonths(paymentType);
}

// Helper function to calculate policy end date - updated to use centralized logic
function calculatePolicyEndDate(paymentType: string): string {
  const startDate = new Date();
  const months = getWarrantyDurationInMonths(paymentType);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate.toISOString();
}

// Helper function to get next Tuesday after a given date
function getNextTuesday(fromDate: Date): Date {
  const result = new Date(fromDate);
  const dayOfWeek = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7; // 2 = Tuesday
  
  // If today is Tuesday, get next Tuesday
  if (daysUntilTuesday === 0) {
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + daysUntilTuesday);
  }
  
  return result;
}

// Helper function to get the Thursday following a given Tuesday
function getFollowingThursday(tuesday: Date): Date {
  const result = new Date(tuesday);
  result.setDate(result.getDate() + 2); // Tuesday + 2 days = Thursday
  return result;
}