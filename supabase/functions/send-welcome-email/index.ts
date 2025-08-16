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

    // Generate temporary password
    const tempPassword = generateTempPassword();
    logStep("Generated temporary password");

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
      logStep("Updated existing user password and metadata");
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
      logStep("User created successfully", { userId, email });
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
    const resendFrom = Deno.env.get('RESEND_FROM') || 'Buy A Warranty <support@buyawarranty.co.uk>';
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Map plan types to document URLs
    const planDocumentUrls: Record<string, string> = {
      'basic': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/basic/Basic-Cover-Warranty-Plan-Buyawarranty%202.0-1754464740490.pdf',
      'gold': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/gold/Gold-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464758473.pdf',
      'platinum': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf',
      'electric': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/electric/EV-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464859338.pdf',
      'phev': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'hybrid': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'motorbike': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/motorbike/Motorbike-Extended-Warranty-Plan%202.0-1754464869722.pdf'
    };

    // Get the plan document URL
    const planKey = planType.toLowerCase();
    const planDocumentUrl = planDocumentUrls[planKey] || planDocumentUrls['basic']; // Default to basic
    const termsUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/terms-and-conditions/Terms%20and%20conditions-1754666518644.pdf';
    
    logStep("Document URLs determined", { planType, planDocumentUrl, termsUrl });

    // Registration plate styling
    const regPlate = registrationPlate || 'N/A';
    const regPlateStyle = `
      display: inline-block;
      background: linear-gradient(to bottom, #ffeb3b 0%, #ffeb3b 30%, #fff 30%, #fff 70%, #ffeb3b 70%, #ffeb3b 100%);
      color: #000;
      font-family: 'Charles Wright', monospace;
      font-weight: bold;
      font-size: 18px;
      padding: 8px 12px;
      border: 2px solid #333;
      border-radius: 4px;
      letter-spacing: 2px;
      text-align: center;
      min-width: 120px;
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

    // Send welcome email directly using Resend
    const emailPayload = {
      from: resendFrom,
      to: [email],
      subject: `🎉 Congratulations — Your Buyawarranty.co.uk Protection is Now Registered! ✅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Hi ${finalCustomerName},</h1>
            <h2 style="color: #28a745; margin-bottom: 20px;">Congratulations on your new warranty! 🎉 We're excited to have you covered and ready to enjoy peace of mind.</h2>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">Your Policy Details</h3>
            <p><strong>Vehicle Registration:</strong> <span style="${regPlateStyle}">${regPlate}</span></p>
            <p><strong>Plan Type:</strong> ${planType}</p>
            <p><strong>Policy Number:</strong> ${policyNumber}</p>
            <p><strong>Policy Start Date:</strong> ${formatDate(startDate)}</p>
            <p><strong>Policy End Date:</strong> ${formatDate(endDate)}</p>
            <p><strong>Cover Period:</strong> ${coverageMonths} months</p>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin-top: 0;">Your Customer Portal Access</h3>
            <p>Access your customer portal to view your warranty details, submit claims, and manage your account:</p>
            <p><strong>Login URL:</strong> <a href="https://buyawarranty.co.uk/auth" style="color: #007bff;">https://buyawarranty.co.uk/auth</a></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #f1f1f1; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              <em>Please change your password after your first login for security.</em>
            </p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #333;">Your Warranty Documents</h3>
            <p>You can download your warranty documents from the links below:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;">
                📄 <a href="${planDocumentUrl}" style="color: #007bff; text-decoration: none;">Your ${planType} Warranty Policy</a>
              </li>
              <li style="margin-bottom: 10px;">
                📋 <a href="${termsUrl}" style="color: #007bff; text-decoration: none;">Terms and Conditions</a>
              </li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #333; margin-top: 0;">Important Next Steps</h3>
            <ol>
              <li><strong>Log into your portal</strong> using the credentials above</li>
              <li><strong>Download and save your warranty documents</strong></li>
              <li><strong>Keep your policy number</strong> handy for any future correspondence</li>
              <li><strong>Contact us</strong> if you have any questions about your coverage</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #333;">Need Help?</h3>
            <p>Our customer service team is here to help you:</p>
            <p>📧 Email: <a href="mailto:info@buyawarranty.co.uk" style="color: #007bff;">info@buyawarranty.co.uk</a></p>
            <p>📞 Phone: <a href="tel:+442045713400" style="color: #007bff;">+44 204 571 3400</a></p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Thank you for choosing Buy A Warranty for your vehicle protection needs.
            </p>
            <p style="color: #666; font-size: 12px;">
              Buy A Warranty Ltd, 1 Knightsbridge, London, SW1X 7LX
            </p>
          </div>
        </div>
      `
    };

    logStep("Sending email directly via Resend");
    
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
      throw new Error(`Email sending error: ${emailError.message}`);
    }

    // Schedule feedback email for 1 hour later
    try {
      const { data: feedbackTemplate, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('id')
        .eq('template_type', 'feedback')
        .eq('is_active', true)
        .single();

      if (feedbackTemplate && !templateError) {
        const feedbackDate = new Date();
        feedbackDate.setHours(feedbackDate.getHours() + 1); // Send 1 hour after purchase

        const { error: scheduleError } = await supabaseClient
          .from('scheduled_emails')
          .insert({
            template_id: feedbackTemplate.id,
            customer_id: userId,
            recipient_email: email,
            scheduled_for: feedbackDate.toISOString(),
            metadata: {
              customerFirstName: finalCustomerName,
              expiryDate: calculatePolicyEndDate(paymentType),
              portalUrl: 'https://buyawarranty.co.uk/customer-dashboard',
              referralLink: `https://buyawarranty.co.uk/refer/${userId || 'guest'}`
            }
          });

        if (scheduleError) {
          logStep('Failed to schedule feedback email', { error: scheduleError });
        } else {
          logStep('Feedback email scheduled successfully', { scheduledFor: feedbackDate });
        }
      }
    } catch (error) {
      logStep("Error scheduling feedback email", error);
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
      return 12;
    case '24months':
    case '24month':
    case 'twomonthly':
    case '2monthly':
    case 'twoyear':
    case 'yearly': // Legacy compatibility
      return 24;
    case '36months':
    case '36month':
    case 'threemonthly':
    case '3monthly':
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
      console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
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