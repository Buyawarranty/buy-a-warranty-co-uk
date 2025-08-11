import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TEST-AUTOMATED-EMAIL] ${step}${detailsStr}`);
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
    logStep("Test automated email function started");

    const { testEmail, planType = "basic", paymentType = "monthly" } = await req.json();
    
    if (!testEmail) {
      throw new Error("testEmail is required");
    }

    // Ensure test email is safe (contains "test" or uses a test domain)
    const safeTestPatterns = ['test', '@example.com', '@test.com', '+test@', '@mailinator.com'];
    const isSafeEmail = safeTestPatterns.some(pattern => testEmail.toLowerCase().includes(pattern));
    
    if (!isSafeEmail) {
      throw new Error("For safety, test email must contain 'test' or use a known test domain");
    }

    logStep("Using test email", { testEmail, planType, paymentType });

    // Generate test warranty reference
    const testWarrantyRef = `TEST-${Date.now()}`;
    
    // Create test customer record
    const testCustomer = {
      name: "Test Customer",
      email: testEmail,
      phone: "01234567890",
      first_name: "Test",
      last_name: "Customer",
      street: "123 Test Street",
      town: "Test Town",
      postcode: "TE5T 1NG",
      country: "United Kingdom",
      plan_type: planType,
      payment_type: paymentType,
      stripe_session_id: `test_${Date.now()}`,
      registration_plate: "TEST123",
      vehicle_make: "TEST",
      vehicle_model: "Test Model",
      vehicle_year: "2020",
      status: "Active",
      warranty_reference_number: testWarrantyRef
    };

    logStep("Creating test customer", { email: testEmail });

    const { data: customerData, error: customerError } = await supabaseClient
      .from('customers')
      .upsert(testCustomer, { onConflict: 'email' })
      .select()
      .single();

    if (customerError) {
      throw new Error(`Failed to create test customer: ${customerError.message}`);
    }

    logStep("Test customer created", { customerId: customerData.id });

    // Wait a moment to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create test policy record
    const testPolicy = {
      customer_id: customerData.id,
      email: testEmail,
      plan_type: planType.toLowerCase(),
      payment_type: paymentType,
      policy_number: testWarrantyRef,
      policy_start_date: new Date().toISOString(),
      policy_end_date: calculatePolicyEndDate(paymentType),
      status: 'active',
      email_sent_status: 'pending'
    };

    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .upsert(testPolicy, { onConflict: 'policy_number' })
      .select()
      .single();

    if (policyError) {
      throw new Error(`Failed to create test policy: ${policyError.message}`);
    }

    logStep("Test policy created", { policyId: policyData.id });

    // Wait another moment for consistency
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now test the automated email system by calling send-welcome-email-manual
    logStep("Testing automated email system", { 
      customerId: customerData.id, 
      policyId: policyData.id 
    });

    const emailPayload = {
      customerId: customerData.id,
      policyId: policyData.id
    };

    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-welcome-email-manual', {
      body: emailPayload
    });

    if (emailError) {
      logStep("Email test failed", emailError);
      
      // Update policy to reflect failure
      await supabaseClient
        .from('customer_policies')
        .update({ email_sent_status: 'failed' })
        .eq('id', policyData.id);
        
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email test failed",
        details: emailError,
        customerId: customerData.id,
        policyId: policyData.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Email test successful", emailResult);

    // Update policy to reflect success
    await supabaseClient
      .from('customer_policies')
      .update({ 
        email_sent_status: 'sent',
        email_sent_at: new Date().toISOString()
      })
      .eq('id', policyData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Automated email test completed successfully",
      testResults: {
        customerId: customerData.id,
        policyId: policyData.id,
        testEmail: testEmail,
        warrantyNumber: testWarrantyRef,
        emailResult: emailResult
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in test-automated-email", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function calculatePolicyEndDate(paymentType: string): string {
  const now = new Date();
  switch (paymentType) {
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'two_yearly':
      now.setFullYear(now.getFullYear() + 2);
      break;
    case 'three_yearly':
      now.setFullYear(now.getFullYear() + 3);
      break;
    default:
      now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}