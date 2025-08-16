import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerData, discountCode, totalAmount } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists in Stripe
    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create line items for each warranty
    const lineItems = items.map((item: any, index: number) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.planName} Warranty - Vehicle ${index + 1}`,
          description: `${item.vehicleData.regNumber} - ${item.paymentType} coverage`,
          metadata: {
            vehicle_reg: item.vehicleData.regNumber,
            plan_name: item.planName,
            payment_type: item.paymentType,
          },
        },
        unit_amount: Math.round(item.totalPrice * 100), // Convert to pence
      },
      quantity: 1,
    }));

    // Apply discount if provided
    let coupon;
    if (discountCode) {
      try {
        // Validate discount code first
        const { data: discountData, error: discountError } = await supabaseClient.functions.invoke('validate-discount-code', {
          body: {
            code: discountCode,
            customerEmail: customerData.email,
            orderAmount: totalAmount
          }
        });

        if (!discountError && discountData.valid) {
          // Create or retrieve Stripe coupon
          if (discountData.discountCode.stripe_coupon_id) {
            coupon = discountData.discountCode.stripe_coupon_id;
          }
        }
      } catch (error) {
        console.log('Discount validation failed:', error);
        // Continue without discount
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerData.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?step=cart`,
      discounts: coupon ? [{ coupon }] : undefined,
      metadata: {
        customer_email: customerData.email,
        customer_name: `${customerData.first_name} ${customerData.last_name}`,
        item_count: items.length.toString(),
        is_multi_warranty: "true",
      },
      // Store essential data in session metadata (Stripe has 500 char limit per field)
      payment_intent_data: {
        metadata: {
          warranty_count: items.length.toString(),
          customer_email: customerData.email,
          discount_code: discountCode || "",
          first_reg: items[0]?.vehicleData?.regNumber?.substring(0, 20) || "",
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating multi-warranty checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});