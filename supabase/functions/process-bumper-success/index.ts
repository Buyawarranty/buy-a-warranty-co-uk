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
  // Add detailed logging for all requests to help debug Bumper callbacks
  const url = new URL(req.url);
  console.log(`[PROCESS-BUMPER-SUCCESS] Incoming request: ${req.method} ${url.pathname}${url.search}`);
  console.log(`[PROCESS-BUMPER-SUCCESS] Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[PROCESS-BUMPER-SUCCESS] Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  let transactionId: string | null = null;
  let supabaseClient: any = null;

  try {
    logStep("Function started");

    supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse URL parameters from Bumper redirect - now using simple transaction ID approach
    const url = new URL(req.url);
    transactionId = url.searchParams.get('tx');
    
    // Log all URL parameters for debugging
    const allParams = Object.fromEntries(url.searchParams.entries());
    logStep("All URL parameters received", allParams);
    
    if (!transactionId) {
      logStep("No transaction ID provided in URL parameters", { allParams });
      
      // Check if this is a direct Bumper callback with different parameter names
      const bumperParams = {
        reference: url.searchParams.get('reference'),
        transaction_id: url.searchParams.get('transaction_id'),
        order_id: url.searchParams.get('order_id'),
        orderId: url.searchParams.get('orderId'),
        tx_id: url.searchParams.get('tx_id'),
        txId: url.searchParams.get('txId'),
        bumper_reference: url.searchParams.get('bumper_reference'),
        payment_id: url.searchParams.get('payment_id'),
        id: url.searchParams.get('id')
      };
      
      logStep("Checking alternative parameter names", bumperParams);
      
      // Try to find transaction ID from alternative parameter names
      transactionId = bumperParams.reference || 
                    bumperParams.transaction_id || 
                    bumperParams.order_id ||
                    bumperParams.orderId ||
                    bumperParams.tx_id ||
                    bumperParams.txId ||
                    bumperParams.bumper_reference ||
                    bumperParams.payment_id ||
                    bumperParams.id;
      
      if (!transactionId) {
        logStep("No valid transaction ID found in any parameter", { allParams, bumperParams });
        return new Response(JSON.stringify({ 
          error: 'Missing transaction ID', 
          receivedParams: allParams,
          checkedParams: bumperParams
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      logStep("Found transaction ID from alternative parameter", { transactionId, source: Object.keys(bumperParams).find(key => bumperParams[key as keyof typeof bumperParams] === transactionId) });
    }

    // Fetch transaction data from database using transaction ID
    logStep("Fetching transaction data", { transactionId });
    
    const { data: transactionData, error: fetchError } = await supabaseClient
      .from('bumper_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (fetchError || !transactionData) {
      logStep("Transaction not found or error fetching", { 
        transactionId, 
        error: fetchError?.message,
        transactionData
      });
      
      return new Response(JSON.stringify({ 
        error: 'Transaction not found',
        transactionId,
        details: fetchError?.message
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logStep("Transaction data retrieved", { 
      transactionId: transactionData.transaction_id,
      status: transactionData.status,
      planId: transactionData.plan_id,
      finalAmount: transactionData.final_amount
    });

    // Update transaction status to completed
    const { error: updateError } = await supabaseClient
      .from('bumper_transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      logStep("Error updating transaction status", { error: updateError.message });
    }

    // Extract data from transaction record
    const customerData = transactionData.customer_data;
    const vehicleData = transactionData.vehicle_data;
    const protectionAddOns = transactionData.protection_addons || {};
    const planId = transactionData.plan_id;
    const paymentType = transactionData.payment_type;
    const finalAmount = transactionData.final_amount;
    const discountCode = transactionData.discount_code;

    logStep("Extracted transaction details", {
      customerEmail: customerData?.email,
      planId,
      paymentType,
      finalAmount,
      protectionAddOns,
      vehicleData: vehicleData,
      discountCode
    });

    // Convert protection add-ons to consistent boolean format and map to database fields
    let addOnFields: any = {};
    
    if (protectionAddOns && typeof protectionAddOns === 'object') {
      // Direct mapping from protectionAddOns object (from Bumper flow)
      addOnFields = {
        breakdown_recovery: protectionAddOns.breakdown || false,
        mot_fee: protectionAddOns.motFee || false,
        tyre_cover: protectionAddOns.tyre || false,
        wear_tear: protectionAddOns.wearAndTear || protectionAddOns.wearTear || false,
        europe_cover: protectionAddOns.european || false,
        transfer_cover: protectionAddOns.transfer || false,
        vehicle_rental: protectionAddOns.rental || false,
        mot_repair: protectionAddOns.motRepair || false,
        lost_key: protectionAddOns.lostKey || false,
        consequential: protectionAddOns.consequential || false
      };
      
      logStep("Mapped protection add-ons from object", { 
        input: protectionAddOns, 
        mapped: addOnFields 
      });
    }
    
    // Auto-include add-ons based on payment type using the same logic as other functions
    const autoIncludedAddOns = getAutoIncludedAddOnsForPayment(paymentType);
    logStep("Auto-including add-ons for payment type", { 
      paymentType, 
      autoIncluded: autoIncludedAddOns 
    });
    
    // Set auto-included add-ons to true
    if (autoIncludedAddOns.includes('breakdown')) addOnFields.breakdown_recovery = true;
    if (autoIncludedAddOns.includes('motFee')) addOnFields.mot_fee = true;
    if (autoIncludedAddOns.includes('rental')) addOnFields.vehicle_rental = true;
    if (autoIncludedAddOns.includes('tyre')) addOnFields.tyre_cover = true;

    // Get claim limit from transaction data instead of calculating it
    const claimLimit = transactionData.claim_limit || calculateClaimLimit(planId, paymentType);
    const voluntaryExcess = calculateVoluntaryExcess(planId, paymentType);

    logStep("Calculated policy details", { claimLimit, voluntaryExcess });

    // Call handle-successful-payment with proper metadata including protectionAddOns and claim_limit
    const handlePaymentPayload = {
      planId: planId,
      customerData: customerData,
      vehicleData: vehicleData,
      paymentType: paymentType,
      userEmail: customerData?.email,
      protectionAddOns: addOnFields, // Use processed add-ons with auto-inclusions
      metadata: {
        source: 'bumper',
        transaction_id: transactionId,
        discount_code: discountCode,
        claim_limit: claimLimit,
        voluntary_excess: voluntaryExcess,
        final_amount: finalAmount,
        // Vehicle details for metadata - ensure these are populated
        vehicle_reg: vehicleData?.regNumber || vehicleData?.registration || customerData?.vehicle_reg,
        vehicle_make: vehicleData?.make || customerData?.vehicle_make,
        vehicle_model: vehicleData?.model || customerData?.vehicle_model,
        vehicle_year: vehicleData?.year || customerData?.vehicle_year,
        vehicle_fuel_type: vehicleData?.fuelType || customerData?.vehicle_fuel_type,
        vehicle_transmission: vehicleData?.transmission || customerData?.vehicle_transmission,
        vehicle_mileage: vehicleData?.mileage || customerData?.vehicle_mileage,
        // Add-ons metadata for W2000 compatibility
        addon_tyre_cover: addOnFields.tyre_cover ? 'true' : 'false',
        addon_wear_tear: addOnFields.wear_tear ? 'true' : 'false',
        addon_europe_cover: addOnFields.europe_cover ? 'true' : 'false',
        addon_transfer_cover: addOnFields.transfer_cover ? 'true' : 'false',
        addon_breakdown_recovery: addOnFields.breakdown_recovery ? 'true' : 'false',
        addon_vehicle_rental: addOnFields.vehicle_rental ? 'true' : 'false',
        addon_mot_fee: addOnFields.mot_fee ? 'true' : 'false',
        addon_mot_repair: addOnFields.mot_repair ? 'true' : 'false',
        addon_lost_key: addOnFields.lost_key ? 'true' : 'false',
        addon_consequential: addOnFields.consequential ? 'true' : 'false'
      }
    };

    logStep("Calling handle-successful-payment", { 
      email: customerData?.email,
      planId,
      paymentType,
      claimLimit,
      protectionAddOns
    });

    const { error: handlePaymentError } = await supabaseClient.functions.invoke(
      'handle-successful-payment',
      { body: handlePaymentPayload }
    );

    if (handlePaymentError) {
      logStep("Error calling handle-successful-payment", { error: handlePaymentError.message });
      throw new Error(`Payment processing failed: ${handlePaymentError.message}`);
    }

    logStep("Payment processing completed successfully");

    // Perform actual HTTP redirect instead of returning JSON
    const redirectUrl = transactionData.redirect_url || 'https://buyawarranty.co.uk/thank-you';
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-bumper-success", { 
      error: errorMessage,
      transactionId,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Update transaction status to failed if we have the transaction ID
    if (transactionId && supabaseClient) {
      try {
        await supabaseClient
          .from('bumper_transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      } catch (updateError) {
        logStep("Error updating transaction status to failed", { error: updateError });
      }
    }

    // Redirect to error page instead of showing JSON
    const errorRedirect = 'https://buyawarranty.co.uk/payment-fallback?error=processing_failed';
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': errorRedirect
      }
    });
  }
});

// Helper function to get auto-included add-ons for payment type (consistent with frontend)
function getAutoIncludedAddOnsForPayment(paymentType: string): string[] {
  const normalizedType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedType) {
    case '24months':
      return ['breakdown', 'motFee']; // 2-Year: Vehicle recovery, MOT test fee
    case '36months':
      return ['breakdown', 'motFee', 'rental', 'tyre']; // 3-Year: All above + Rental, Tyre
    default:
      return []; // 12-month plans have no auto-included add-ons
  }
}

// Helper functions for generating warranty references
function generateWarrantyReference(): string {
  const customerRecords: any[] = []; // This would normally come from database query but we'll use timestamp fallback
  
  if (customerRecords && customerRecords.length > 0) {
    // Use existing logic if customer records available
    const lastId = Math.max(...customerRecords.map((r: any) => r.id || 0));
    const nextId = (lastId + 1).toString().padStart(6, '0');
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `BAW-${year}${month}-${nextId}`;
  } else {
    // Fallback to timestamp-based reference
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `BAW-${year}${month}-${timestamp}`;
  }
}

// Centralized warranty duration utilities to ensure consistency
function getWarrantyDurationInMonths(paymentType: string): number {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
    case '12months':
    case '12month':
    case 'yearly':
    case 'annual':
    case 'year':
      return 12;
    case '24months':
    case '24month':
    case 'twomonthly':
    case '2monthly':
    case 'twoyear':
    case 'twoyearly':
    case '2yearly':
    case '2years':
    case '2year':
      return 24;
    case '36months':
    case '36month':
    case 'threemonthly':
    case '3monthly':
    case 'threeyear':
    case 'threeyearly':
    case '3yearly':
    case '3years':
    case '3year':
      return 36;
    case '48months':
    case '48month':
    case 'fourmonthly':
    case '4monthly':
    case 'fouryearly':
    case '4yearly':
    case '4years':
    case '4year':
      return 48;
    case '60months':
    case '60month':
    case 'fivemonthly':
    case '5monthly':
    case 'fiveyearly':
    case '5yearly':
    case '5years':
    case '5year':
      return 60;
    default:
      console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
      return 12;
  }
}

// Helper function to get warranty duration as string for W2000 API
function getWarrantyDuration(paymentType: string): string {
  return getWarrantyDurationInMonths(paymentType).toString();
}

function mapPlanToWarrantyType(planId: string): string {
  const normalizedPlan = planId.toLowerCase();
  
  // Handle special vehicle types - check if plan name contains these terms
  if (normalizedPlan.includes('phev') || normalizedPlan.includes('hybrid')) {
    return 'B-PHEV';
  } else if (normalizedPlan.includes('electric') || normalizedPlan.includes('ev')) {
    return 'B-EV';
  } else if (normalizedPlan.includes('motorbike') || normalizedPlan.includes('motorcycle')) {
    return 'B-MOTORBIKE';
  }
  
  // Handle standard plan types - ALL NOW PLATINUM
  if (normalizedPlan.includes('basic')) {
    return 'B-PLATINUM';
  } else if (normalizedPlan.includes('gold')) {
    return 'B-PLATINUM';
  } else if (normalizedPlan.includes('platinum')) {
    return 'B-PLATINUM';
  }
  
  return 'B-PLATINUM'; // Default fallback
}

function estimateEngineSize(make?: string): string {
  if (!make) return '1.6';
  
  const makeLower = make.toLowerCase();
  if (makeLower.includes('mini') || makeLower.includes('smart')) return '1.0';
  if (makeLower.includes('bmw') || makeLower.includes('audi')) return '2.0';
  if (makeLower.includes('ford') || makeLower.includes('vauxhall')) return '1.6';
  
  return '1.6'; // Default
}

function extractTitle(fullName: string): string {
  const name = fullName.toLowerCase();
  if (name.includes('mr.') || name.includes('mr ')) return 'Mr';
  if (name.includes('mrs.') || name.includes('mrs ')) return 'Mrs';
  if (name.includes('ms.') || name.includes('ms ')) return 'Ms';
  if (name.includes('miss') || name.includes('miss ')) return 'Miss';
  if (name.includes('dr.') || name.includes('dr ')) return 'Dr';
  return 'Mr'; // Default
}

function extractFirstName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    // Skip title if present
    const firstPart = parts[0].toLowerCase();
    if (['mr', 'mrs', 'ms', 'miss', 'dr', 'mr.', 'mrs.', 'ms.', 'dr.'].includes(firstPart)) {
      return parts[1] || 'Unknown';
    }
    return parts[0] || 'Unknown';
  }
  return fullName || 'Unknown';
}

function extractSurname(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    return parts[parts.length - 1] || 'Unknown';
  }
  return 'Unknown';
}

function calculateClaimLimit(planId: string, paymentType: string): number {
  const plan = planId?.toLowerCase() || '';
  const duration = getWarrantyDurationInMonths(paymentType);
  
  // Handle special vehicle types - use consistent claim limits with W2000
  if (plan.includes('phev') || plan.includes('hybrid')) {
    return 1250; // Changed to match W2000 valid limits
  } else if (plan.includes('electric') || plan.includes('ev')) {
    return 1250; // Changed to match W2000 valid limits
  } else if (plan.includes('motorbike') || plan.includes('motorcycle')) {
    return 1250; // Changed to match W2000 valid limits
  }
  
  // Standardized claim limits based on plan type and duration - consistent with W2000
  if (plan.includes('basic')) {
    if (duration === 36) return 750;   // 3-year Basic: £750 (valid W2000 limit)
    if (duration === 24) return 750;   // 2-year Basic: £750 (valid W2000 limit)
    return 1250;                       // 1-year Basic: £1250 (valid W2000 limit)
  } else if (plan.includes('gold') || plan.includes('premium')) {
    if (duration === 36) return 750;   // 3-year Gold/Premium: £750 (valid W2000 limit)
    if (duration === 24) return 1250;  // 2-year Gold/Premium: £1250 (changed from 1000)
    return 1250;                       // 1-year Gold/Premium: £1250
  } else if (plan.includes('platinum')) {
    if (duration === 36) return 750;   // 3-year Platinum: £750 (valid W2000 limit)
    if (duration === 24) return 1250;  // 2-year Platinum: £1250 (changed from 1000)
    return 1250;                       // 1-year Platinum: £1250
  }
  
  return 750; // Default fallback - valid W2000 limit
}

function calculateVoluntaryExcess(planId: string, paymentType: string): number {
  const plan = planId?.toLowerCase() || '';
  const duration = getWarrantyDurationInMonths(paymentType);
  
  // Standard voluntary excess amounts
  if (plan.includes('platinum')) {
    return 150;
  } else if (plan.includes('gold')) {
    return 200;
  } else if (plan.includes('basic')) {
    return 250;
  }
  
  return 150; // Default fallback
}

function getPriceFromMapping(planId: string, paymentType: string): number {
  const pricingMap: Record<string, Record<string, number>> = {
    basic: {
      monthly: 21, yearly: 252, two_yearly: 480, three_yearly: 693
    },
    gold: {
      monthly: 28, yearly: 336, two_yearly: 640, three_yearly: 924
    },
    platinum: {
      monthly: 36, yearly: 437, two_yearly: 831, three_yearly: 1200
    }
  };

  return pricingMap[planId]?.[paymentType] || 31;
}