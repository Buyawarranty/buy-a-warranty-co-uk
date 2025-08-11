
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
      throw new Error("Missing required parameters");
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    logStep("Generated temporary password");

    // Check if user already exists first
    let userId = null;
    let userAlreadyExists = false;
    
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      logStep("User already exists", { userId: existingUser.id });
      userId = existingUser.id;
      userAlreadyExists = true;
      
      // Update existing user's password
      await supabaseClient.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });
      logStep("Updated existing user password and metadata");
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });

      if (authError) {
        throw authError;
      }
      
      userId = authData.user.id;
      logStep("Created new user", { userId });
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
        status: 'active'
      }, {
        onConflict: 'policy_number'
      })
      .select()
      .single();

    if (policyError) throw policyError;
    logStep("Created policy record", { policyId: policyData.id });

    // Record welcome email
    const { error: emailRecordError } = await supabaseClient
      .from('welcome_emails')
      .insert({
        user_id: userId,
        email: email,
        policy_id: policyData.id,
        temporary_password: tempPassword,
        email_sent_at: new Date().toISOString()
      });

    if (emailRecordError) {
      logStep("Warning: Failed to record welcome email", emailRecordError);
    }

    // Map plan types to document URLs
    const planDocumentUrls: Record<string, string> = {
      'basic': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/basic/Basic-Cover-Warranty-Plan-Buyawarranty%202.0-1754464740490.pdf',
      'Basic': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/basic/Basic-Cover-Warranty-Plan-Buyawarranty%202.0-1754464740490.pdf',
      'gold': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/gold/Gold-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464758473.pdf',
      'Gold': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/gold/Gold-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464758473.pdf',
      'platinum': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf',
      'Platinum': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf',
      'electric': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/electric/EV-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464859338.pdf',
      'Electric vehicle ev extended warranty': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/electric/EV-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464859338.pdf',
      'phev': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'PHEV Hybrid Extended Warranty': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'Phev hybrid extended warranty': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'hybrid': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf',
      'motorbike': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/motorbike/Motorbike-Extended-Warranty-Plan%202.0-1754464869722.pdf',
      'Motorbike Extended Warranty': 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/motorbike/Motorbike-Extended-Warranty-Plan%202.0-1754464869722.pdf'
    };

    // Get the plan document URL
    const planDocumentUrl = planDocumentUrls[planType] || planDocumentUrls[planType.toLowerCase()];
    const termsAndConditionsUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/terms-and-conditions/Terms%20and%20conditions-1754666518644.pdf';
    
    logStep("Document URLs determined", { planType, planDocumentUrl, termsAndConditionsUrl });

    // Send actual welcome email using send-email function
    try {
      const emailVariables = {
        customerName: customerName || email.split('@')[0], // Use provided name or email prefix as fallback
        customer_name: customerName || email.split('@')[0], // Additional variable for compatibility
        planType: planType,
        policyNumber: policyNumber,
        registrationPlate: registrationPlate || 'Not provided',
        vehicle_registration: registrationPlate || 'Not provided',
        loginEmail: email,
        temporaryPassword: tempPassword,
        loginUrl: 'https://buyawarranty.co.uk/auth',
        portalLink: 'https://buyawarranty.co.uk/auth',
        loginLink: 'https://buyawarranty.co.uk/auth',
        planDocumentUrl: planDocumentUrl,
        termsAndConditionsUrl: termsAndConditionsUrl
      };

      const emailPayload: any = {
        templateId: 'welcome',
        recipientEmail: email,
        variables: emailVariables
      };

      logStep("Email payload prepared", { variables: emailVariables });

      const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
        body: emailPayload
      });

      if (emailError) {
        logStep("Error sending welcome email", emailError);
        // Don't fail the whole process if email fails
      } else {
        logStep("Welcome email sent successfully", emailResult);
      }
    } catch (error) {
      logStep("Error invoking send-email function", error);
      // Don't fail the whole process if email fails
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
              customerFirstName: email.split('@')[0],
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
      temporaryPassword: tempPassword, // For testing purposes - remove in production
      policyId: policyData.id
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

// Helper function to calculate policy end date
function calculatePolicyEndDate(paymentType: string): string {
  const startDate = new Date();
  
  switch (paymentType) {
    case 'monthly':
      startDate.setMonth(startDate.getMonth() + 1);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() + 1);
      break;
    case 'twoYear':
    case 'two_yearly': // Handle both formats for compatibility
      startDate.setFullYear(startDate.getFullYear() + 2);
      break;
    case 'threeYear':
    case 'three_yearly': // Handle both formats for compatibility
      startDate.setFullYear(startDate.getFullYear() + 3);
      break;
    default:
      startDate.setMonth(startDate.getMonth() + 1);
  }
  
  return startDate.toISOString();
}
