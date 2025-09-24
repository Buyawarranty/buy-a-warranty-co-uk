
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

  let planId, vehicleData, originalPaymentType, voluntaryExcess, customerData, discountCode, finalAmount, addAnotherWarrantyRequested, protectionAddOns;
  
  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body = await req.json();
    ({ planId, vehicleData, paymentType: originalPaymentType, voluntaryExcess = 0, customerData, discountCode, finalAmount, addAnotherWarrantyRequested, protectionAddOns } = body);
    logStep("Request data", { planId, vehicleData, originalPaymentType, voluntaryExcess, discountCode, finalAmount, protectionAddOns });
    
    // Calculate number of instalments based on payment type
    const getInstalmentCount = (paymentType: string) => {
      // Bumper always uses 12 instalments regardless of plan duration
      return "12";
    };
    
    const instalmentCount = getInstalmentCount(originalPaymentType);
    
    // CRITICAL: Bumper only accepts monthly payments, regardless of user selection
    const paymentType = 'monthly'; // Force monthly for Bumper credit checks
    logStep("Forcing monthly payment for Bumper", { originalSelection: originalPaymentType, forcedPaymentType: paymentType, instalmentCount });
    
    // Get plan name from database using planId
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    logStep("Fetching plan data", { planId });
    
    // Check if planId is a UUID or plan name
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(planId);
    
    let planData = null;
    let planError = null;
    
    if (isUUID) {
      // Query by ID if it's a UUID
      const result = await supabaseService
        .from('special_vehicle_plans')
        .select('name')
        .eq('id', planId)
        .maybeSingle();
      planData = result.data;
      planError = result.error;
    } else {
      // Query by name if it's a string (case insensitive)
      const result = await supabaseService
        .from('special_vehicle_plans')
        .select('name')
        .ilike('name', planId)
        .maybeSingle();
      planData = result.data;
      planError = result.error;
    }

    if (planError && !planError.message.includes('no rows')) {
      logStep("Plan fetch error", { planId, error: planError, isUUID });
      throw new Error(`Database error fetching plan: ${planError.message}`);
    }

    let planType;
    if (!planData) {
      logStep("Plan not found in database, using planId as plan type", { planId, isUUID });
      planType = planId.toLowerCase().replace(/\s+/g, '_');
    } else {
      planType = planData.name.toLowerCase().replace(/\s+/g, '_');
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
      
      // Create Stripe fallback using dedicated function
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        fallbackReason: "missing_credentials",
        fallbackData: {
          planId: planType,
          vehicleData,
          paymentType: originalPaymentType,
          voluntaryExcess,
          customerData,
          discountCode,
          finalAmount: totalAmount
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!customerData) {
      logStep("No customer data provided, creating Stripe fallback");
      
      // Create Stripe fallback using dedicated function
      return new Response(JSON.stringify({ 
        fallbackToStripe: true,
        fallbackReason: "no_customer_data",
        fallbackData: {
          planId: planType,
          vehicleData,
          paymentType: originalPaymentType,
          voluntaryExcess,
          customerData,
          discountCode,
          finalAmount: totalAmount
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Build URLs for signature (unencoded) and request (encoded) separately
    const baseSuccessUrl = `https://mzlpuxzwyrcyrgrongeb.supabase.co/functions/v1/process-bumper-success?plan=${planId}&payment=monthly&source=bumper&addAnotherWarranty=${addAnotherWarrantyRequested || false}&first_name=${customerData.first_name || ''}&last_name=${customerData.last_name || ''}&email=${customerData.email || ''}&mobile=${customerData.mobile || ''}&street=${customerData.street || ''}&town=${customerData.town || ''}&county=${customerData.county || ''}&postcode=${customerData.postcode || ''}&country=${customerData.country || ''}&building_name=${customerData.building_name || ''}&flat_number=${customerData.flat_number || ''}&building_number=${customerData.building_number || ''}&vehicle_reg=${customerData.vehicle_reg || vehicleData.regNumber || ''}&vehicle_make=${vehicleData?.make || ''}&vehicle_model=${vehicleData?.model || ''}&vehicle_year=${vehicleData?.year || ''}&vehicle_fuel_type=${vehicleData?.fuelType || ''}&vehicle_transmission=${vehicleData?.transmission || ''}&mileage=${vehicleData?.mileage || ''}&vehicle_type=${vehicleData?.vehicleType || 'standard'}&discount_code=${discountCode || ''}&final_amount=${finalAmount || totalAmount}&original_payment_type=${originalPaymentType}&addon_tyre_cover=${protectionAddOns?.tyre ? 'true' : 'false'}&addon_wear_tear=${protectionAddOns?.wearTear ? 'true' : 'false'}&addon_europe_cover=${protectionAddOns?.european ? 'true' : 'false'}&addon_transfer_cover=${protectionAddOns?.transfer ? 'true' : 'false'}&addon_breakdown_recovery=${protectionAddOns?.breakdown ? 'true' : 'false'}&addon_vehicle_rental=${protectionAddOns?.rental ? 'true' : 'false'}&addon_mot_repair=${protectionAddOns?.motRepair ? 'true' : 'false'}&addon_mot_fee=${protectionAddOns?.motFee ? 'true' : 'false'}&addon_lost_key=${protectionAddOns?.lostKey ? 'true' : 'false'}&addon_consequential=${protectionAddOns?.consequential ? 'true' : 'false'}&redirect=${origin + '/thank-you'}`;
    
    const baseFailureUrl = `${origin}/payment-fallback?plan=${planId}&email=${customerData.email}&original_payment=${originalPaymentType}`;
    
    // Encoded URLs for the actual HTTP request
    const encodedSuccessUrl = `https://mzlpuxzwyrcyrgrongeb.supabase.co/functions/v1/process-bumper-success?plan=${planId}&payment=monthly&source=bumper&addAnotherWarranty=${addAnotherWarrantyRequested || false}&first_name=${encodeURIComponent(customerData.first_name || '')}&last_name=${encodeURIComponent(customerData.last_name || '')}&email=${encodeURIComponent(customerData.email || '')}&mobile=${encodeURIComponent(customerData.mobile || '')}&street=${encodeURIComponent(customerData.street || '')}&town=${encodeURIComponent(customerData.town || '')}&county=${encodeURIComponent(customerData.county || '')}&postcode=${encodeURIComponent(customerData.postcode || '')}&country=${encodeURIComponent(customerData.country || '')}&building_name=${encodeURIComponent(customerData.building_name || '')}&flat_number=${encodeURIComponent(customerData.flat_number || '')}&building_number=${encodeURIComponent(customerData.building_number || '')}&vehicle_reg=${encodeURIComponent(customerData.vehicle_reg || vehicleData.regNumber || '')}&vehicle_make=${encodeURIComponent(vehicleData?.make || '')}&vehicle_model=${encodeURIComponent(vehicleData?.model || '')}&vehicle_year=${encodeURIComponent(vehicleData?.year || '')}&vehicle_fuel_type=${encodeURIComponent(vehicleData?.fuelType || '')}&vehicle_transmission=${encodeURIComponent(vehicleData?.transmission || '')}&mileage=${encodeURIComponent(vehicleData?.mileage || '')}&vehicle_type=${encodeURIComponent(vehicleData?.vehicleType || 'standard')}&discount_code=${encodeURIComponent(discountCode || '')}&final_amount=${finalAmount || totalAmount}&original_payment_type=${encodeURIComponent(originalPaymentType)}&addon_tyre_cover=${protectionAddOns?.tyre ? 'true' : 'false'}&addon_wear_tear=${protectionAddOns?.wearTear ? 'true' : 'false'}&addon_europe_cover=${protectionAddOns?.european ? 'true' : 'false'}&addon_transfer_cover=${protectionAddOns?.transfer ? 'true' : 'false'}&addon_breakdown_recovery=${protectionAddOns?.breakdown ? 'true' : 'false'}&addon_vehicle_rental=${protectionAddOns?.rental ? 'true' : 'false'}&addon_mot_repair=${protectionAddOns?.motRepair ? 'true' : 'false'}&addon_mot_fee=${protectionAddOns?.motFee ? 'true' : 'false'}&addon_lost_key=${protectionAddOns?.lostKey ? 'true' : 'false'}&addon_consequential=${protectionAddOns?.consequential ? 'true' : 'false'}&redirect=${encodeURIComponent(origin + '/thank-you')}`;
    
    const encodedFailureUrl = `${origin}/payment-fallback?plan=${planId}&email=${encodeURIComponent(customerData.email)}&original_payment=${originalPaymentType}`;

    // Create payload for signature generation (with unencoded URLs)
    const signaturePayload = {
      amount: totalAmount.toString(),
      preferred_product_type: "paylater",
      api_key: bumperApiKey,
      success_url: baseSuccessUrl, // Unencoded for signature
      failure_url: baseFailureUrl, // Unencoded for signature
      currency: "GBP",
      order_reference: `VW-${planType.toUpperCase()}-${customerData.vehicle_reg?.replace(/\s+/g, '') || Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      user_email: "info@buyawarranty.co.uk",
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      mobile: customerData.mobile,
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      instalments: instalmentCount,
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.street || "",
      town: customerData.town || "",
      county: customerData.county || "",
      postcode: customerData.postcode || "",
      country: customerData.country || "",
      product_description: [{
        item: `${planType} Vehicle Warranty`,
        quantity: "1",
        price: totalAmount.toString()
      }]
    };

    // Create payload for actual HTTP request (with encoded URLs)
    const bumperRequestData = {
      amount: totalAmount.toString(),
      preferred_product_type: "paylater",
      api_key: bumperApiKey,
      success_url: encodedSuccessUrl, // Encoded for HTTP request
      failure_url: encodedFailureUrl, // Encoded for HTTP request
      currency: "GBP",
      order_reference: `VW-${planType.toUpperCase()}-${customerData.vehicle_reg?.replace(/\s+/g, '') || Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      user_email: "info@buyawarranty.co.uk", // Link applications back to Buy a Warranty
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      mobile: customerData.mobile,
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      instalments: instalmentCount, // Dynamic based on payment period
      // Address fields directly (not nested in object)
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.street || "",
      town: customerData.town || "",
      county: customerData.county || "",
      postcode: customerData.postcode || "",
      country: customerData.country || "",
      // product_description should be an array of objects as per Bumper documentation
      product_description: [{
        item: `${planType} Vehicle Warranty`,
        quantity: "1",
        price: totalAmount.toString()
      }]
    };

    // Remove sensitive data from logs
    const loggableData = { ...bumperRequestData };
    delete loggableData.api_key;
    delete loggableData.signature;
    logStep("Bumper payload prepared", loggableData);

    // Generate signature using unencoded payload
    console.log("BUMPER DEBUG: Signature payload (unencoded URLs):", JSON.stringify(signaturePayload, null, 2));
    
    const signature = await generateSignature(signaturePayload, bumperSecretKey);
    bumperRequestData.signature = signature;
    
    console.log("BUMPER DEBUG: Generated signature:", signature);
    console.log("BUMPER DEBUG: Final payload:", JSON.stringify(bumperRequestData, null, 2));

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
        
        return new Response(JSON.stringify({ 
          fallbackToStripe: true,
          fallbackReason: "credit_check_failed",
          fallbackData: {
            planId: planType,
            vehicleData,
            paymentType: originalPaymentType,
            voluntaryExcess,
            customerData,
            discountCode,
            finalAmount: totalAmount
          }
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
        fallbackData: {
          planId: planType,
          vehicleData,
          paymentType: originalPaymentType,
          voluntaryExcess,
          customerData,
          discountCode,
          finalAmount: totalAmount
        }
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
        fallbackData: {
          planId: planType,
          vehicleData,
          paymentType: originalPaymentType,
          voluntaryExcess,
          customerData,
          discountCode,
          finalAmount: totalAmount
        }
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
    
    // On any error, fallback to Stripe with original payment type
    return new Response(JSON.stringify({ 
      fallbackToStripe: true,
      fallbackReason: "error",
      fallbackData: {
        planId: planType || planId || "basic",
        vehicleData: vehicleData || {},
        paymentType: originalPaymentType || "yearly",
        voluntaryExcess: voluntaryExcess || 0,
        customerData: customerData || {},
        discountCode: discountCode || null,
        finalAmount: null
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

// Generate signature exactly like the WordPress plugin - FIXED VERSION
async function generateSignature(payload: any, secretKey: string): Promise<string> {
  // Keys to exclude from signature (from Bumper WordPress plugin)
  const excludedKeys = [
    'api_key',
    'signature', 
    'product_description',
    'preferred_product_type'
  ];

  // Filter payload to exclude those keys and handle values properly
  const filteredPayload: any = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!excludedKeys.includes(key)) {
      // Handle empty values - convert to empty string for signature
      if (value === null || value === undefined) {
        filteredPayload[key] = '';
      } else if (Array.isArray(value)) {
        // Skip arrays entirely for signature (like product_description)
        continue;
      } else {
        filteredPayload[key] = String(value);
      }
    }
  }

  // Sort keys alphabetically (case-insensitive like WordPress)
  const sortedKeys = Object.keys(filteredPayload).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  // Build signature string exactly like WordPress plugin
  const signatureParts = [];
  for (const key of sortedKeys) {
    const value = filteredPayload[key];
    // WordPress format: KEY=value (no URL encoding for signature)
    signatureParts.push(`${key.toUpperCase()}=${value}`);
  }
  
  const signatureString = signatureParts.join('&');

  console.log("BUMPER DEBUG: Signature string:", signatureString);
  console.log("BUMPER DEBUG: Secret key length:", secretKey.length);

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
  
  // Return hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
