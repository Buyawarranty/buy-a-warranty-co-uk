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
        order_reference: url.searchParams.get('order_reference'),
        status: url.searchParams.get('status'),
        amount: url.searchParams.get('amount')
      };
      
      logStep("Checking for alternative Bumper parameters", bumperParams);
      
      if (bumperParams.order_reference) {
        transactionId = bumperParams.order_reference;
        logStep("Using order_reference as transaction ID", { transactionId });
      } else {
        logStep("No valid transaction identifier found");
        return new Response(`
          <!DOCTYPE html>
          <html><head><title>Payment Processing Error</title></head>
          <body>
            <h1>Payment Processing Error</h1>
            <p>Invalid request - missing transaction identifier</p>
            <p>Received parameters: ${JSON.stringify(allParams)}</p>
            <p><a href="/">Return to Home</a></p>
          </body></html>
        `, { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }
    }

    logStep("Processing Bumper success callback", { transactionId });

    // Retrieve transaction data from database
    logStep("Searching for transaction", { transactionId, status: 'pending' });
    
    const { data: transactionData, error: fetchError } = await supabaseClient
      .from('bumper_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('status', 'pending')
      .maybeSingle();

    logStep("Transaction query result", { 
      found: !!transactionData, 
      error: fetchError,
      transactionId 
    });

    if (fetchError) {
      logStep("Database error fetching transaction", { transactionId, error: fetchError });
      return new Response(`
        <!DOCTYPE html>
        <html><head><title>Database Error</title></head>
        <body>
          <h1>Database Error</h1>
          <p>Error fetching transaction: ${fetchError.message}</p>
          <p>Transaction ID: ${transactionId}</p>
          <p><a href="/">Return to Home</a></p>
        </body></html>
      `, { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (!transactionData) {
      // Check if transaction exists with any status
      const { data: anyStatusTransaction, error: anyStatusError } = await supabaseClient
        .from('bumper_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .maybeSingle();
      
      if (anyStatusTransaction) {
        logStep("Transaction found but with different status", { 
          transactionId, 
          status: anyStatusTransaction.status,
          createdAt: anyStatusTransaction.created_at
        });
        
        return new Response(`
          <!DOCTYPE html>
          <html><head><title>Payment Already Processed</title></head>
          <body>
            <h1>Payment Already Processed</h1>
            <p>This payment has already been processed.</p>
            <p>Status: ${anyStatusTransaction.status}</p>
            <p><a href="/customer-dashboard">View Your Policies</a></p>
          </body></html>
        `, { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      } else {
        logStep("Transaction not found in database at all", { transactionId, anyStatusError });
        
        return new Response(`
          <!DOCTYPE html>
          <html><head><title>Transaction Not Found</title></head>
          <body>
            <h1>Transaction Not Found</h1>
            <p>We couldn't find your payment transaction in our system.</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>This might be because:</p>
            <ul>
              <li>The payment process was interrupted</li>
              <li>There was a temporary system issue</li>
              <li>The transaction ID format is incorrect</li>
            </ul>
            <p>Please contact our support team with this transaction ID.</p>
            <p><a href="/contact">Contact Support</a> | <a href="/">Return to Home</a></p>
          </body></html>
        `, { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }
    }

    // Extract data from stored transaction
    const planId = transactionData.plan_id;
    const paymentType = transactionData.payment_type;
    const redirectUrl = transactionData.redirect_url;
    const customerData = transactionData.customer_data;
    const vehicleData = transactionData.vehicle_data;
    const protectionAddOns = transactionData.protection_addons;
    const finalAmount = transactionData.final_amount;
    const discountCode = transactionData.discount_code;
    const addAnotherWarranty = transactionData.add_another_warranty;

    logStep("Retrieved transaction data", { 
      planId, 
      customerEmail: customerData.email,
      amount: finalAmount 
    });
    
    const sessionId = `bumper_${Date.now()}`; // Generate session ID for Bumper orders
    
    logStep("Processing Bumper payment", { 
      planId, 
      paymentType, 
      hasCustomerData: !!customerData, 
      hasVehicleData: !!vehicleData, 
      finalAmount 
    });

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    // Get plan details - For special vehicles, Bumper might send the full plan name
    let plan;
    let planError;
    
    logStep("Looking for plan", { planId, vehicleType: vehicleData.vehicleType });
    
    // First try exact match in plans table
    const { data: exactPlan, error: exactError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('name', planId)
      .single();
    
    if (exactPlan) {
      plan = exactPlan;
      logStep("Found exact plan match in plans table", { planName: plan.name });
    } else {
      // Try converting case for standard plans: "basic" to "Basic"
      const { data: casePlan, error: caseError } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('name', planId.charAt(0).toUpperCase() + planId.slice(1).toLowerCase())
        .single();
      
      if (casePlan) {
        plan = casePlan;
        logStep("Found case-converted plan match in plans table", { planName: plan.name });
      } else {
        // For PHEV/hybrid vehicles, try special vehicle plans table
        // Handle case-insensitive matching for names like "phev hybrid extended warranty"
        const { data: specialPlans, error: specialError } = await supabaseClient
          .from('special_vehicle_plans')
          .select('*')
          .ilike('name', `%${planId.replace(/\s+/g, '%')}%`)
          .eq('is_active', true);
          
        if (specialPlans && specialPlans.length > 0) {
          // Prefer PHEV vehicle_type for hybrid vehicles
          const phevPlan = specialPlans.find((p: any) => p.vehicle_type === 'PHEV');
          plan = phevPlan || specialPlans[0];
          logStep("Found special vehicle plan match", { planName: plan.name, vehicleType: plan.vehicle_type });
        } else {
          // Last resort: try fuzzy matching on plan names
          const planNameParts = planId.toLowerCase().split(' ');
          const { data: fuzzyPlans, error: fuzzyError } = await supabaseClient
            .from('special_vehicle_plans')
            .select('*')
            .eq('is_active', true);
            
          if (fuzzyPlans) {
            const matchingPlan = fuzzyPlans.find((p: any) => {
              const nameLower = p.name.toLowerCase();
              return planNameParts.every((part: string) => nameLower.includes(part));
            });
            
            if (matchingPlan) {
              plan = matchingPlan;
              logStep("Found fuzzy match in special vehicle plans", { planName: plan.name });
            }
          }
          
          if (!plan) {
            planError = exactError || caseError || specialError || fuzzyError;
            logStep("No plan matches found", { planId, errors: { exactError, caseError, specialError } });
          }
        }
      }
    }

    if (planError || !plan) {
      logStep("Plan not found", { planId, error: planError });
      throw new Error("Plan not found");
    }

    logStep("Plan retrieved", { planName: plan.name, planType: plan.name.toLowerCase() });

    // Generate policy number
    const policyNumber = `POL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    logStep("Generated policy number", { policyNumber });

    // Use customer data if provided, otherwise use default values
    const customerName = customerData ? `${customerData.first_name} ${customerData.last_name}` : "Bumper Customer";
    const customerEmail = customerData?.email || "guest@buyawarranty.com";
    const vehicleReg = vehicleData?.regNumber || customerData?.vehicle_reg || null;
    
    // Generate warranty reference first
    let warrantyRef = null;
    try {
      warrantyRef = await generateWarrantyReference();
      logStep("Generated warranty reference", { warrantyRef });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logStep("Failed to generate warranty reference", { error: errorMessage });
    }

    // For Bumper orders, determine the actual policy duration based on the plan and amount
    let actualPaymentType = paymentType;
    
    // If it's monthly payment, check if the amounts suggest a longer term
    if (paymentType === 'monthly' && finalAmount) {
      const monthlyExpected = plan.monthly_price;
      const twoMonthlyExpected = plan.two_monthly_price || plan.two_yearly_price;
      const threeMonthlyExpected = plan.three_monthly_price || plan.three_yearly_price;
      
      // Check if the total amount suggests a longer-term plan
      if (threeMonthlyExpected && Math.abs(finalAmount - threeMonthlyExpected) < 10) {
        actualPaymentType = '36months';
      } else if (twoMonthlyExpected && Math.abs(finalAmount - twoMonthlyExpected) < 10) {
        actualPaymentType = '24months';
      } else {
        actualPaymentType = '12months';
      }
    }

    // Prepare vehicle and customer data in the same format as Stripe
    const vehicleDataFormatted = {
      regNumber: vehicleData?.regNumber || customerData?.vehicle_reg || '',
      mileage: vehicleData?.mileage || '',
      make: vehicleData?.make || '',
      model: vehicleData?.model || '',
      year: vehicleData?.year || '',
      fuelType: vehicleData?.fuelType || '',
      transmission: vehicleData?.transmission || '',
      vehicleType: vehicleData?.vehicleType || 'standard',
      voluntaryExcess: vehicleData?.voluntaryExcess || 0,
      fullName: customerName,
      phone: customerData?.mobile || customerData?.phone || '',
      address: `${customerData?.street || ''}, ${customerData?.town || ''}, ${customerData?.county || ''}, ${customerData?.postcode || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',').trim(),
      email: customerEmail
    };

    const customerDataFormatted = {
      first_name: customerData?.first_name || '',
      last_name: customerData?.last_name || '',
      mobile: customerData?.mobile || customerData?.phone || '',
      street: customerData?.street || '',
      town: customerData?.town || '',
      county: customerData?.county || '',
      postcode: customerData?.postcode || '',
      country: customerData?.country || 'United Kingdom',
      building_name: customerData?.building_name || '',
      flat_number: customerData?.flat_number || '',
      building_number: customerData?.building_number || '',
      vehicle_reg: vehicleData?.regNumber || customerData?.vehicle_reg || '',
      discount_code: discountCode || '',
      final_amount: finalAmount || 0,
      fullName: customerName,
      phone: customerData?.mobile || customerData?.phone || '',
      address: `${customerData?.street || ''}, ${customerData?.town || ''}, ${customerData?.county || ''}, ${customerData?.postcode || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',').trim()
    };

    logStep("Prepared data for handle-successful-payment", { 
      planId: plan.name, 
      actualPaymentType, 
      customerEmail,
      hasVehicleData: !!vehicleDataFormatted,
      hasCustomerData: !!customerDataFormatted
    });

    // Use the same handle-successful-payment function as Stripe (with email sending enabled)
    const { data: paymentData, error: paymentError } = await supabaseClient.functions.invoke('handle-successful-payment', {
      body: {
        planId: plan.name,
        paymentType: actualPaymentType,
        userEmail: customerEmail,
        userId: null, // No user account for Bumper payments
        stripeSessionId: sessionId, // Use Bumper session ID
        vehicleData: vehicleDataFormatted,
        customerData: customerDataFormatted,
        metadata: {
          plan_id: plan.name,
          payment_type: actualPaymentType,
          customer_name: customerName,
          customer_email: customerEmail,
          bumper_transaction_id: transactionId,
          final_amount: finalAmount.toString(),
          discount_code: discountCode
        }
        // No skipEmail: true - allow emails to be sent just like Stripe
      }
    });

    if (paymentError) {
      logStep("Error processing payment via handle-successful-payment", paymentError);
      throw new Error(`Payment processing failed: ${paymentError.message}`);
    }

    logStep("Payment processed successfully via handle-successful-payment", paymentData);

    // Email is already handled by handle-successful-payment function
    logStep("Email already sent via handle-successful-payment", { 
      customerId: paymentData?.customerId, 
      policyId: paymentData?.policyId
    });

    // Mark transaction as completed
    await supabaseClient
      .from('bumper_transactions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);
    
    logStep("Transaction marked as completed", { transactionId });

    // Redirect to thank you page if redirectUrl is provided
    if (redirectUrl) {
      // Ensure the redirect URL includes the required parameters for the ThankYou page
      const redirectUrlObj = new URL(redirectUrl);
      redirectUrlObj.searchParams.set('plan', planId);
      redirectUrlObj.searchParams.set('payment', paymentType);
      redirectUrlObj.searchParams.set('policyNumber', paymentData?.policyNumber || 'N/A');
      redirectUrlObj.searchParams.set('source', 'bumper');
      
      logStep("Redirecting to thank you page with parameters", { 
        originalUrl: redirectUrl,
        finalUrl: redirectUrlObj.toString(),
        plan: planId,
        payment: paymentType
      });
      
      return new Response(null, {
        headers: { 
          ...corsHeaders,
          'Location': redirectUrlObj.toString()
        },
        status: 302,
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Payment processed and warranty registered successfully",
      policyNumber: paymentData?.policyNumber,
      data: paymentData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-bumper-success", { message: errorMessage });
    
    // Mark transaction as failed
    if (transactionId) {
      try {
        await supabaseClient
          .from('bumper_transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      } catch (updateError) {
        logStep("Failed to update transaction status to failed", { updateError });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions for Warranties 2000 registration
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
      // Fallback to timestamp-based reference
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
    // Fallback to timestamp-based reference
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `BAW-${year}${month}-${timestamp}`;
  }
}

function getWarrantyDuration(paymentType: string): string {
  // Duration must be one of: 12, 24, 36, 48 or 60 months
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '');
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
      return '12';
    case 'yearly':
    case 'annual':
    case '12months':
    case '12month':
    case 'year':
      return '12';
    case 'twoyearly':
    case '2yearly':
    case '24months':
    case '24month':
    case '2years':
    case '2year':
      return '24';
    case 'threeyearly':
    case '3yearly':
    case '36months':
    case '36month':
    case '3years':
    case '3year':
      return '36';
    case 'fouryearly':
    case '4yearly':
    case '48months':
    case '48month':
    case '4years':
    case '4year':
      return '48';
    case 'fiveyearly':
    case '5yearly':
    case '60months':
    case '60month':
    case '5years':
    case '5year':
      return '60';
    default:
      return '12';
  }
}

function getMaxClaimAmount(planId: string): string {
  const normalizedPlan = planId.toLowerCase();
  
  // Handle special vehicle types
  if (normalizedPlan.includes('phev') || normalizedPlan.includes('hybrid')) {
    return '1000';
  } else if (normalizedPlan.includes('electric') || normalizedPlan.includes('ev')) {
    return '1000';
  } else if (normalizedPlan.includes('motorbike') || normalizedPlan.includes('motorcycle')) {
    return '1000';
  }
  
  // Handle standard plan types
  if (normalizedPlan.includes('basic')) {
    return '500';
  } else if (normalizedPlan.includes('gold')) {
    return '1000';
  } else if (normalizedPlan.includes('platinum')) {
    return '1200';
  }
  
  return '500'; // Default fallback
}

function getWarrantyType(planId: string): string {
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
    // Skip title if present
    const firstPart = parts[0].toLowerCase();
    if (['mr', 'mrs', 'ms', 'miss', 'dr', 'mr.', 'mrs.', 'ms.', 'dr.'].includes(firstPart)) {
      return parts.slice(2).join(' ') || parts[1] || 'Unknown';
    }
    return parts.slice(1).join(' ') || 'Unknown';
  }
  return 'Unknown';
}

function calculatePurchasePrice(planId: string, paymentType: string): number {
  const pricingMap: { [key: string]: { [key: string]: number } } = {
    basic: {
      monthly: 31, yearly: 381, two_yearly: 725, three_yearly: 1050
    },
    gold: {
      monthly: 34, yearly: 409, two_yearly: 777, three_yearly: 1125
    },
    platinum: {
      monthly: 36, yearly: 437, two_yearly: 831, three_yearly: 1200
    }
  };

  return pricingMap[planId]?.[paymentType] || 31;
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
      return 12;
    case '24months':
    case '24month':
    case 'twomonthly':
    case '2monthly':
    case 'twoyear':
    case 'yearly': // Legacy compatibility
      return 24;
    case '36months':
    case '36month':
    case 'threemonthly':
    case '3monthly':
    case 'threeyear':
      return 36;
    case '48months':
    case '48month':
    case 'fourmonthly':
    case '4monthly':
      return 48;
    case '60months':
    case '60month':
    case 'fivemonthly':
    case '5monthly':
      return 60;
    default:
      console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
      return 12;
  }
}