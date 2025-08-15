
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HANDLE-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const { planId, paymentType, userEmail, userId, stripeSessionId, vehicleData, customerData, skipEmail } = await req.json();
    logStep("Request data", { planId, paymentType, userEmail, userId, stripeSessionId, skipEmail });

    if (!planId || !paymentType || !userEmail) {
      throw new Error("Missing required parameters");
    }

    // Generate BAW warranty reference number for Warranties 2000
    const warrantyReference = await generateWarrantyReference();
    logStep("Generated warranty reference", { warrantyReference });

    // Create or update customer record in database
    const customerName = `${customerData?.first_name || ''} ${customerData?.last_name || ''}`.trim() || 
                        customerData?.fullName || vehicleData?.fullName || 'Unknown Customer';
    
    // Keep plan type as provided (it comes from the plans table with correct casing)
    const normalizedPlanType = planId;
    
    const customerRecord = {
      name: customerName,
      email: userEmail,
      phone: customerData?.mobile || customerData?.phone || vehicleData?.phone || '',
      first_name: customerData?.first_name || extractFirstName(customerName),
      last_name: customerData?.last_name || extractSurname(customerName),
      flat_number: customerData?.flat_number || '',
      building_name: customerData?.building_name || '',
      building_number: customerData?.building_number || '',
      street: customerData?.street || extractStreet(customerData?.address || vehicleData?.address || ''),
      town: customerData?.town || extractTown(customerData?.address || vehicleData?.address || ''),
      county: customerData?.county || '',
      postcode: customerData?.postcode || extractPostcode(customerData?.address || vehicleData?.address || ''),
      country: customerData?.country || 'United Kingdom',
      plan_type: normalizedPlanType,
      payment_type: paymentType,
      stripe_session_id: stripeSessionId,
      registration_plate: vehicleData?.regNumber || customerData?.vehicle_reg || 'Unknown',
      vehicle_make: vehicleData?.make || 'Unknown',
      vehicle_model: vehicleData?.model || 'Unknown',
      vehicle_year: vehicleData?.year || '',
      vehicle_fuel_type: vehicleData?.fuelType || '',
      vehicle_transmission: vehicleData?.transmission || '',
      mileage: vehicleData?.mileage || '',
      status: 'Active',
      discount_code: customerData?.discount_code || null,
      discount_amount: customerData?.discount_amount || 0,
      original_amount: customerData?.original_amount || null,
      final_amount: customerData?.final_amount || null,
      warranty_reference_number: warrantyReference
    };

    logStep("Creating customer record", customerRecord);

    const { data: customerData2, error: customerError } = await supabaseClient
      .from('customers')
      .insert(customerRecord)
      .select()
      .single();

    if (customerError) {
      logStep("Warning: Customer record creation failed", customerError);
    } else {
      logStep("Customer record created successfully", { customerId: customerData2.id });
      
      // Create policy record
      const policyRecord = {
        customer_id: customerData2.id,
        user_id: userId,
        email: userEmail,
        plan_type: planId.toLowerCase(), // customer_policies table expects lowercase
        payment_type: paymentType,
        policy_number: warrantyReference,
        policy_start_date: new Date().toISOString(),
        policy_end_date: calculatePolicyEndDate(paymentType),
        status: 'active'
      };

      const { error: policyError } = await supabaseClient
        .from('customer_policies')
        .insert(policyRecord);

      if (policyError) {
        logStep("Warning: Policy record creation failed", policyError);
      } else {
        logStep("Policy record created successfully");
      }
    }

  // Send welcome email using the manual system (unless skipEmail is true)
  let policy = null;
  if (customerData2?.id && !skipEmail) {
    const { data: policyData } = await supabaseClient
      .from('customer_policies')
      .select('id')
      .eq('customer_id', customerData2.id)
      .single();
    policy = policyData;
        
      if (policy?.id) {
        logStep("Attempting to send welcome email", { 
          customerId: customerData2.id, 
          policyId: policy.id,
          customerEmail: userEmail,
          planType: planId
        });
        
        // Send welcome email using proper Supabase function invocation
        try {
          console.log(`[AUTOMATED-EMAIL-DEBUG] Sending welcome email for policy:`, {
            customerId: customerData2.id,
            policyId: policy.id,
            userEmail,
            planId
          });

          // Send policy documents email using send-policy-documents function
          const paymentTypeDisplay = getPaymentTypeDisplay(paymentType);
          
          const emailPayload = {
            recipientEmail: userEmail,
            variables: {
              customerName: customerName,
              planType: planId,
              policyNumber: warrantyReference,
              registrationPlate: vehicleData?.regNumber || customerData?.vehicle_reg || 'Unknown',
              paymentType: paymentTypeDisplay,
              vehicleType: vehicleData?.vehicleType || 'standard',
              stripeSessionId: stripeSessionId,
              paymentSource: 'stripe' // This function handles Stripe payments
            }
          };

          // Use Supabase client to invoke the policy documents function
          const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-policy-documents', {
            body: emailPayload
          });
          
          console.log(`[AUTOMATED-EMAIL-DEBUG] Function invoke response:`, {
            data: emailResult,
            error: emailError
          });

          if (emailError) {
            logStep("ERROR: Welcome email failed via function invoke", emailError);
            
            // Update policy status to reflect email failure
            await supabaseClient
              .from('customer_policies')
              .update({ email_sent_status: 'failed' })
              .eq('id', policy.id);
          } else {
            logStep("SUCCESS: Welcome email sent successfully via function invoke", emailResult);
            
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
          logStep("Function invoke error", {
            error: emailError,
            message: emailError instanceof Error ? emailError.message : String(emailError),
            stack: emailError instanceof Error ? emailError.stack : undefined
          });
          
          // Update policy status to reflect email failure
          await supabaseClient
            .from('customer_policies')
            .update({ email_sent_status: 'failed' })
            .eq('id', policy.id);
        }
      } else {
        logStep("WARNING: No policy found for welcome email", { customerId: customerData2.id });
      }
    } else if (skipEmail) {
      logStep("Skipping email sending as requested", { skipEmail: true });
    } else {
      logStep("WARNING: No customer ID available for welcome email");
    }

    // Register warranty with Warranties 2000 if vehicle data is available and customer/policy created
    if (vehicleData && vehicleData.regNumber && customerData2?.id) {
      logStep("Attempting warranty registration with Warranties 2000");
      
      try {
        // Get the policy ID that was just created
        const { data: policyData } = await supabaseClient
          .from('customer_policies')
          .select('id')
          .eq('customer_id', customerData2.id)
          .eq('policy_number', warrantyReference)
          .single();
          
        if (policyData?.id) {
          logStep("Found policy for warranty registration", { policyId: policyData.id });

          const { data: warrantyData, error: warrantyError } = await supabaseClient.functions.invoke('send-to-warranties-2000', {
            body: { policyId: policyData.id, customerId: customerData2.id }
          });

          if (warrantyError) {
            logStep("Warning: Warranty registration failed", warrantyError);
          } else {
            logStep("Warranty registration successful", warrantyData);
          }
        } else {
          logStep("Warning: Could not find policy ID for warranty registration");
        }
      } catch (warrantyRegError) {
        logStep("Warning: Warranty registration error", { error: warrantyRegError });
        // Don't fail the payment process if warranty registration fails
      }
    } else {
      logStep("Skipping warranty registration", { 
        hasVehicleData: !!vehicleData,
        hasRegNumber: !!vehicleData?.regNumber,
        hasCustomerId: !!customerData2?.id
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed successfully",
      policyNumber: warrantyReference,
      customerId: customerData2?.id,
      policyId: policy?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in handle-successful-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Generate BAW warranty reference number in format: BAW-[YYMM]-[SERIAL]
async function generateWarrantyReference(): Promise<string> {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const date = new Date();
  const year = String(date.getFullYear()).slice(-2); // Last 2 digits of year
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateCode = `${year}${month}`;

  try {
    // Get the next serial number from the database
    const { data, error } = await supabaseClient.rpc('get_next_warranty_serial');
    
    if (error) {
      console.error('Error getting warranty serial:', error);
      // Fallback to timestamp-based serial if database call fails
      const fallbackSerial = 400000 + Date.now() % 100000;
      return `BAW-${dateCode}-${fallbackSerial}`;
    }

    const serialNumber = data || 400001;
    return `BAW-${dateCode}-${serialNumber}`;
  } catch (error) {
    console.error('Error in generateWarrantyReference:', error);
    // Fallback to timestamp-based serial
    const fallbackSerial = 400000 + Date.now() % 100000;
    return `BAW-${dateCode}-${fallbackSerial}`;
  }
}

// Helper functions for warranty registration
function getWarrantyDuration(paymentType: string): string {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
      return '12'; // Monthly payments still provide 12 months minimum coverage
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
    case 'two_yearly':
      return '24';
    case 'threeyearly':
    case '3yearly':
    case '36months':
    case '36month':
    case '3years':
    case '3year':
    case 'three_yearly':
      return '36';
    case 'fouryearly':
    case '4yearly':
    case '48months':
    case '48month':
    case '4years':
    case '4year':
    case 'four_yearly':
      return '48';
    case 'fiveyearly':
    case '5yearly':
    case '60months':
    case '60month':
    case '5years':
    case '5year':
    case 'five_yearly':
      return '60';
    default:
      console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
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
    return '3000';
  } else if (normalizedPlan.includes('gold')) {
    return '5000';
  } else if (normalizedPlan.includes('platinum')) {
    return '7500';
  }
  
  return '3000'; // Default fallback
}

function getWarrantyType(planId: string): string {
  const normalizedPlan = planId.toLowerCase();
  
  // Handle special vehicle types
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

function extractTown(address: string): string {
  // Try to extract town from address - this is a simple implementation
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return address || 'Unknown';
}

function extractPostcode(address: string): string {
  // Try to extract UK postcode from address
  const postcodeRegex = /([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})/gi;
  const match = address.match(postcodeRegex);
  return match ? match[0] : 'SW1A 1AA'; // Default to a valid UK postcode
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

// Helper function to extract street from address
function extractStreet(address: string): string {
  const parts = address.split(',');
  return parts[0]?.trim() || address || 'Unknown';
}

// Helper function to calculate policy end date
function calculatePolicyEndDate(paymentType: string): string {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  const now = new Date();
  
  let months = 12; // Default
  switch (normalizedPaymentType) {
    case 'monthly':
    case 'yearly':
    case 'annual':
      months = 12;
      break;
    case 'twoyearly':
    case '2yearly':
    case 'two_yearly':
      months = 24;
      break;
    case 'threeyearly':
    case '3yearly':
    case 'three_yearly':
      months = 36;
      break;
    case 'fouryearly':
    case '4yearly':
    case 'four_yearly':
      months = 48;
      break;
    case 'fiveyearly':
    case '5yearly':
    case 'five_yearly':
      months = 60;
      break;
  }
  
  now.setMonth(now.getMonth() + months);
  return now.toISOString();
}

// Helper function to convert payment type to user-friendly display format
function getPaymentTypeDisplay(paymentType: string): string {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly': return 'Monthly';
    case 'yearly':
    case 'annual': return '12 months';
    case 'twoyearly':
    case '2yearly':
    case 'two_yearly': return '24 months';
    case 'threeyearly':
    case '3yearly':
    case 'three_yearly': return '36 months';
    case 'fouryearly':
    case '4yearly':
    case 'four_yearly': return '48 months';
    case 'fiveyearly':
    case '5yearly':
    case 'five_yearly': return '60 months';
    default: return paymentType || 'Unknown';
  }
}
