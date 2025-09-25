import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Immediate logging to verify function is loading
console.log("[CREATE-BUMPER-CHECKOUT] Function loaded and starting...");

const logStep = (step: string, details?: any) => {
  try {
    const timestamp = new Date().toISOString();
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[CREATE-BUMPER-CHECKOUT] ${timestamp} ${step}${detailsStr}`);
  } catch (e) {
    console.log(`[CREATE-BUMPER-CHECKOUT] ${new Date().toISOString()} ${step} - [JSON stringify failed]`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestData = await req.json();
    logStep("Request data", {
      planId: requestData.planId,
      vehicleData: requestData.vehicleData,
      originalPaymentType: requestData.paymentType,
      voluntaryExcess: requestData.voluntaryExcess,
      discountCode: requestData.discountCode,
      finalAmount: requestData.finalAmount,
      protectionAddOns: requestData.protectionAddOns
    });

    const {
      planId,
      vehicleData,
      paymentType: originalPaymentType,
      voluntaryExcess,
      customerData,
      discountCode,
      finalAmount,
      addAnotherWarrantyRequested,
      protectionAddOns = {}
    } = requestData;

    // Force payment to monthly for Bumper (they handle installments internally)
    const paymentType = "monthly";
    const instalmentCount = "12"; // Default to 12 installments for Bumper

    logStep("Forcing monthly payment for Bumper", {
      originalSelection: originalPaymentType,
      forcedPaymentType: paymentType,
      instalmentCount
    });

    // Fetch plan data to get plan type
    logStep("Fetching plan data", { planId });
    const { data: planData, error: planError } = await supabase
      .from('special_vehicle_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planData) {
      throw new Error(`Failed to fetch plan: ${planError?.message}`);
    }

    // Map plan to Bumper plan type
    const planTypeMapping: Record<string, string> = {
      'Basic Van Plan': 'basic_van_plan',
      'Premium Van Plan': 'premium_van_plan',
      'Comprehensive Van Plan': 'comprehensive_van_plan',
      'Basic Car Plan': 'basic_car_plan',
      'Premium Car Plan': 'premium_car_plan',
      'Comprehensive Car Plan': 'comprehensive_car_plan',
    };

    const planType = planTypeMapping[planData.name] || 'basic';
    logStep("Using plan type", { planId, planType });

    // Use the provided finalAmount as the total amount for Bumper
    const totalAmount = finalAmount || 500; // Fallback amount
    const monthlyAmount = totalAmount; // For Bumper, this is the total amount spread over installments

    logStep("Using total amount for Bumper", { totalAmount, monthlyAmount, source: finalAmount ? "provided" : "fallback" });

    const bumperApiKey = Deno.env.get("BUMPER_API_KEY");
    const bumperSecretKey = Deno.env.get("BUMPER_SECRET_KEY");

    logStep("Checking Bumper credentials", {
      hasApiKey: !!bumperApiKey,
      hasSecretKey: !!bumperSecretKey,
      apiKeyLength: bumperApiKey?.length,
      secretKeyLength: bumperSecretKey?.length
    });

    if (!bumperApiKey || !bumperSecretKey) {
      throw new Error("Bumper API credentials not configured");
    }

    // For Bumper, we'll send total amount but use pay later option for monthly installments
    const origin = req.headers.get("origin") || "https://8037b426-cb66-497b-bb9a-14209b3fb079.lovableproject.com";
    
    logStep("Creating Bumper checkout - TOTAL AMOUNT for entire cover period", {
      totalAmount,
      monthlyAmount,
      customerEmail: customerData?.email,
      origin,
      originalUserSelection: originalPaymentType,
      forcedBumperPayment: paymentType
    });

    // Create transaction ID for tracking
    const transactionId = `VW-${planType.toUpperCase()}-${Date.now()}`;
    
    // Bumper API URLs
    const bumperApiUrl = "https://api.bumper.co/v2/apply/";
    
    // Create URLs for success and failure
    const baseSuccessUrl = `https://mzlpuxzwyrcyrgrongeb.supabase.co/functions/v1/process-bumper-success`;
    const baseFailureUrl = `${origin}/payment-fallback`;
    
    // Use the same simple URLs for both signature and request
    const successUrl = `${baseSuccessUrl}?tx=${transactionId}`;
    const failureUrl = `${baseFailureUrl}?tx=${transactionId}`;

    // Create payload for signature generation (with simple URLs)
    const signaturePayload = {
      amount: totalAmount.toString(),
      success_url: successUrl,
      failure_url: failureUrl,
      currency: "GBP",
      order_reference: transactionId,
      first_name: customerData.first_name || "",
      last_name: customerData.last_name || "",
      email: customerData.email || "",
      mobile: customerData.phone || customerData.mobile || "",
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.address_line_1 || customerData.street || "",
      town: customerData.city || customerData.town || "",
      county: customerData.county || "",
      postcode: customerData.postcode || "",
      country: customerData.country || "",
      product_id: "4", // Use product_id for signature generation (Bumper's legacy field)
      send_sms: false, // Required by Bumper API
      send_email: false // Required by Bumper API
    };

    // Create payload for actual HTTP request (same simple URLs)
    const bumperRequestData = {
      amount: totalAmount.toString(),
      preferred_product_type: "paylater",
      api_key: bumperApiKey,
      success_url: successUrl,
      failure_url: failureUrl,
      currency: "GBP",
      order_reference: transactionId,
      first_name: customerData.first_name || "",
      last_name: customerData.last_name || "",
      email: customerData.email || "",
      mobile: customerData.phone || customerData.mobile || "",
      vehicle_reg: customerData.vehicle_reg || vehicleData.regNumber || "",
      // Address fields directly (not nested in object)
      flat_number: customerData.flat_number || "",
      building_name: customerData.building_name || "",
      building_number: customerData.building_number || "",
      street: customerData.address_line_1 || customerData.street || "",
      town: customerData.city || customerData.town || "",
      county: customerData.county || "",
      postcode: customerData.postcode || "",
      country: customerData.country || "",
      instalments: instalmentCount, // Changed from product_id to instalments (Feb 2025 API update)
      send_sms: false, // Required by Bumper API
      send_email: false, // Required by Bumper API
      // product_description should be an array of objects as per Bumper documentation
      product_description: [{
        item: `${planType} Vehicle Warranty`,
        quantity: "1",
        price: totalAmount.toString()
      }]
    };

    // Remove sensitive data from logs
    const loggableData = { ...bumperRequestData };
    if ('api_key' in loggableData) delete (loggableData as any).api_key;
    if ('signature' in loggableData) delete (loggableData as any).signature;
    logStep("Bumper payload prepared", loggableData);

    // Generate signature using unencoded payload
    console.log("BUMPER DEBUG: Signature payload (unencoded URLs):", JSON.stringify(signaturePayload, null, 2));
    
    const signature = await generateSignature(signaturePayload, bumperSecretKey);
    (bumperRequestData as any).signature = signature;
    
    console.log("BUMPER DEBUG: Generated signature:", signature);
    console.log("BUMPER DEBUG: Final payload:", JSON.stringify(bumperRequestData, null, 2));

    // Test our signature generation with Bumper's documented example
    const testPayload = {
      amount: "300.00",
      success_url: "http://www.supplier.com/success/",
      failure_url: "http://www.supplier.com/failure/",
      currency: "GBP",
      order_reference: "26352",
      first_name: "John",
      last_name: "Smith", 
      email: "john@smith.com",
      product_id: "4",
      mobile: "0778879989",
      vehicle_reg: "XYZ1234",
      flat_number: "23",
      building_name: "ABC Building",
      building_number: "39",
      street: "DEF way",
      town: "Southampton",
      county: "Hampshire",
      postcode: "SO14 3AB",
      country: "UK",
      send_sms: false,
      send_email: false
    };
    
    // Use test secret from Bumper documentation - trying the original 23-char key from logs  
    const testSecretKey = "9f*u/[`tt*.*k725X;u&Zkz";
    const testSignatureString = await debugSignatureString(testPayload);
    console.log("BUMPER TEST: Signature string being hashed:", testSignatureString);
    
    const testSignature = await generateSignature(testPayload, testSecretKey);
    console.log("BUMPER TEST: Generated test signature:", testSignature);
    console.log("BUMPER TEST: Expected signature: 8be9b278125a4fa15c2af43f28307d2af90ec4c1e8f52c096b0652a1b66d49c7");
    console.log("BUMPER TEST: Signatures match:", testSignature === "8be9b278125a4fa15c2af43f28307d2af90ec4c1e8f52c096b0652a1b66d49c7");
    console.log("BUMPER DEBUG: Secret key length:", testSecretKey.length);

    logStep("Making Bumper API request to PRODUCTION", { 
      url: bumperApiUrl,
      totalAmount,
      monthlyAmount
    });

    // Make request to Bumper API
    const bumperResponse = await fetch(bumperApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bumperRequestData),
    });

    logStep("Bumper API response received", {
      status: bumperResponse.status,
      statusText: bumperResponse.statusText,
      ok: bumperResponse.ok
    });

    const responseText = await bumperResponse.text();
    console.log("Raw Bumper API response:", responseText);

    let bumperData;
    try {
      bumperData = JSON.parse(responseText);
      console.log("Bumper API response data:", bumperData);
      logStep("Bumper API response", { status: bumperResponse.status, data: bumperData });
    } catch (parseError) {
      console.log("Failed to parse Bumper API response as JSON:", parseError);
      
      logStep("Bumper API returned invalid JSON", { 
        status: bumperResponse.status,
        responseText: responseText.substring(0, 500) // Limit log size
      });
      
      // Let Bumper handle their own response format
      throw new Error(`Bumper API returned invalid response: ${responseText.substring(0, 100)}`);
    }

    if (!bumperResponse.ok) {
      logStep("Bumper API error", { 
        status: bumperResponse.status,
        error: bumperData,
        statusText: bumperResponse.statusText
      });
      
      // Let Bumper handle their own error response
      throw new Error(`Bumper API error: ${bumperResponse.status} - ${bumperData?.message || 'Unknown error'}`);
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
    
    // Return error to frontend to handle appropriately
    return new Response(JSON.stringify({ 
      error: true,
      message: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Generate signature exactly like Bumper API documentation requires
async function generateSignature(payload: any, secretKey: string): Promise<string> {
  // CRITICAL: According to Bumper API docs, exclude these fields from signature:
  // api_key, signature, product_description, preferred_product_type, additional_data, instalments
  const excludedFields = new Set([
    'api_key', 
    'signature', 
    'product_description', 
    'preferred_product_type', 
    'additional_data',
    'instalments' // This is our custom field, not part of signature
  ]);

  // Build the signature payload with ALL payload fields EXCEPT excluded ones
  const signaturePayload: any = {};
  
  for (const [field, fieldValue] of Object.entries(payload)) {
    // Skip excluded fields
    if (excludedFields.has(field)) {
      continue;
    }
    
    let value = fieldValue;
    
    // Handle missing values - convert to empty string
    if (value === null || value === undefined) {
      value = '';
    } else if (typeof value === 'boolean') {
      // Convert boolean to string exactly as Bumper expects: True/False (capitalized)
      value = value ? 'True' : 'False';
    } else {
      // Convert to string - use values exactly as provided
      value = String(value);
    }
    
    signaturePayload[field] = value;
  }

  // Sort keys alphabetically (case-sensitive as per Bumper API)
  const sortedKeys = Object.keys(signaturePayload).sort();

  // Build signature string exactly like Bumper API documentation
  const signatureParts = [];
  for (const key of sortedKeys) {
    const value = signaturePayload[key];
    // Bumper format: KEY=value (KEY must be uppercase)
    signatureParts.push(`${key.toUpperCase()}=${value}`);
  }
  
  // CRITICAL: Bumper requires trailing "&" at the end of signature string per their API docs
  const signatureString = signatureParts.join('&') + '&';

  console.log("BUMPER DEBUG: Signature payload:", JSON.stringify(signaturePayload, null, 2));
  console.log("BUMPER DEBUG: Signature string:", signatureString);
  console.log("BUMPER DEBUG: Secret key length:", secretKey.length);
  console.log("BUMPER DEBUG: Secret key preview:", secretKey.substring(0, 4) + "..." + secretKey.substring(secretKey.length - 4));

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

// Debug function to see exact signature string
async function debugSignatureString(payload: any): Promise<string> {
  // CRITICAL: According to Bumper API docs, exclude these fields from signature:
  // api_key, signature, product_description, preferred_product_type, additional_data, instalments
  const excludedFields = new Set([
    'api_key', 
    'signature', 
    'product_description', 
    'preferred_product_type', 
    'additional_data',
    'instalments' // This is our custom field, not part of signature
  ]);

  // Build the signature payload with ALL payload fields EXCEPT excluded ones
  const signaturePayload: any = {};
  
  for (const [field, fieldValue] of Object.entries(payload)) {
    // Skip excluded fields
    if (excludedFields.has(field)) {
      continue;
    }
    
    let value = fieldValue;
    
    // Handle missing values - convert to empty string
    if (value === null || value === undefined) {
      value = '';
    } else if (typeof value === 'boolean') {
      // Convert boolean to string exactly as Bumper expects: True/False (capitalized)
      value = value ? 'True' : 'False';
    } else {
      // Convert to string and handle URL decoding for URL fields
      value = String(value);
      
      // CRITICAL: URLs must NOT be URL encoded for signature generation
      // Bumper expects raw URLs in the signature string
      if (field === 'success_url' || field === 'failure_url') {
        // Decode URLs to ensure they're not double-encoded
        try {
          value = decodeURIComponent(String(value));
        } catch (e) {
          // If decoding fails, use the original value
          console.log(`BUMPER DEBUG: Failed to decode URL ${field}: ${value}`);
        }
      }
    }
    
    signaturePayload[field] = value;
  }

  // Sort keys alphabetically (case-sensitive as per Bumper API)
  const sortedKeys = Object.keys(signaturePayload).sort();

  // Build signature string exactly like Bumper API documentation
  const signatureParts = [];
  for (const key of sortedKeys) {
    const value = signaturePayload[key];
    // Bumper format: KEY=value (KEY must be uppercase)
    signatureParts.push(`${key.toUpperCase()}=${value}`);
  }
  
  // CRITICAL: Bumper requires trailing "&" at the end of signature string per their API docs
  return signatureParts.join('&') + '&';
}