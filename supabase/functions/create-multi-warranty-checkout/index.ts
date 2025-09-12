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
    const { items, customerData, discountCode, originalAmount, finalAmount } = await req.json();

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

    // Get user from auth header (optional)
    let user: any = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
      } catch (e) {
        console.log("Auth header present but failed to parse user:", e);
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let customerId: string | undefined;
    const lookupEmail = user?.email || customerData?.email;
    if (lookupEmail) {
      const customers = await stripe.customers.list({ email: lookupEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: lookupEmail,
          name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim(),
          phone: customerData.mobile || undefined,
        });
        customerId = created.id;
      }
    }

    // Create line items for each warranty with detailed metadata
    const lineItems = items.map((item: any, index: number) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${item.planName} Warranty - ${item.vehicleData.regNumber}`,
          description: `${item.vehicleData.regNumber} - ${item.paymentType} coverage`,
          metadata: {
            vehicle_reg: item.vehicleData.regNumber,
            plan_name: item.planName,
            payment_type: item.paymentType,
            vehicle_make: item.vehicleData.make || '',
            vehicle_model: item.vehicleData.model || '',
            vehicle_year: item.vehicleData.year || '',
            vehicle_fuel_type: item.vehicleData.fuelType || '',
            vehicle_transmission: item.vehicleData.transmission || '',
            vehicle_mileage: item.vehicleData.mileage || '',
            vehicle_type: item.vehicleData.vehicleType || 'standard',
            voluntary_excess: item.voluntaryExcess?.toString() || '0',
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
            orderAmount: originalAmount || finalAmount
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
      success_url: `${req.headers.get("origin") || 'https://buyawarranty.co.uk'}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || 'https://buyawarranty.co.uk'}/?step=cart`,
      discounts: coupon ? [{ coupon }] : undefined,
      metadata: {
        customer_email: customerData.email,
        customer_name: `${customerData.first_name} ${customerData.last_name}`,
        customer_first_name: customerData.first_name,
        customer_last_name: customerData.last_name,
        customer_phone: customerData.mobile || '',
        customer_street: customerData.street || '',
        customer_town: customerData.town || '',
        customer_county: customerData.county || '',
        customer_postcode: customerData.postcode || '',
        customer_country: customerData.country || 'United Kingdom',
        customer_building_name: customerData.building_name || '',
        customer_flat_number: customerData.flat_number || '',
        customer_building_number: customerData.building_number || '',
        item_count: items.length.toString(),
        is_multi_warranty: "true",
        discount_code: discountCode || "",
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