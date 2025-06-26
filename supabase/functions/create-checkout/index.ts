
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const { planId, paymentType, vehicleData } = await req.json();
    logStep("Request data", { planId, paymentType, vehicleData });

    // Try to get authenticated user, but don't fail if not authenticated
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Define pricing based on plan and payment type
    const pricingMap: { [key: string]: { [key: string]: number } } = {
      basic: {
        monthly: 3100, // £31.00 in pence
        yearly: 38100, // £381.00 in pence
        twoYear: 72500, // £725.00 in pence
        threeYear: 105000, // £1050.00 in pence
      },
      gold: {
        monthly: 3400, // £34.00 in pence
        yearly: 40900, // £409.00 in pence
        twoYear: 77700, // £777.00 in pence
        threeYear: 112500, // £1125.00 in pence
      },
      platinum: {
        monthly: 3600, // £36.00 in pence
        yearly: 43700, // £437.00 in pence
        twoYear: 83100, // £831.00 in pence
        threeYear: 120000, // £1200.00 in pence
      }
    };

    const amount = pricingMap[planId]?.[paymentType];
    if (!amount) {
      throw new Error(`Invalid plan or payment type: ${planId}, ${paymentType}`);
    }

    // Create recurring interval based on payment type
    let interval: 'month' | 'year';
    let intervalCount = 1;
    
    if (paymentType === 'monthly') {
      interval = 'month';
      intervalCount = 1;
    } else if (paymentType === 'yearly') {
      interval = 'year';
      intervalCount = 1;
    } else if (paymentType === 'twoYear') {
      interval = 'year';
      intervalCount = 2;
    } else if (paymentType === 'threeYear') {
      interval = 'year';
      intervalCount = 3;
    } else {
      throw new Error(`Invalid payment type: ${paymentType}`);
    }

    logStep("Creating checkout session", { amount, interval, intervalCount, customerEmail });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: `${planId.toUpperCase()} warranty plan - ${paymentType} billing`
            },
            unit_amount: amount,
            recurring: { 
              interval: interval,
              interval_count: intervalCount
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/thank-you?plan=${planId}&payment=${paymentType}`,
      cancel_url: `${req.headers.get("origin")}/`,
      // Custom branding
      custom_text: {
        submit: {
          message: 'Your BuyAWarranty protection starts immediately after payment'
        }
      },
      metadata: {
        plan_type: planId,
        payment_type: paymentType,
        user_id: user?.id || 'guest',
        vehicle_reg: vehicleData?.regNumber || '',
        vehicle_mileage: vehicleData?.mileage || '',
        customer_name: vehicleData?.fullName || '',
        customer_phone: vehicleData?.phone || '',
        customer_address: vehicleData?.address || ''
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
