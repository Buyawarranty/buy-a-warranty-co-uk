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

    const { planId, paymentType, customerData, vehicleData, sessionId, discountCode, discountAmount, originalAmount, finalAmount } = await req.json();
    logStep("Processing Bumper payment", { planId, paymentType, hasCustomerData: !!customerData, hasVehicleData: !!vehicleData });

    if (!planId) {
      throw new Error("Plan ID is required");
    }

    // Get plan details - Bumper sends plan name, not UUID
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('name', planId.charAt(0).toUpperCase() + planId.slice(1).toLowerCase()) // Convert "basic" to "Basic"
      .single();

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
    
    // Create customer record with all details
    const { data: customer, error: customerError } = await supabaseClient
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
        discount_amount: discountAmount,
        original_amount: originalAmount,
        final_amount: finalAmount
      })
      .select()
      .single();

    if (customerError) {
      logStep("Error creating customer", { error: customerError });
      throw new Error("Failed to create customer record");
    }

    logStep("Customer created", { customerId: customer.id });

    // Calculate policy dates
    const startDate = new Date();
    let endDate = new Date();
    
    switch (paymentType) {
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

    // Generate warranty reference for all Bumper customers
    let warrantyRef = null;
    try {
      warrantyRef = await generateWarrantyReference();
      logStep("Generated warranty reference", { warrantyRef });
    } catch (error) {
      logStep("Failed to generate warranty reference", { error: error.message });
    }

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
          Model: vehicleData?.model || "Focus",
          RegNum: vehicleReg || "BUMPER001",
          Mileage: vehicleData?.mileage || "50000",
          EngSize: vehicleData?.engineSize || "1.6",
          PurPrc: calculatePurchasePrice(plan.name.toLowerCase(), 'monthly').toString(),
          RegDate: vehicleData?.year ? `${vehicleData.year}-01-01` : '2020-01-01',
          WarType: getWarrantyType(plan.name.toLowerCase()),
          Month: getWarrantyDuration('monthly'),
          MaxClm: getMaxClaimAmount(plan.name.toLowerCase()),
          MOTDue: vehicleData?.motExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Ref: warrantyRef
        };

        logStep("Sending Bumper customer data to Warranties 2000", { 
          regNum: registrationData.RegNum, 
          warType: registrationData.WarType,
          name: `${registrationData.First} ${registrationData.Surname}`,
          email: registrationData.EMail
        });

        const warrantiesResponse = await supabaseClient.functions.invoke('warranties-2000-registration', {
          body: registrationData
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

    // Send welcome email
    try {
      await supabaseClient.functions.invoke('send-welcome-email', {
        body: {
          email: customerEmail,
          policyNumber: policyNumber,
          planType: plan.name,
          customerName: customerName.includes('Customer') ? "Valued Customer" : customerName
        }
      });
      logStep("Welcome email sent");
    } catch (emailError) {
      logStep("Welcome email failed", { error: emailError });
      // Don't throw as the main process succeeded
    }

    return new Response(JSON.stringify({
      success: true,
      policyNumber: policyNumber,
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
  switch (paymentType) {
    case 'monthly': return '1';
    case 'yearly': return '12';
    case 'two_yearly': return '24';
    case 'three_yearly': return '36';
    default: return '12';
  }
}

function getMaxClaimAmount(planId: string): string {
  switch (planId.toLowerCase()) {
    case 'basic': return '500';
    case 'gold': return '1000';
    case 'platinum': return '1200';
    default: return '500';
  }
}

function getWarrantyType(planId: string): string {
  switch (planId.toLowerCase()) {
    case 'basic': return 'B-BASIC';
    case 'gold': return 'B-GOLD';
    case 'platinum': return 'B-PLATINUM';
    default: return 'B-BASIC';
  }
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