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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { sessionId, planId, paymentType } = await req.json();
    logStep("Request data", { sessionId, planId, paymentType });

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
      fullName: session.metadata?.customer_name || '',
      phone: session.metadata?.customer_phone || '',
      address: session.metadata?.customer_address || '',
      email: session.customer_email || session.customer_details?.email || ''
    };

    const customerData = {
      fullName: session.metadata?.customer_name || '',
      phone: session.metadata?.customer_phone || '',
      address: session.metadata?.customer_address || ''
    };

    logStep("Extracted vehicle and customer data", { vehicleData, customerData });

    // Call handle-successful-payment with the extracted data
    const { data: paymentData, error: paymentError } = await supabaseClient.functions.invoke('handle-successful-payment', {
      body: {
        planId: planId,
        paymentType: paymentType,
        userEmail: vehicleData.email,
        userId: session.metadata?.user_id || null,
        stripeSessionId: sessionId,
        vehicleData: vehicleData,
        customerData: customerData
      }
    });

    if (paymentError) {
      logStep("Error processing payment", paymentError);
      throw new Error(`Payment processing failed: ${paymentError.message}`);
    }

    logStep("Payment processed successfully", paymentData);

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