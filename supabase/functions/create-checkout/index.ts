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
    const { planName, paymentType, voluntaryExcess = 0, vehicleData, customerData, discountCode } = body;
    logStep("Request data", { planName, paymentType, voluntaryExcess, discountCode });
    
    // Use planName for pricing lookup (basic, gold, platinum)
    const planType = planName?.toLowerCase() || 'basic';

    // Get authenticated user
    let user = null;
    let customerEmail = "guest@buyawarranty.co.uk"; // Default fallback
    
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

    // Use customer email from request data if provided, otherwise use authenticated user email
    if (vehicleData?.email) {
      customerEmail = vehicleData.email;
      logStep("Using customer email from vehicle data", { email: customerEmail });
    } else if (customerData?.email) {
      customerEmail = customerData.email;
      logStep("Using customer email from customer data", { email: customerEmail });
    }

    // Define pricing structure matching the frontend pricing table
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
    
    // Apply 5% discount for upfront Stripe payments
    let totalAmount = Math.round(baseAmount * 0.95); // 5% discount
    
    // Handle discount code if provided
    let discountData = null;
    if (discountCode) {
      logStep("Validating discount code", { discountCode, customerEmail, baseAmount: totalAmount });
      
      const { data: validationResult, error: validationError } = await supabaseService.functions.invoke('validate-discount-code', {
        body: {
          code: discountCode,
          customerEmail: customerEmail,
          orderAmount: totalAmount
        }
      });

      if (validationError) {
        logStep("Discount code validation error", { error: validationError });
      } else if (validationResult?.valid) {
        discountData = validationResult;
        totalAmount = validationResult.finalAmount;
        logStep("Discount applied", { 
          originalAmount: baseAmount * 0.95, 
          discountAmount: validationResult.discountAmount,
          finalAmount: totalAmount 
        });
      } else {
        logStep("Invalid discount code", { code: discountCode, error: validationResult?.error });
      }
    }
    
    // Convert to pence for Stripe
    const amount = totalAmount * 100;

    logStep("Calculated amount", { baseAmount, totalAmount, amount, planType, paymentType, voluntaryExcess, discountApplied: !!discountData });

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

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    
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
              description: `Vehicle warranty coverage - Full ${paymentType} payment (5% discount applied)${discountData ? ` + ${discountData.discountCode.code} discount` : ''}`
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/thank-you?plan=${planType}&payment=${paymentType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      automatic_tax: { enabled: false },
      billing_address_collection: 'required',
      customer_creation: customerId ? undefined : 'always',
    };

    // Add discount coupon if available
    if (discountData?.discountCode?.stripe_coupon_id) {
      sessionOptions.discounts = [{
        coupon: discountData.discountCode.stripe_coupon_id
      }];
      logStep("Applied Stripe coupon", { couponId: discountData.discountCode.stripe_coupon_id });
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Record discount code usage if discount was applied
    if (discountData && discountData.valid) {
      try {
        await supabaseService.from('discount_code_usage').insert({
          discount_code_id: discountData.discountCode.id,
          customer_email: customerEmail,
          order_amount: baseAmount * 0.95,
          discount_amount: discountData.discountAmount,
          stripe_session_id: session.id
        });
        
        // Increment usage count
        await supabaseService.from('discount_codes')
          .update({ used_count: discountData.discountCode.used_count + 1 })
          .eq('id', discountData.discountCode.id);
          
        logStep("Discount usage recorded", { discountCodeId: discountData.discountCode.id });
      } catch (error) {
        logStep("Failed to record discount usage", { error });
      }
    }

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