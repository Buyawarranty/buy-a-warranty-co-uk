
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BUMPER-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const body = await req.json();
    const { planId, planName, vehicleData, paymentType: originalPaymentType } = body;
    logStep("Request data", { planId, planName, vehicleData, originalPaymentType });
    
    // CRITICAL: Bumper only accepts monthly payments, regardless of user selection
    const paymentType = 'monthly'; // Force monthly for Bumper credit checks
    logStep("Forcing monthly payment for Bumper", { originalSelection: originalPaymentType, forcedPaymentType: paymentType });
    
    // Use planName for pricing lookup (basic, gold, platinum)
    const planType = planName.toLowerCase();

    // Get authenticated user
    let user = null;
    let customerEmail = vehicleData?.email || "guest@buyawarranty.com";
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader !== "Bearer null") {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        if (user?.email) {
          customerEmail = user.email;
          logStep("User authenticated", { userId: user.id, email: user.email });
        }
      } catch (authError) {
        logStep("Auth failed, proceeding as guest", { error: authError });
      }
    } else {
      logStep("No auth header, proceeding as guest checkout");
    }

    // Define pricing structure matching the frontend pricing table
    const pricingTable = {
      monthly: {
        0: { basic: { monthly: 31, total: 31 }, gold: { monthly: 34, total: 34 }, platinum: { monthly: 36, total: 36 } },
        50: { basic: { monthly: 29, total: 29 }, gold: { monthly: 31, total: 31 }, platinum: { monthly: 32, total: 32 } },
        100: { basic: { monthly: 25, total: 25 }, gold: { monthly: 27, total: 27 }, platinum: { monthly: 29, total: 29 } },
        150: { basic: { monthly: 23, total: 23 }, gold: { monthly: 26, total: 26 }, platinum: { monthly: 27, total: 27 } },
        200: { basic: { monthly: 20, total: 20 }, gold: { monthly: 23, total: 23 }, platinum: { monthly: 25, total: 25 } }
      },
      yearly: {
        0: { basic: { monthly: 31, total: 372 }, gold: { monthly: 34, total: 408 }, platinum: { monthly: 36, total: 437 } },
        50: { basic: { monthly: 29, total: 348 }, gold: { monthly: 31, total: 372 }, platinum: { monthly: 32, total: 384 } },
        100: { basic: { monthly: 25, total: 300 }, gold: { monthly: 27, total: 324 }, platinum: { monthly: 29, total: 348 } },
        150: { basic: { monthly: 23, total: 276 }, gold: { monthly: 26, total: 312 }, platinum: { monthly: 27, total: 324 } },
        200: { basic: { monthly: 20, total: 240 }, gold: { monthly: 23, total: 276 }, platinum: { monthly: 25, total: 300 } }
      },
      two_yearly: {
        0: { basic: { monthly: 56, total: 670 }, gold: { monthly: 61, total: 734 }, platinum: { monthly: 65, total: 786 } },
        50: { basic: { monthly: 52, total: 626 }, gold: { monthly: 56, total: 670 }, platinum: { monthly: 58, total: 691 } },
        100: { basic: { monthly: 45, total: 540 }, gold: { monthly: 49, total: 583 }, platinum: { monthly: 52, total: 626 } },
        150: { basic: { monthly: 41, total: 497 }, gold: { monthly: 47, total: 562 }, platinum: { monthly: 49, total: 583 } },
        200: { basic: { monthly: 38, total: 456 }, gold: { monthly: 44, total: 528 }, platinum: { monthly: 46, total: 552 } }
      },
      three_yearly: {
        0: { basic: { monthly: 82, total: 982 }, gold: { monthly: 90, total: 1077 }, platinum: { monthly: 96, total: 1153 } },
        50: { basic: { monthly: 77, total: 919 }, gold: { monthly: 82, total: 982 }, platinum: { monthly: 84, total: 1014 } },
        100: { basic: { monthly: 66, total: 792 }, gold: { monthly: 71, total: 855 }, platinum: { monthly: 77, total: 919 } },
        150: { basic: { monthly: 61, total: 729 }, gold: { monthly: 69, total: 824 }, platinum: { monthly: 71, total: 855 } },
        200: { basic: { monthly: 56, total: 672 }, gold: { monthly: 66, total: 792 }, platinum: { monthly: 69, total: 828 } }
      }
    };

    // Extract payment details - FORCE MONTHLY for Bumper regardless of user choice
    const forcedPaymentType = 'monthly'; // Bumper only accepts monthly
    const { voluntaryExcess = 0 } = body;
    logStep("Payment configuration", { userSelected: originalPaymentType, forcedForBumper: forcedPaymentType, voluntaryExcess });
    
    // Get pricing data - use monthly pricing for Bumper
    const periodData = pricingTable['monthly'] || pricingTable.yearly; // Always use monthly for Bumper
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
    const planData = excessData[planType as keyof typeof excessData];
    
    if (!planData) {
      throw new Error(`Invalid plan configuration: ${planType} for ${paymentType} with ${voluntaryExcess} excess`);
    }

    // For Bumper: Always use monthly amount for 30-day payment periods (credit checks)
    const monthlyAmount = planData.monthly;

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    logStep("Creating Bumper checkout - ALWAYS MONTHLY for credit check", { 
      monthlyAmount, 
      customerEmail, 
      origin, 
      originalUserSelection: originalPaymentType,
      forcedBumperPayment: 'monthly'
    });

    // Prepare Bumper API request
    const bumperApiKey = Deno.env.get("BUMPER_API_KEY");
    const bumperSecretKey = Deno.env.get("BUMPER_SECRET_KEY");
    
    logStep("Checking Bumper credentials", { 
      hasApiKey: !!bumperApiKey, 
      hasSecretKey: !!bumperSecretKey,
      apiKeyLength: bumperApiKey?.length || 0,
      secretKeyLength: bumperSecretKey?.length || 0
    });
    
    if (!bumperApiKey || !bumperSecretKey) {
      logStep("CRITICAL: Missing Bumper credentials - falling back to Stripe", { 
        BUMPER_API_KEY: bumperApiKey ? "PRESENT" : "MISSING",
        BUMPER_SECRET_KEY: bumperSecretKey ? "PRESENT" : "MISSING"
      });
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        fallbackReason: "missing_credentials",
        originalPaymentType: originalPaymentType,
        fallbackPaymentType: "yearly",
        error: "Bumper credentials not configured, redirecting to alternative payment" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Bumper checkout session - always 30-day payment period for credit checks
    const bumperPayload = {
      amount: monthlyAmount,
      currency: "GBP",
      payment_period: "30_days", // Explicit 30-day period for Bumper credit checks
      customer: {
        email: customerEmail,
        name: vehicleData?.fullName || '',
        phone: vehicleData?.phone || '',
        address: vehicleData?.address || ''
      },
      metadata: {
        plan_type: planType,
        payment_type: 'monthly', // Always monthly for Bumper credit check
        original_payment_type: paymentType, // Store original user selection
        user_id: user?.id || 'guest',
        vehicle_reg: vehicleData?.regNumber || '',
        vehicle_mileage: vehicleData?.mileage || ''
      },
      success_url: `${origin}/thank-you?plan=${planId}&payment=monthly&source=bumper`,
      cancel_url: `${origin}/`,
      failure_url: `${origin}/payment-fallback?plan=${planId}&email=${encodeURIComponent(customerEmail)}&original_payment=${paymentType}`
    };

    logStep("Sending request to Bumper API", { amount: monthlyAmount, customerEmail });

    // Use customer data from the new form step
    const customerData = body.customerData;
    
    if (!customerData) {
      logStep("No customer data provided, falling back to Stripe");
      return new Response(JSON.stringify({ 
        fallbackToStripe: true, 
        fallbackReason: "No customer data provided for Bumper credit check"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const bumperRequestData = {
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      mobile: customerData.mobile,
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.street || "",
      town: customerData.town,
      county: customerData.county,
      postcode: customerData.postcode,
      country: customerData.country,
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      order_reference: `plan_${planId}`,
      customer_reference: `plan_${planId}`,
      invoice_number: `plan_${planId}`,
      amount: monthlyAmount.toString(),
      currency: "GBP",
      success_url: `${origin}/thank-you?plan=${planId}&payment=monthly&source=bumper`,
      failure_url: `${origin}/payment-fallback?plan=${planId}&email=${encodeURIComponent(customerEmail)}&original_payment=${originalPaymentType}`,
      preferred_product_type: 'paylater',
      api_key: bumperApiKey
    };

    logStep("Bumper payload prepared", { ...bumperRequestData });

    // Generate signature exactly like the WordPress plugin
    const signature = await generateSignature(bumperRequestData, bumperSecretKey);
    bumperRequestData.signature = signature;

    logStep("Making Bumper API request", { url: "https://api.demo.bumper.co/v2/apply/", amount: monthlyAmount });

    const bumperResponse = await fetch("https://api.demo.bumper.co/v2/apply/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bumperRequestData)
    });

    logStep("Bumper API response received", { 
      status: bumperResponse.status, 
      statusText: bumperResponse.statusText,
      ok: bumperResponse.ok
    });

    let bumperData;
    const responseText = await bumperResponse.text();
    console.log("Raw Bumper API response:", responseText);
    
    try {
      if (responseText) {
        bumperData = JSON.parse(responseText);
        console.log("Bumper API response data:", bumperData);
      } else {
        console.log("Empty response from Bumper API");
        logStep("Bumper API returned empty response - credit check likely failed", { 
          status: bumperResponse.status
        });
        
        return new Response(JSON.stringify({ 
          fallbackToStripe: true,
          fallbackReason: "credit_check_failed",
          originalPaymentType: paymentType,
          fallbackPaymentType: "yearly",
          error: "Credit check failed, redirecting to yearly payment option" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (parseError) {
      console.log("Failed to parse Bumper API response as JSON:", parseError);
      
      logStep("Bumper API returned invalid JSON - credit check failed", { 
        status: bumperResponse.status,
        responseText: responseText.substring(0, 500) // Limit log size
      });
      
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        fallbackReason: "credit_check_failed",
        originalPaymentType: paymentType,
        fallbackPaymentType: "yearly",
        error: "Credit check failed, redirecting to yearly payment option" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Bumper API response", { status: bumperResponse.status, data: bumperData });

    if (!bumperResponse.ok) {
      logStep("Bumper API rejected - credit check failed", { 
        status: bumperResponse.status,
        error: bumperData,
        statusText: bumperResponse.statusText
      });
      
      // Return fallback flag to trigger Stripe checkout on frontend
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        fallbackReason: "credit_check_failed",
        originalPaymentType: paymentType,
        fallbackPaymentType: "yearly",
        error: "Credit check failed, redirecting to yearly payment option" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (bumperData?.data?.redirect_url) {
      logStep("Bumper application created successfully", { redirect_url: bumperData.data.redirect_url, token: bumperData.token });
      
      return new Response(JSON.stringify({ 
        url: bumperData.data.redirect_url,
        token: bumperData.token,
        source: 'bumper'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error("No redirect URL received from Bumper");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-bumper-checkout", { message: errorMessage });
    
    // On any error, fallback to Stripe with yearly payment
    return new Response(JSON.stringify({ 
      fallbackToStripe: true,
      fallbackReason: "credit_check_failed",
      originalPaymentType: originalPaymentType || "monthly",
      fallbackPaymentType: "yearly",
      error: "Credit check failed, redirecting to yearly payment option"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// Generate signature exactly like the WordPress plugin
async function generateSignature(payload: any, secretKey: string): Promise<string> {
  // Keys to exclude from signature (from WordPress plugin)
  const excludedKeys = [
    'api_key',
    'signature', 
    'product_description',
    'preferred_product_type',
    'additional_data'
  ];

  // Filter payload to exclude those keys
  const filteredPayload: any = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!excludedKeys.includes(key)) {
      filteredPayload[key] = value;
    }
  }

  // Sort keys alphabetically
  const sortedKeys = Object.keys(filteredPayload).sort();

  // Build signature string
  let signatureString = '';
  for (const key of sortedKeys) {
    signatureString += key.toUpperCase() + '=' + filteredPayload[key] + '&';
  }

  // Generate HMAC SHA-256 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const data = encoder.encode(signatureString);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
