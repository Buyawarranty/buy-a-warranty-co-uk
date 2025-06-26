
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-PAYMENT] ${step}${detailsStr}`);
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

    const { planId, paymentType, userEmail, userId } = await req.json();
    logStep("Request data", { planId, paymentType, userEmail, userId });

    if (!planId || !paymentType || !userEmail) {
      throw new Error("Missing required parameters");
    }

    // Generate policy number
    const policyNumber = await generatePolicyNumber();
    logStep("Generated policy number", { policyNumber });

    // Send welcome email with login details
    const { data: welcomeData, error: welcomeError } = await supabaseClient.functions.invoke('send-welcome-email', {
      body: {
        email: userEmail,
        planType: planId,
        paymentType: paymentType,
        policyNumber: policyNumber
      }
    });

    if (welcomeError) {
      logStep("Warning: Welcome email failed", welcomeError);
    } else {
      logStep("Welcome email sent successfully", welcomeData);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed and welcome email sent",
      policyNumber: policyNumber
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in handle-successful-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Generate unique policy number
async function generatePolicyNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `POL-${year}${month}${day}-${random}`;
}
