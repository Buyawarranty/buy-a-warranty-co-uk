
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const testEmail = "test@customer.com";
    const testPassword = "password123";

    // Create the auth user
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    // Create customer record
    const { data: customerData, error: customerError } = await supabaseClient
      .from('customers')
      .upsert({
        name: "Test Customer",
        email: testEmail,
        registration_plate: "TEST123",
        plan_type: "basic",
        status: "Active"
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // Create a customer policy
    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .upsert({
        user_id: authData?.user?.id,
        email: testEmail,
        plan_type: "basic",
        payment_type: "monthly",
        policy_number: "TEST-POLICY-001",
        policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        address: {
          street: "123 Test Street",
          city: "Test City",
          postcode: "TEST123",
          country: "United Kingdom"
        }
      })
      .select()
      .single();

    if (policyError) throw policyError;

    return new Response(JSON.stringify({
      success: true,
      message: "Test customer created successfully",
      credentials: {
        email: testEmail,
        password: testPassword
      },
      customer: customerData,
      policy: policyData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating test customer:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create test customer" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
