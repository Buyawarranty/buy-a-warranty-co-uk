
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

    const { planId, paymentType, userEmail, userId, stripeSessionId, vehicleData, customerData } = await req.json();
    logStep("Request data", { planId, paymentType, userEmail, userId, stripeSessionId });

    if (!planId || !paymentType || !userEmail) {
      throw new Error("Missing required parameters");
    }

    // Generate policy number
    const policyNumber = await generatePolicyNumber();
    logStep("Generated policy number", { policyNumber });

    // Send welcome email with login details
    const { data: welcomeData, error: welcomeError } = await supabaseClient.functions.invoke('send-welcome-email', {
      body: {
        email: userEmail,
        planType: planId,
        paymentType: paymentType,
        policyNumber: policyNumber
      }
    });

    if (welcomeError) {
      logStep("Warning: Welcome email failed", welcomeError);
    } else {
      logStep("Welcome email sent successfully", welcomeData);
    }

    // Register warranty with Warranties 2000 if vehicle data is available
    if (vehicleData && vehicleData.regNumber) {
      logStep("Attempting warranty registration with Warranties 2000");
      
      try {
        // Map payment type to warranty duration
        const warrantyDuration = getWarrantyDuration(paymentType);
        const maxClaimAmount = getMaxClaimAmount(planId);
        const warrantyType = getWarrantyType(planId);
        
        // Prepare registration data for Warranties 2000
        const registrationData = {
          Title: extractTitle(customerData?.fullName || vehicleData.fullName || ""),
          First: extractFirstName(customerData?.fullName || vehicleData.fullName || ""),
          Surname: extractSurname(customerData?.fullName || vehicleData.fullName || ""),
          Addr1: customerData?.address || vehicleData.address || "Not provided",
          Addr2: "", // Optional field
          Town: extractTown(customerData?.address || vehicleData.address || ""),
          PCode: extractPostcode(customerData?.address || vehicleData.address || ""),
          Tel: customerData?.phone || vehicleData.phone || "0000000000",
          Mobile: customerData?.phone || vehicleData.phone || "0000000000",
          EMail: userEmail,
          PurDate: new Date().toISOString().split('T')[0], // Today's date as purchase date
          Make: vehicleData.make || "Unknown",
          Model: vehicleData.model || "Unknown",
          RegNum: vehicleData.regNumber,
          Mileage: vehicleData.mileage || "0",
          EngSize: "2.0", // Default engine size, should be collected in form
          PurPrc: calculatePurchasePrice(planId, paymentType).toString(),
          RegDate: vehicleData.year ? `${vehicleData.year}-01-01` : "2020-01-01",
          WarType: warrantyType,
          Month: warrantyDuration,
          MaxClm: maxClaimAmount
        };

        logStep("Registering warranty", { regNum: registrationData.RegNum, warrantyType });

        const { data: warrantyData, error: warrantyError } = await supabaseClient.functions.invoke('warranties-2000-registration', {
          body: registrationData
        });

        if (warrantyError) {
          logStep("Warning: Warranty registration failed", warrantyError);
        } else {
          logStep("Warranty registration successful", warrantyData);
        }
      } catch (warrantyRegError) {
        logStep("Warning: Warranty registration error", { error: warrantyRegError });
        // Don't fail the payment process if warranty registration fails
      }
    } else {
      logStep("Skipping warranty registration - insufficient vehicle data");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed successfully",
      policyNumber: policyNumber
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

// Generate unique policy number
async function generatePolicyNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `POL-${year}${month}${day}-${random}`;
}

// Helper functions for warranty registration
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
    case 'basic': return '1000';
    case 'gold': return '2500';
    case 'platinum': return '5000';
    default: return '1000';
  }
}

function getWarrantyType(planId: string): string {
  switch (planId.toLowerCase()) {
    case 'basic': return 'DRIVER CARE BASIC';
    case 'gold': return 'DRIVER CARE GOLD';
    case 'platinum': return 'DRIVER CARE PLATINUM';
    default: return 'DRIVER CARE';
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
