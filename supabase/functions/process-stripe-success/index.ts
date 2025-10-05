import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-STRIPE-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - method: " + req.method);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let requestBody;
    try {
      const bodyText = await req.text();
      logStep("Raw request body", { bodyText });
      requestBody = JSON.parse(bodyText);
      logStep("Parsed request body", requestBody);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      logStep("Error parsing request body", { error: errorMessage });
      throw new Error(`Invalid JSON in request body: ${errorMessage}`);
    }

    const { sessionId, planId, paymentType } = requestBody;
    logStep("Extracted parameters", { sessionId, planId, paymentType });

    if (!sessionId || !planId || !paymentType) {
      throw new Error("Missing required parameters");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Retrieve the checkout session with expanded customer data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer']
    });

    logStep("Retrieved Stripe session", { 
      sessionId: session.id,
      customerEmail: session.customer_email,
      metadata: session.metadata 
    });

    if (!session || session.payment_status !== 'paid') {
      throw new Error("Payment not completed or session not found");
    }

    // Extract customer and vehicle data from session metadata
    const vehicleData = {
      regNumber: session.metadata?.vehicle_reg || '',
      mileage: session.metadata?.vehicle_mileage || '',
      make: session.metadata?.vehicle_make || '',
      model: session.metadata?.vehicle_model || '',
      year: session.metadata?.vehicle_year || '',
      fuelType: session.metadata?.vehicle_fuel_type || '',
      transmission: session.metadata?.vehicle_transmission || '',
      vehicleType: session.metadata?.vehicle_type || 'standard',
      voluntaryExcess: parseInt(session.metadata?.voluntary_excess || '0'),
      fullName: session.metadata?.customer_name || '',
      phone: session.metadata?.customer_phone || '',
      address: `${session.metadata?.customer_street || ''} ${session.metadata?.customer_town || ''} ${session.metadata?.customer_county || ''} ${session.metadata?.customer_postcode || ''}`.trim(),
      email: session.customer_email || session.customer_details?.email || session.metadata?.customer_email || ''
    };

    const customerData = {
      first_name: session.metadata?.customer_first_name || '',
      last_name: session.metadata?.customer_last_name || '',
      mobile: session.metadata?.customer_phone || '',
      street: session.metadata?.customer_street || '',
      town: session.metadata?.customer_town || '',
      county: session.metadata?.customer_county || '',
      postcode: session.metadata?.customer_postcode || '',
      country: session.metadata?.customer_country || 'United Kingdom',
      building_name: session.metadata?.customer_building_name || '',
      flat_number: session.metadata?.customer_flat_number || '',
      building_number: session.metadata?.customer_building_number || '',
      vehicle_reg: session.metadata?.vehicle_reg || '',
      discount_code: session.metadata?.discount_code || '',
      final_amount: parseFloat(session.metadata?.final_amount || '0'),
      fullName: session.metadata?.customer_name || '',
      phone: session.metadata?.customer_phone || '',
      address: `${session.metadata?.customer_street || ''}, ${session.metadata?.customer_town || ''}, ${session.metadata?.customer_county || ''}, ${session.metadata?.customer_postcode || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',').trim()
    };

    logStep("Extracted vehicle and customer data", { vehicleData, customerData });

    // Call handle-successful-payment with the extracted data (WITH email sending)
    const { data: paymentData, error: paymentError } = await supabaseClient.functions.invoke('handle-successful-payment', {
      body: {
        planId: session.metadata?.plan_id || planId,
        paymentType: session.metadata?.payment_type || paymentType,
        userEmail: vehicleData.email,
        userId: session.metadata?.user_id || null,
        stripeSessionId: sessionId,
        vehicleData: vehicleData,
        customerData: customerData,
        claimLimit: parseInt(session.metadata?.claim_limit || '1250'),
        voluntaryExcess: parseInt(session.metadata?.voluntary_excess || '0'),
        metadata: session.metadata || {}
        // Removed skipEmail: true to allow emails to be sent
      }
    });

    if (paymentError) {
      logStep("Error processing payment", paymentError);
      throw new Error(`Payment processing failed: ${paymentError.message}`);
    }

    logStep("Payment processed successfully", paymentData);

    // Email is already handled by handle-successful-payment function
    logStep("Email already sent via handle-successful-payment", { 
      customerId: paymentData?.customerId, 
      policyId: paymentData?.policyId
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed and warranty registered successfully",
      policyNumber: paymentData?.policyNumber,
      data: paymentData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-stripe-success", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});