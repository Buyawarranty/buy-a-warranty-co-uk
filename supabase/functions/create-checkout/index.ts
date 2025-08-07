
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

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { planName, paymentType, voluntaryExcess = 0, vehicleData, customerData, discountCode, finalAmount } = body;
    logStep("Request data", { planName, paymentType, voluntaryExcess, discountCode, finalAmount });
    
    // Use planName for pricing lookup (basic, gold, platinum)
    const planType = planName?.toLowerCase() || 'basic';

    // Get authenticated user
    let user = null;
    // Prioritize email from customer form data over authenticated user email
    let customerEmail = customerData?.email || vehicleData?.email || "guest@buyawarranty.co.uk";
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader !== "Bearer null") {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        logStep("User authenticated", { userId: user.id, userEmail: user.email, formEmail: customerData?.email });
        // Only use authenticated user email if no email provided in form
        if (!customerData?.email && !vehicleData?.email && user?.email) {
          customerEmail = user.email;
        }
      } catch (authError) {
        logStep("Auth failed, proceeding as guest", { error: authError });
      }
    } else {
      logStep("No auth header, proceeding as guest checkout");
    }

    logStep("Using customer email", { email: customerEmail, source: customerData?.email ? 'form' : (user?.email ? 'auth' : 'guest') });

    // Use final amount if provided, otherwise calculate from pricing table
    let totalAmount = finalAmount;
    
    if (!totalAmount) {
      // Fallback to pricing calculation if finalAmount not provided
      const pricingTable = {
        yearly: {
          0: { basic: 372, gold: 408, platinum: 437 },
          50: { basic: 348, gold: 372, platinum: 384 },
          100: { basic: 300, gold: 324, platinum: 348 },
          150: { basic: 276, gold: 312, platinum: 324 },
          200: { basic: 240, gold: 276, platinum: 300 }
        },
        two_yearly: {
          0: { basic: 670, gold: 734, platinum: 786 },
          50: { basic: 626, gold: 670, platinum: 691 },
          100: { basic: 540, gold: 583, platinum: 626 },
          150: { basic: 497, gold: 562, platinum: 583 },
          200: { basic: 456, gold: 528, platinum: 552 }
        },
        three_yearly: {
          0: { basic: 982, gold: 1077, platinum: 1153 },
          50: { basic: 919, gold: 982, platinum: 1014 },
          100: { basic: 792, gold: 855, platinum: 919 },
          150: { basic: 729, gold: 824, platinum: 855 },
          200: { basic: 672, gold: 792, platinum: 828 }
        }
      };

      // Get pricing data
      const periodData = pricingTable[paymentType as keyof typeof pricingTable] || pricingTable.yearly;
      const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
      const baseAmount = excessData[planType as keyof typeof excessData] || excessData.basic;
      
      // Apply 5% discount for upfront Stripe payments (already applied in frontend)
      totalAmount = baseAmount;
    }

    logStep("Using total amount", { totalAmount, source: finalAmount ? 'provided' : 'calculated' });
    
    // Convert to pence for Stripe
    const amount = totalAmount * 100;

    logStep("Calculated amount", { totalAmount, amount, planType, paymentType, voluntaryExcess });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://pricing.buyawarranty.co.uk";
    
    // Prepare session creation options
    const sessionOptions: any = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan`,
              description: `Vehicle warranty coverage - Full payment with 5% discount${discountCode ? ` + discount code applied` : ''}`
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/thank-you?plan=${planType}&payment=${paymentType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/car-journey?step=4`,
      automatic_tax: { enabled: false },
      billing_address_collection: 'required',
      customer_creation: customerId ? undefined : 'always',
    };

    const session = await stripe.checkout.sessions.create(sessionOptions);

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
