import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANUAL-BUMPER-COMPLETION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Manual Bumper completion started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, notes } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Processing manual completion for", { email, hasNotes: !!notes });

    // Get customer and policy data
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (customerError || !customer) {
      throw new Error("Customer not found");
    }

    const { data: policy, error: policyError } = await supabaseClient
      .from('customer_policies')
      .select('*')
      .eq('email', email)
      .single();

    if (policyError || !policy) {
      throw new Error("Policy not found");
    }

    logStep("Customer and policy found", { 
      customerId: customer.id, 
      policyNumber: policy.policy_number,
      planType: policy.plan_type 
    });

    // Check if already sent to Warranties 2000
    if (policy.warranties_2000_status === 'sent') {
      logStep("DUPLICATE PREVENTED: Policy already sent to Warranties 2000", {
        policyNumber: policy.policy_number,
        status: policy.warranties_2000_status,
        sentAt: policy.warranties_2000_sent_at
      });
      return new Response(JSON.stringify({
        success: false,
        error: "This policy has already been sent to Warranties 2000",
        customerName: customer.name,
        policyNumber: policy.policy_number,
        previouslySentAt: policy.warranties_2000_sent_at
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Generate warranty reference
    let warrantyRef = null;
    try {
      warrantyRef = await generateWarrantyReference();
      logStep("Generated warranty reference", { warrantyRef });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStep("Failed to generate warranty reference", { error: errorMessage });
    }

    // Register with Warranties 2000
    if (warrantyRef) {
      try {
        logStep("Sending to Warranties 2000 via send-to-warranties-2000 function");
        
        // Use the send-to-warranties-2000 function which has proper data mapping
        const { data: w2kData, error: w2kError } = await supabaseClient.functions.invoke(
          'send-to-warranties-2000',
          {
            body: {
              customerId: customer.id,
              policyId: policy.id,
              force: true
            }
          }
        );

        if (w2kError) {
          throw w2kError;
        }

        logStep("Successfully registered with Warranties 2000", { response: w2kData });
      } catch (warrantiesError) {
        const errorMessage = warrantiesError instanceof Error ? warrantiesError.message : String(warrantiesError);
        logStep("Error during Warranties 2000 registration", { error: errorMessage });
      }
    }

    // Send welcome email
    try {
      const welcomeEmailResponse = await supabaseClient.functions.invoke('send-welcome-email', {
        body: {
          email: customer.email,
          policyNumber: policy.policy_number,
          planType: policy.plan_type,
          paymentType: policy.payment_type || 'yearly', // Required parameter
          customerName: customer.name
        }
      });
      
      if (welcomeEmailResponse.error) {
        logStep("Welcome email failed", { error: welcomeEmailResponse.error });
      } else {
        logStep("Welcome email sent successfully", welcomeEmailResponse.data);
      }
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      logStep("Welcome email failed", { error: errorMessage });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Manual completion processed",
      customerName: customer.name,
      policyNumber: policy.policy_number
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in manual completion", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function for warranty reference
async function generateWarrantyReference(): Promise<string> {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabaseClient.rpc('get_next_warranty_serial');
    
    if (error || !data) {
      console.error('Failed to get warranty serial:', error);
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const timestamp = now.getTime().toString().slice(-6);
      return `BAW-${year}${month}-${timestamp}`;
    }

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    return `BAW-${year}${month}-${data}`;
  } catch (error) {
    console.error('Error generating warranty reference:', error);
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `BAW-${year}${month}-${timestamp}`;
  }
}