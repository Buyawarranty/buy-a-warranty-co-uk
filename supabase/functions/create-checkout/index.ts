
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

    const body = await req.json();
    const { planId, planName, paymentType, vehicleData } = body;
    logStep("Request data", { planId, planName, paymentType, vehicleData });
    
    // Use planName for pricing lookup (basic, gold, platinum)
    const planType = planName.toLowerCase();

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
    const { voluntaryExcess = 0 } = body;
    
    // Get pricing data
    const periodData = pricingTable[paymentType as keyof typeof pricingTable] || pricingTable.yearly;
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
    const planData = excessData[planType as keyof typeof excessData];
    
    if (!planData) {
      throw new Error(`Invalid plan configuration: ${planType} for ${paymentType} with ${voluntaryExcess} excess`);
    }

    // For Stripe checkout (fallback), charge the FULL amount for the entire duration
    const amount = planData.total * 100; // Convert to pence

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    logStep("Creating one-time payment session for fallback", { amount, customerEmail, origin });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan`,
              description: `Vehicle warranty coverage - Full ${paymentType} payment for ${vehicleData?.regNumber || 'vehicle'}`
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment for fallback
      success_url: `${origin}/thank-you?plan=${planId}&payment=${paymentType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      automatic_tax: { enabled: false },
      billing_address_collection: 'required',
      customer_creation: customerId ? undefined : 'always',
      phone_number_collection: { enabled: true },
      // Remove SMS verification requirements
      consent_collection: {
        terms_of_service: 'none',
      },
      // Custom branding
      custom_text: {
        submit: {
          message: 'Your BuyAWarranty protection starts immediately after payment'
        }
      },
      metadata: {
        plan_type: planType,
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
