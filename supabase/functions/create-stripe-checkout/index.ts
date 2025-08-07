import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${timestamp} ${step}${detailsStr}`);
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

    const body = await req.json();
    const { planId, vehicleData, paymentType, voluntaryExcess = 0, customerData, discountCode, finalAmount } = body;
    logStep("Request data", { planId, vehicleData, paymentType, voluntaryExcess, discountCode, finalAmount });

    // Get plan data from database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    logStep("Fetching plan data", { planId });
    const { data: planData, error: planError } = await supabaseService
      .from('plans')
      .select('*')
      .eq('name', planId.toLowerCase())
      .maybeSingle();
    
    if (planError) {
      logStep("Plan fetch error", { planId, error: planError });
      throw new Error(`Database error fetching plan: ${planError.message}`);
    }
    
    if (!planData) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const planType = planData.name.toLowerCase();
    logStep("Using plan type", { planId, planType });

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

    // Calculate pricing based on payment type and voluntary excess
    let totalAmount = finalAmount;
    
    if (!totalAmount) {
      // Use plan pricing with voluntary excess calculation
      const basePrices = {
        monthly: planData.monthly_price,
        yearly: planData.yearly_price,
        twoYear: planData.two_yearly_price,
        threeYear: planData.three_yearly_price
      };

      const basePrice = basePrices[paymentType as keyof typeof basePrices] || planData.monthly_price;
      
      // Apply voluntary excess discount (5% off for every £50 excess)
      const discountPercent = Math.min(voluntaryExcess / 50 * 5, 25); // Cap at 25% discount
      totalAmount = basePrice * (1 - discountPercent / 100);
    }

    logStep("Calculated pricing", { totalAmount, paymentType, voluntaryExcess });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const origin = req.headers.get("origin") || "https://pricing.buyawarranty.co.uk";
    
    // Check if customer exists in Stripe
    let stripeCustomerId = null;
    if (customerEmail !== "guest@buyawarranty.co.uk") {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        logStep("Found existing Stripe customer", { customerId: stripeCustomerId });
      }
    }

    // Create line items
    const lineItems = [{
      price_data: {
        currency: "gbp",
        product_data: { 
          name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan - ${paymentType.replace(/([A-Z])/g, ' $1').trim()}`,
          description: `Vehicle Registration: ${vehicleData?.regNumber || customerData?.vehicle_reg || 'N/A'}`
        },
        unit_amount: Math.round(totalAmount * 100), // Convert to pence
      },
      quantity: 1,
    }];

    // Apply discount code if provided
    let coupon = null;
    if (discountCode) {
      try {
        const coupons = await stripe.coupons.list({ limit: 100 });
        coupon = coupons.data.find(c => c.name === discountCode && c.valid);
        if (coupon) {
          logStep("Applied discount code", { discountCode, couponId: coupon.id });
        }
      } catch (couponError) {
        logStep("Failed to apply discount code", { discountCode, error: couponError });
      }
    }

    // Create checkout session
    const sessionData: any = {
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/thank-you?plan=${planType}&payment=${paymentType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?step=4`,
      metadata: {
        plan_type: planType,
        payment_type: paymentType,
        vehicle_reg: vehicleData?.regNumber || customerData?.vehicle_reg || '',
        voluntary_excess: voluntaryExcess.toString(),
        customer_email: customerEmail,
        original_amount: totalAmount.toString()
      }
    };

    if (coupon) {
      sessionData.discounts = [{ coupon: coupon.id }];
    }

    // Add customer data to metadata if available
    if (customerData) {
      sessionData.metadata = {
        ...sessionData.metadata,
        customer_name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim(),
        customer_phone: customerData.mobile || '',
        customer_address: `${customerData.building_number || ''} ${customerData.street || ''}, ${customerData.town || ''}, ${customerData.postcode || ''}`.trim()
      };
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    
    logStep("Stripe checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      amount: totalAmount,
      paymentType
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      source: 'stripe'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-stripe-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});