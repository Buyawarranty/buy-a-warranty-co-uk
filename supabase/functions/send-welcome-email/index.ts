
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

    // In a real implementation, you would send the actual email here using a service like Resend
    // For now, we'll just log the email content
    const emailContent = `
      Welcome to BuyAWarranty!
      
      Your ${planType} warranty is now active.
      Policy Number: ${policyNumber}
      
      Login Details:
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      Please visit your customer dashboard to:
      - View your policy details
      - Download your policy document
      - Update your password
      - Manage your account
      
      Login at: ${req.headers.get("origin")}/auth
      
      Best regards,
      The BuyAWarranty Team
    `;

    logStep("Email content generated", { emailLength: emailContent.length });

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
