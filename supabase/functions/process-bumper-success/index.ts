import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-BUMPER-SUCCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { planId, paymentType } = await req.json();
    logStep("Processing Bumper payment", { planId, paymentType });

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      logStep("Plan not found", { planId, error: planError });
      throw new Error("Plan not found");
    }

    logStep("Plan retrieved", { planName: plan.name, planType: plan.name.toLowerCase() });

    // Generate policy number
    const policyNumber = `POL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    logStep("Generated policy number", { policyNumber });

    // For Bumper payments, we use guest email since they handle the customer collection
    const guestEmail = "guest@buyawarranty.com";
    
    // Create customer record
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .insert({
        name: "Bumper Customer", // Bumper will have collected this, but we don't have access here
        email: guestEmail,
        plan_type: plan.name,
        status: 'Active',
        registration_plate: null // Will be updated when we have access to vehicle details
      })
      .select()
      .single();

    if (customerError) {
      logStep("Error creating customer", { error: customerError });
      throw new Error("Failed to create customer record");
    }

    logStep("Customer created", { customerId: customer.id });

    // Calculate policy dates
    const startDate = new Date();
    let endDate = new Date();
    
    switch (paymentType) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'twoYear':
        endDate.setFullYear(endDate.getFullYear() + 2);
        break;
      case 'threeYear':
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create policy record
    const { data: policy, error: policyError } = await supabaseClient
      .from('customer_policies')
      .insert({
        user_id: null, // No user account for Bumper payments
        email: guestEmail,
        plan_type: plan.name,
        payment_type: paymentType,
        policy_number: policyNumber,
        policy_start_date: startDate.toISOString(),
        policy_end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (policyError) {
      logStep("Error creating policy", { error: policyError });
      throw new Error("Failed to create policy record");
    }

    logStep("Policy created", { policyId: policy.id, policyNumber });

    // Create payment record (amount will be monthly since Bumper forces monthly)
    const monthlyPrice = plan.monthly_price;
    
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        customer_id: customer.id,
        amount: monthlyPrice,
        plan_type: plan.name,
        currency: 'GBP',
        stripe_payment_id: null // No Stripe ID for Bumper payments
      });

    if (paymentError) {
      logStep("Error creating payment record", { error: paymentError });
      // Don't throw here as the main policy creation succeeded
    }

    logStep("Payment record created");

    // Send welcome email
    try {
      await supabaseClient.functions.invoke('send-welcome-email', {
        body: {
          email: guestEmail,
          policyNumber: policyNumber,
          planType: plan.name,
          customerName: "Valued Customer"
        }
      });
      logStep("Welcome email sent");
    } catch (emailError) {
      logStep("Welcome email failed", { error: emailError });
      // Don't throw as the main process succeeded
    }

    return new Response(JSON.stringify({
      success: true,
      policyNumber: policyNumber,
      planType: plan.name,
      message: "Payment processed successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-bumper-success", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});