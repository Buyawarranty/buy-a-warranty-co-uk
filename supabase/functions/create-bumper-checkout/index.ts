
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

    const body = await req.json();
    const { planId, planName, vehicleData } = body;
    logStep("Request data", { planId, planName, vehicleData });
    
    // Use planName for pricing lookup (basic, gold, platinum)
    const planType = planName.toLowerCase();

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

    // Define pricing structure matching the frontend pricing table
    const pricingTable = {
      yearly: {
        0: { basic: { monthly: 31, total: 372 }, gold: { monthly: 34, total: 408 }, platinum: { monthly: 36, total: 437 } },
        50: { basic: { monthly: 29, total: 348 }, gold: { monthly: 31, total: 372 }, platinum: { monthly: 32, total: 384 } },
        100: { basic: { monthly: 25, total: 300 }, gold: { monthly: 27, total: 324 }, platinum: { monthly: 29, total: 348 } },
        150: { basic: { monthly: 23, total: 276 }, gold: { monthly: 26, total: 312 }, platinum: { monthly: 27, total: 324 } },
        200: { basic: { monthly: 20, total: 240 }, gold: { monthly: 23, total: 276 }, platinum: { monthly: 25, total: 300 } }
      },
      two_yearly: {
        0: { basic: { monthly: 56, total: 670 }, gold: { monthly: 61, total: 734 }, platinum: { monthly: 65, total: 786 } },
        50: { basic: { monthly: 52, total: 626 }, gold: { monthly: 56, total: 670 }, platinum: { monthly: 58, total: 691 } },
        100: { basic: { monthly: 45, total: 540 }, gold: { monthly: 49, total: 583 }, platinum: { monthly: 52, total: 626 } },
        150: { basic: { monthly: 41, total: 497 }, gold: { monthly: 47, total: 562 }, platinum: { monthly: 49, total: 583 } },
        200: { basic: { monthly: 38, total: 456 }, gold: { monthly: 44, total: 528 }, platinum: { monthly: 46, total: 552 } }
      },
      three_yearly: {
        0: { basic: { monthly: 82, total: 982 }, gold: { monthly: 90, total: 1077 }, platinum: { monthly: 96, total: 1153 } },
        50: { basic: { monthly: 77, total: 919 }, gold: { monthly: 82, total: 982 }, platinum: { monthly: 84, total: 1014 } },
        100: { basic: { monthly: 66, total: 792 }, gold: { monthly: 71, total: 855 }, platinum: { monthly: 77, total: 919 } },
        150: { basic: { monthly: 61, total: 729 }, gold: { monthly: 69, total: 824 }, platinum: { monthly: 71, total: 855 } },
        200: { basic: { monthly: 56, total: 672 }, gold: { monthly: 66, total: 792 }, platinum: { monthly: 69, total: 828 } }
      }
    };

    // Extract payment details from request body
    const { paymentType = 'yearly', voluntaryExcess = 0 } = body;
    
    // Get pricing data
    const periodData = pricingTable[paymentType as keyof typeof pricingTable] || pricingTable.yearly;
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
    const planData = excessData[planType as keyof typeof excessData];
    
    if (!planData) {
      throw new Error(`Invalid plan configuration: ${planType} for ${paymentType} with ${voluntaryExcess} excess`);
    }

    const monthlyAmount = planData.monthly;

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    logStep("Creating Bumper checkout", { monthlyAmount, customerEmail, origin });

    // Prepare Bumper API request
    const bumperApiKey = Deno.env.get("BUMPER_API_KEY");
    const bumperSecretKey = Deno.env.get("BUMPER_SECRET_KEY");
    
    if (!bumperApiKey || !bumperSecretKey) {
      throw new Error("Bumper API credentials not configured");
    }

    // Create Bumper checkout session
    const bumperPayload = {
      amount: monthlyAmount,
      currency: "GBP",
      customer: {
        email: customerEmail,
        name: vehicleData?.fullName || '',
        phone: vehicleData?.phone || '',
        address: vehicleData?.address || ''
      },
      metadata: {
        plan_type: planType,
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
