
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BUMPER-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planId, vehicleData } = await req.json();
    logStep("Request data", { planId, vehicleData });

    // Get authenticated user
    let user = null;
    let customerEmail = vehicleData?.email || "guest@buyawarranty.com";
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader !== "Bearer null") {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        if (user?.email) {
          customerEmail = user.email;
          logStep("User authenticated", { userId: user.id, email: user.email });
        }
      } catch (authError) {
        logStep("Auth failed, proceeding as guest", { error: authError });
      }
    } else {
      logStep("No auth header, proceeding as guest checkout");
    }

    // Define pricing for monthly payments only
    const monthlyPricing: { [key: string]: number } = {
      basic: 31.00,
      gold: 34.00,
      platinum: 36.00
    };

    const amount = monthlyPricing[planId];
    if (!amount) {
      throw new Error(`Invalid plan for monthly payment: ${planId}`);
    }

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    logStep("Creating Bumper checkout", { amount, customerEmail, origin });

    // Prepare Bumper API request
    const bumperApiKey = Deno.env.get("BUMPER_API_KEY");
    const bumperSecretKey = Deno.env.get("BUMPER_SECRET_KEY");
    
    if (!bumperApiKey || !bumperSecretKey) {
      throw new Error("Bumper API credentials not configured");
    }

    // Create Bumper checkout session
    const bumperPayload = {
      amount: amount,
      currency: "GBP",
      customer: {
        email: customerEmail,
        name: vehicleData?.fullName || '',
        phone: vehicleData?.phone || '',
        address: vehicleData?.address || ''
      },
      metadata: {
        plan_type: planId,
        payment_type: 'monthly',
        user_id: user?.id || 'guest',
        vehicle_reg: vehicleData?.regNumber || '',
        vehicle_mileage: vehicleData?.mileage || ''
      },
      success_url: `${origin}/thank-you?plan=${planId}&payment=monthly&source=bumper`,
      cancel_url: `${origin}/`,
      failure_url: `${origin}/payment-fallback?plan=${planId}&email=${encodeURIComponent(customerEmail)}`
    };

    logStep("Sending request to Bumper API", { payload: bumperPayload });

    // Make request to Bumper API
    const bumperResponse = await fetch("https://api.bumper.co/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bumperApiKey}`,
        "X-Secret-Key": bumperSecretKey
      },
      body: JSON.stringify(bumperPayload)
    });

    const bumperData = await bumperResponse.json();
    logStep("Bumper API response", { status: bumperResponse.status, data: bumperData });

    if (!bumperResponse.ok) {
      logStep("Bumper API rejected, falling back to Stripe", { error: bumperData });
      
      // Return fallback flag to trigger Stripe checkout on frontend
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        error: "Payment method not available, redirecting to alternative payment" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (bumperData?.checkout_url) {
      logStep("Bumper checkout session created", { url: bumperData.checkout_url });
      
      return new Response(JSON.stringify({ 
        url: bumperData.checkout_url,
        source: 'bumper'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error("No checkout URL received from Bumper");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-bumper-checkout", { message: errorMessage });
    
    // On any error, fallback to Stripe
    return new Response(JSON.stringify({ 
      fallbackToStripe: true,
      error: "Payment processing error, redirecting to alternative payment"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
