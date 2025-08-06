
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

    const { email, planType, paymentType, policyNumber } = await req.json();
    logStep("Request data", { email, planType, paymentType, policyNumber });

    if (!email || !planType || !paymentType || !policyNumber) {
      throw new Error("Missing required parameters");
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    logStep("Generated temporary password");

    // Create user in Supabase Auth
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
      // If user already exists, that's okay - we'll just send them login details
      if (authError.message.includes('already registered')) {
        logStep("User already exists, updating password", { email });
        
        // Update existing user's password
        const { data: existingUser } = await supabaseClient.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === email);
        
        if (user) {
          await supabaseClient.auth.admin.updateUserById(user.id, {
            password: tempPassword
          });
          logStep("Updated existing user password");
        }
      } else {
        throw authError;
      }
    }

    // Create policy record
    const policyEndDate = calculatePolicyEndDate(paymentType);
    
    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .insert({
        user_id: authData?.user?.id || null,
        email: email,
        plan_type: planType.toLowerCase(),
        payment_type: paymentType,
        policy_number: policyNumber,
        policy_end_date: policyEndDate,
        status: 'active'
      })
      .select()
      .single();

    if (policyError) throw policyError;
    logStep("Created policy record", { policyId: policyData.id });

    // Record welcome email
    const { error: emailRecordError } = await supabaseClient
      .from('welcome_emails')
      .insert({
        user_id: authData?.user?.id || null,
        email: email,
        policy_id: policyData.id,
        temporary_password: tempPassword,
        email_sent_at: new Date().toISOString()
      });

    if (emailRecordError) {
      logStep("Warning: Failed to record welcome email", emailRecordError);
    }

    // Send actual welcome email using send-email function
    try {
      const emailVariables = {
        customerName: email.split('@')[0], // Use email prefix as name fallback
        planType: planType,
        policyNumber: policyNumber,
        loginEmail: email,
        temporaryPassword: tempPassword,
        loginUrl: `${req.headers.get("origin")}/auth`
      };

      const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
        body: {
          templateId: 'Welcome Email - Portal Signup',
          recipientEmail: email,
          variables: emailVariables
        }
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

    // Schedule feedback email for 3 days later
    try {
      const { data: feedbackTemplate, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('id')
        .eq('template_type', 'feedback')
        .eq('is_active', true)
        .single();

      if (feedbackTemplate && !templateError) {
        const feedbackDate = new Date();
        feedbackDate.setDate(feedbackDate.getDate() + 3);
        feedbackDate.setHours(10, 0, 0, 0); // Send at 10 AM

        const { error: scheduleError } = await supabaseClient
          .from('scheduled_emails')
          .insert({
            template_id: feedbackTemplate.id,
            customer_id: authData?.user?.id || null,
            recipient_email: email,
            scheduled_for: feedbackDate.toISOString(),
            metadata: {
              customerFirstName: email.split('@')[0],
              expiryDate: calculatePolicyEndDate(paymentType),
              portalUrl: 'https://buyawarranty.co.uk/customer-dashboard',
              referralLink: `https://buyawarranty.co.uk/refer/${authData?.user?.id || 'guest'}`
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-welcome-email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
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
      startDate.setFullYear(startDate.getFullYear() + 2);
      break;
    case 'threeYear':
      startDate.setFullYear(startDate.getFullYear() + 3);
      break;
    default:
      startDate.setMonth(startDate.getMonth() + 1);
  }
  
  return startDate.toISOString();
}
