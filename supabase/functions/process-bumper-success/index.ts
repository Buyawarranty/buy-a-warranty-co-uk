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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse URL parameters from Bumper redirect
    const url = new URL(req.url);
    const planId = url.searchParams.get('plan');
    const paymentType = url.searchParams.get('payment') || 'monthly';
    const redirectUrl = url.searchParams.get('redirect');
    
    // Extract customer data from URL parameters
    const customerData = {
      first_name: url.searchParams.get('first_name'),
      last_name: url.searchParams.get('last_name'),
      email: url.searchParams.get('email'),
      mobile: url.searchParams.get('mobile'),
      street: url.searchParams.get('street'),
      town: url.searchParams.get('town'),
      county: url.searchParams.get('county'),
      postcode: url.searchParams.get('postcode'),
      country: url.searchParams.get('country'),
      building_name: url.searchParams.get('building_name'),
      flat_number: url.searchParams.get('flat_number'),
      building_number: url.searchParams.get('building_number'),
      vehicle_reg: url.searchParams.get('vehicle_reg')
    };
    
    // Extract vehicle data from URL parameters
    const vehicleData = {
      regNumber: url.searchParams.get('vehicle_reg'),
      make: url.searchParams.get('vehicle_make'),
      model: url.searchParams.get('vehicle_model'),
      year: url.searchParams.get('vehicle_year'),
      fuelType: url.searchParams.get('vehicle_fuel_type'),
      transmission: url.searchParams.get('vehicle_transmission'),
      mileage: url.searchParams.get('mileage'),
      vehicleType: url.searchParams.get('vehicle_type')
    };
    
    const discountCode = url.searchParams.get('discount_code');
    const finalAmount = parseFloat(url.searchParams.get('final_amount') || '0');
    const originalPaymentType = url.searchParams.get('original_payment_type');
    const sessionId = `bumper_${Date.now()}`; // Generate session ID for Bumper orders
    logStep("Processing Bumper payment", { planId, paymentType, hasCustomerData: !!customerData, hasVehicleData: !!vehicleData });

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    // Get plan details - For special vehicles, Bumper might send the full plan name
    let plan;
    let planError;
    
    // First try exact match
    const { data: exactPlan, error: exactError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('name', planId)
      .single();
    
    if (exactPlan) {
      plan = exactPlan;
    } else {
      // Try converting case for standard plans: "basic" to "Basic"
      const { data: casePlan, error: caseError } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('name', planId.charAt(0).toUpperCase() + planId.slice(1).toLowerCase())
        .single();
      
      if (casePlan) {
        plan = casePlan;
      } else {
        // Try special vehicle plans table for PHEV, EV, MOTORBIKE
        const { data: specialPlan, error: specialError } = await supabaseClient
          .from('special_vehicle_plans')
          .select('*')
          .ilike('name', `%${planId}%`)
          .single();
          
        if (specialPlan) {
          plan = specialPlan;
        } else {
          planError = exactError || caseError || specialError;
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
      logStep("Failed to generate warranty reference", { error: error.message });
    }

    // Create new customer record (always create new for each order, even for same email)
    logStep("Creating new customer record");
    
    const { data: newCustomer, error: customerError } = await supabaseClient
      .from('customers')
      .insert({
        name: customerName,
        email: customerEmail,
        phone: customerData?.mobile,
        first_name: customerData?.first_name,
        last_name: customerData?.last_name,
        flat_number: customerData?.flat_number,
        building_name: customerData?.building_name,
        building_number: customerData?.building_number,
        street: customerData?.street,
        town: customerData?.town,
        county: customerData?.county,
        postcode: customerData?.postcode,
        country: customerData?.country || 'United Kingdom',
        plan_type: plan.name,
        status: 'Active',
        registration_plate: vehicleReg,
        vehicle_make: vehicleData?.make,
        vehicle_model: vehicleData?.model,
        vehicle_year: vehicleData?.year,
        vehicle_fuel_type: vehicleData?.fuelType,
        vehicle_transmission: vehicleData?.transmission,
        mileage: vehicleData?.mileage,
        payment_type: paymentType,
        bumper_order_id: sessionId,
        discount_code: discountCode,
        discount_amount: 0,
        original_amount: finalAmount,
        final_amount: finalAmount,
        warranty_reference_number: warrantyRef,
        warranty_number: warrantyRef
      })
      .select()
      .single();

    if (customerError) {
      logStep("Error creating customer", { error: customerError });
      throw new Error("Failed to create customer record");
    }
    
    const customer = newCustomer;

    logStep("Customer created", { customerId: customer.id });

    // Calculate policy dates
    const startDate = new Date();
    let endDate = new Date();
    
    // For Bumper orders, determine the actual policy duration based on the plan and amount
    // Since Bumper can process monthly payments for longer-term plans
    let actualPaymentType = paymentType;
    
    // If it's monthly payment, check if the amounts suggest a longer term
    if (paymentType === 'monthly' && finalAmount) {
      const monthlyExpected = plan.monthly_price;
      const yearlyExpected = plan.yearly_price;
      const twoYearExpected = plan.two_yearly_price;
      
      // Check if the total amount suggests a longer-term plan
      if (twoYearExpected && Math.abs(finalAmount - twoYearExpected) < 10) {
        actualPaymentType = 'twoYear';
      } else if (yearlyExpected && Math.abs(finalAmount - yearlyExpected) < 10) {
        actualPaymentType = 'yearly';
      }
    }
    
    switch (actualPaymentType) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'twoYear':
        endDate.setFullYear(endDate.getFullYear() + 2);
        break;
      case 'threeYear':
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create policy record
    const { data: policy, error: policyError } = await supabaseClient
      .from('customer_policies')
      .insert({
        customer_id: customer.id, // Link to the customer record
        user_id: null, // No user account for Bumper payments
        email: customerEmail,
        plan_type: plan.name,
        payment_type: paymentType,
        policy_number: policyNumber,
        warranty_number: warrantyRef,
        bumper_order_id: sessionId,
        policy_start_date: startDate.toISOString(),
        policy_end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (policyError) {
      logStep("Error creating policy", { error: policyError });
      throw new Error("Failed to create policy record");
    }

    logStep("Policy created", { policyId: policy.id, policyNumber });

    // Create payment record (amount will be monthly since Bumper forces monthly)
    const monthlyPrice = plan.monthly_price;
    
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        customer_id: customer.id,
        amount: monthlyPrice,
        plan_type: plan.name,
        currency: 'GBP',
        stripe_payment_id: null // No Stripe ID for Bumper payments
      });

    if (paymentError) {
      logStep("Error creating payment record", { error: paymentError });
      // Don't throw here as the main policy creation succeeded
    }

    logStep("Payment record created");

    // Register with Warranties 2000 for all Bumper customers
    // Use available data and reasonable defaults where needed
    if (warrantyRef) {
      try {
        logStep("Attempting Warranties 2000 registration for Bumper customer");
        
        // Build comprehensive address string from all available fields
        const buildAddress = (customerData: any) => {
          const addressParts = [];
          
          if (customerData?.flat_number) addressParts.push(customerData.flat_number);
          if (customerData?.building_name) addressParts.push(customerData.building_name);
          if (customerData?.building_number) addressParts.push(customerData.building_number);
          if (customerData?.street) addressParts.push(customerData.street);
          
          return addressParts.join(' ').trim() || "123 Customer Street";
        };

        const registrationData = {
          Title: extractTitle(customerName) || "Mr",
          First: customerData?.first_name || extractFirstName(customerName),
          Surname: customerData?.last_name || extractSurname(customerName),
          Addr1: buildAddress(customerData),
          Addr2: customerData?.county || undefined,
          Town: customerData?.town || "London",
          PCode: customerData?.postcode || "SW1A 1AA",
          Tel: customerData?.mobile || '02012345678',
          Mobile: customerData?.mobile || '07123456789',
          EMail: customerEmail,
          PurDate: new Date().toISOString().split('T')[0],
          Make: vehicleData?.make || "Ford",
          RegNum: vehicleReg || "BUMPER001",
          Mileage: String(Math.floor(parseFloat(vehicleData?.mileage || '50000'))), // Whole number as string
          EngSize: "", // Pass empty string as requested
          PurPrc: calculatePurchasePrice(plan.name.toLowerCase(), 'monthly').toString(),
          RegDate: vehicleData?.year ? `${vehicleData.year}-01-01` : '2020-01-01',
          WarType: getWarrantyType(plan.name.toLowerCase()),
          Month: getWarrantyDuration(url.searchParams.get('original_payment_type') || 'yearly'),
          MaxClm: getMaxClaimAmount(plan.name.toLowerCase()),
          Notes: "Bumper customer registration",
          MOTDue: vehicleData?.motExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Ref: warrantyRef
        };

        logStep("Sending Bumper customer data to Warranties 2000", { 
          regNum: registrationData.RegNum, 
          warType: registrationData.WarType,
          name: `${registrationData.First} ${registrationData.Surname}`,
          email: registrationData.EMail
        });

        const warrantiesResponse = await supabaseClient.functions.invoke('send-to-warranties-2000', {
          body: { customerId: customer.id }
        });

        if (warrantiesResponse.error) {
          logStep("Warranties 2000 registration failed", { error: warrantiesResponse.error });
        } else {
          logStep("Warranties 2000 registration successful for Bumper customer", { response: warrantiesResponse.data });
        }
      } catch (warrantiesError) {
        logStep("Error during Warranties 2000 registration for Bumper customer", { error: warrantiesError.message });
      }
    } else {
      logStep("Skipping Warranties 2000 registration - no warranty reference generated");
    }

    // Send welcome email automatically for Bumper customers
    try {
      console.log(`[BUMPER-EMAIL-DEBUG] Sending welcome email for policy:`, {
        customerId: customer.id,
        policyId: policy.id,
        customerEmail: customer.email,
        planType: plan.name
      });

      const emailPayload = {
        customerId: customer.id,
        policyId: policy.id
      };

      // Use Supabase client to invoke the function
      const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-welcome-email-manual', {
        body: emailPayload
      });
      
      console.log(`[BUMPER-EMAIL-DEBUG] Email function response:`, {
        data: emailResult,
        error: emailError
      });

      if (emailError) {
        logStep("ERROR: Welcome email failed", { 
          error: emailError,
          policyId: policy.id
        });
        
        // Update policy status to reflect email failure
        await supabaseClient
          .from('customer_policies')
          .update({ 
            email_sent_status: 'failed',
            email_sent_at: new Date().toISOString()
          })
          .eq('id', policy.id);
      } else {
        logStep("SUCCESS: Welcome email sent successfully", emailResult);
        
        // Update policy status to reflect email success
        await supabaseClient
          .from('customer_policies')
          .update({ 
            email_sent_status: 'sent',
            email_sent_at: new Date().toISOString()
          })
          .eq('id', policy.id);
      }

    } catch (emailError) {
      logStep("Welcome email failed", { 
        error: emailError,
        message: emailError instanceof Error ? emailError.message : String(emailError),
        policyId: policy.id
      });
      
      // Update policy status to reflect email failure
      await supabaseClient
        .from('customer_policies')
        .update({ 
          email_sent_status: 'failed',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', policy.id);
    }

    // Redirect to thank you page if redirectUrl is provided
    if (redirectUrl) {
      return new Response(null, {
        headers: { 
          ...corsHeaders,
          'Location': redirectUrl
        },
        status: 302,
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      policyNumber: warrantyRef || policyNumber, // Return warranty number for Bumper orders
      planType: plan.name,
      message: "Payment processed successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-bumper-success", { message: errorMessage });
    
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
  
  // Handle standard plan types
  if (normalizedPlan.includes('basic')) {
    return 'B-BASIC';
  } else if (normalizedPlan.includes('gold')) {
    return 'B-GOLD';
  } else if (normalizedPlan.includes('platinum')) {
    return 'B-PLATINUM';
  }
  
  return 'B-BASIC'; // Default fallback
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