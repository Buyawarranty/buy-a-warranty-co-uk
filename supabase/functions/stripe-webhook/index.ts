import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
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
    logStep("Webhook request received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature (you'll need to set STRIPE_WEBHOOK_SECRET)
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Processing completed checkout session", { 
        sessionId: session.id,
        customerEmail: session.customer_email,
        mode: session.mode,
        paymentStatus: session.payment_status
      });

      // Only process if payment was successful
      if (session.payment_status === "paid") {
        // Extract metadata to determine the plan and payment type
        const planId = session.metadata?.plan_id;
        const paymentType = session.metadata?.payment_type;
        
        if (planId && paymentType) {
          // Call the existing process-stripe-success function
          const { data: processData, error: processError } = await supabaseClient.functions.invoke('process-stripe-success', {
            body: {
              sessionId: session.id,
              planId: planId,
              paymentType: paymentType
            }
          });

          if (processError) {
            logStep("Error processing payment via process-stripe-success", processError);
            throw new Error(`Payment processing failed: ${processError.message}`);
          }

          logStep("Payment processed successfully via webhook", processData);
        } else {
          logStep("Warning: Missing plan_id or payment_type in session metadata", {
            planId,
            paymentType,
            metadata: session.metadata
          });
        }
      } else {
        logStep("Payment not completed, skipping processing", { 
          paymentStatus: session.payment_status 
        });
      }
    }

    // Handle subscription events if needed
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      logStep("Invoice payment succeeded", { 
        invoiceId: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription
      });
      
      // Handle subscription payment success if needed
    }

    // Return success response
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe webhook", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});