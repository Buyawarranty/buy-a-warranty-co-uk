
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BUMPER-CHECKOUT] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body = await req.json();
    const { planId, vehicleData, paymentType: originalPaymentType, voluntaryExcess = 0, customerData, discountCode, finalAmount } = body;
    logStep("Request data", { planId, vehicleData, originalPaymentType, voluntaryExcess, discountCode, finalAmount });
    
    // CRITICAL: Bumper only accepts monthly payments, regardless of user selection
    const paymentType = 'monthly'; // Force monthly for Bumper credit checks
    logStep("Forcing monthly payment for Bumper", { originalSelection: originalPaymentType, forcedPaymentType: paymentType });
    
    // Get plan name from database using planId
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    logStep("Fetching plan data", { planId });
    const { data: planData, error: planError } = await supabaseService
      .from('plans')
      .select('name')
      .eq('name', planId.toLowerCase())
      .maybeSingle();
    
    if (planError) {
      logStep("Plan fetch error", { planId, error: planError });
      throw new Error(`Database error fetching plan: ${planError.message}`);
    }
    
    if (!planData) {
      logStep("Plan not found, using planId as plan type", { planId });
      var planType = planId.toLowerCase();
    } else {
      var planType = planData.name.toLowerCase();
    }
    logStep("Using plan type", { planId, planType });

    // Get authenticated user
    let user = null;
    let customerEmail = customerData?.email || vehicleData?.email || "guest@buyawarranty.co.uk";
    
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

    // Use final amount if provided - this is the total amount for the entire period
    let totalAmount = finalAmount;
    let monthlyAmount = totalAmount;
    
    if (!totalAmount) {
      // Fallback to pricing calculation if finalAmount not provided
      const pricingTable = {
        monthly: {
          0: { basic: { monthly: 31, total: 372 }, gold: { monthly: 34, total: 408 }, platinum: { monthly: 36, total: 432 } },
          50: { basic: { monthly: 29, total: 348 }, gold: { monthly: 31, total: 372 }, platinum: { monthly: 32, total: 384 } },
          100: { basic: { monthly: 25, total: 300 }, gold: { monthly: 27, total: 324 }, platinum: { monthly: 29, total: 348 } },
          150: { basic: { monthly: 23, total: 276 }, gold: { monthly: 26, total: 312 }, platinum: { monthly: 27, total: 324 } },
          200: { basic: { monthly: 20, total: 240 }, gold: { monthly: 23, total: 276 }, platinum: { monthly: 25, total: 300 } }
        }
      };
      
      const periodData = pricingTable['monthly'];
      const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
      const planPricing = excessData[planType as keyof typeof excessData];
      totalAmount = planPricing.total;
      monthlyAmount = planPricing.monthly;
    }

    logStep("Using total amount for Bumper", { totalAmount, monthlyAmount, source: finalAmount ? 'provided' : 'calculated' });

    const origin = req.headers.get("origin") || "https://buyawarranty.com";
    logStep("Creating Bumper checkout - TOTAL AMOUNT for entire cover period", { 
      totalAmount, 
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
      logStep("Missing Bumper credentials - creating Stripe fallback");
      
      // Create Stripe fallback
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
        apiVersion: "2023-10-16" 
      });

      const origin = req.headers.get("origin") || "https://buyawarranty.com";
      
      const session = await stripe.checkout.sessions.create({
        customer_email: customerEmail,
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert total amount to pence
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/thank-you?plan=${planType}&payment=yearly&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });

      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        stripeUrl: session.url,
        fallbackReason: "missing_credentials"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!customerData) {
      logStep("No customer data provided, creating Stripe fallback");
      
      // Create Stripe fallback
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
        apiVersion: "2023-10-16" 
      });

      const origin = req.headers.get("origin") || "https://buyawarranty.com";
      
      const session = await stripe.checkout.sessions.create({
        customer_email: customerEmail,
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: { 
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert total amount to pence
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/thank-you?plan=${planType}&payment=yearly&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });

      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        stripeUrl: session.url,
        fallbackReason: "no_customer_data"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const bumperRequestData = {
      amount: totalAmount.toString(), // Send total amount to Bumper
      preferred_product_type: "paylater",
      api_key: bumperApiKey,
      success_url: `${origin}/thank-you?plan=${planId}&payment=monthly&source=bumper`,
      failure_url: `${origin}/payment-fallback?plan=${planId}&email=${encodeURIComponent(customerData.email)}&original_payment=${originalPaymentType}`,
      currency: "GBP",
      order_reference: `VW-${planType.toUpperCase()}-${customerData.vehicle_reg?.replace(/\s+/g, '') || Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      user_email: "info@buyawarranty.co.uk", // Link applications back to Buy a Warranty
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      mobile: customerData.mobile,
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      instalments: "12", // 12 monthly payments
      // Address fields directly (not nested in object)
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.street || "",
      town: customerData.town,
      county: customerData.county,
      postcode: customerData.postcode,
      country: customerData.country,
      // product_description should be an array of objects as per Bumper documentation
      product_description: [{
        item: `${planType} Vehicle Warranty`,
        quantity: "1",
        price: totalAmount.toString() // Use total amount in product description
      }]
    };

    // Remove sensitive data from logs
    const loggableData = { ...bumperRequestData };
    delete loggableData.api_key;
    delete loggableData.signature;
    logStep("Bumper payload prepared", loggableData);

    // Generate signature exactly like the WordPress plugin
    const signature = await generateSignature(bumperRequestData, bumperSecretKey);
    bumperRequestData.signature = signature;

    // CRITICAL FIX: Use PRODUCTION Bumper API, not demo
    const bumperApiUrl = "https://api.bumper.co/v2/apply/";
    logStep("Making Bumper API request to PRODUCTION", { url: bumperApiUrl, totalAmount, monthlyAmount });

    const bumperResponse = await fetch(bumperApiUrl, {
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
        logStep("Bumper API returned empty response - creating Stripe fallback");
        
        // Create Stripe fallback
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
          apiVersion: "2023-10-16" 
        });

        const origin = req.headers.get("origin") || "https://buyawarranty.com";
        
        const session = await stripe.checkout.sessions.create({
          customer_email: customerEmail,
          line_items: [{
            price_data: {
              currency: "gbp",
              product_data: { 
                name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Warranty Plan`,
              },
              unit_amount: Math.round(totalAmount * 100), // Convert total amount to pence
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${origin}/thank-you?plan=${planType}&payment=yearly&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/`,
        });
        
        return new Response(JSON.stringify({ 
          fallbackToStripe: true,
          stripeUrl: session.url,
          fallbackReason: "credit_check_failed"
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
