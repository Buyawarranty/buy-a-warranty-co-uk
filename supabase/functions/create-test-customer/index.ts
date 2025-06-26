
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

    console.log("Starting test customer creation process...");

    // First, let's check what plan types exist in the database
    const { data: existingPlans } = await supabaseClient
      .from('plans')
      .select('name')
      .limit(5);
    
    console.log("Existing plans:", existingPlans);

    // Use a plan type that should exist - let's try lowercase first
    const planType = "basic";

    // First, delete any existing user with this email
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(user => user.email === testEmail);
    
    if (existingUser) {
      console.log("Deleting existing user:", existingUser.id);
      await supabaseClient.auth.admin.deleteUser(existingUser.id);
    }

    // Delete any existing customer records
    await supabaseClient
      .from('customers')
      .delete()
      .eq('email', testEmail);

    await supabaseClient
      .from('customer_policies')
      .delete()
      .eq('email', testEmail);

    console.log("Creating new auth user...");
    
    // Create the auth user with explicit email confirmation
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: "Test Customer"
      }
    });

    if (authError) {
      console.error("Auth creation error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user - no user data returned");
    }

    console.log("Auth user created successfully:", authData.user.id);

    // Create customer record - try with lowercase plan type
    const { data: customerData, error: customerError } = await supabaseClient
      .from('customers')
      .insert({
        name: "Test Customer",
        email: testEmail,
        registration_plate: "TEST123",
        plan_type: planType,
        status: "Active"
      })
      .select()
      .single();

    if (customerError) {
      console.error("Customer creation error:", customerError);
      throw customerError;
    }

    console.log("Customer record created successfully");

    // Create a customer policy - try with lowercase plan type
    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .insert({
        user_id: authData.user.id,
        email: testEmail,
        plan_type: planType,
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

    if (policyError) {
      console.error("Policy creation error:", policyError);
      throw policyError;
    }

    console.log("Policy created successfully");

    // Verify the user can actually sign in
    const { data: signInTest, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.error("Sign in test failed:", signInError);
      throw new Error(`Created user but sign in test failed: ${signInError.message}`);
    }

    console.log("Sign in test successful");

    return new Response(JSON.stringify({
      success: true,
      message: "Test customer created and verified successfully",
      credentials: {
        email: testEmail,
        password: testPassword
      },
      customer: customerData,
      policy: policyData,
      auth_user_id: authData.user.id,
      available_plans: existingPlans
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating test customer:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create test customer",
      details: error
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
