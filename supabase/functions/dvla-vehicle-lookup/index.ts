
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DVLA-LOOKUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("DVLA lookup function started");

    const { registrationNumber } = await req.json();
    logStep("Registration number received", { registrationNumber });

    if (!registrationNumber) {
      throw new Error("Registration number is required");
    }

    // Clean the registration number (remove spaces, convert to uppercase)
    const cleanedReg = registrationNumber.replace(/\s/g, '').toUpperCase();
    logStep("Cleaned registration", { cleanedReg });

    const dvlaApiKey = Deno.env.get("DVLA_API_KEY");
    if (!dvlaApiKey) {
      throw new Error("DVLA API key not configured");
    }

    // Make request to DVLA API
    const dvlaResponse = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": dvlaApiKey
      },
      body: JSON.stringify({
        registrationNumber: cleanedReg
      })
    });

    logStep("DVLA API response", { status: dvlaResponse.status });

    if (!dvlaResponse.ok) {
      if (dvlaResponse.status === 404) {
        logStep("Vehicle not found in DVLA");
        return new Response(JSON.stringify({ 
          found: false,
          error: "Vehicle not found in DVLA database" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      const errorText = await dvlaResponse.text();
      logStep("DVLA API error", { status: dvlaResponse.status, error: errorText });
      throw new Error(`DVLA API error: ${dvlaResponse.status} ${errorText}`);
    }

    const vehicleData = await dvlaResponse.json();
    logStep("DVLA vehicle data received", { vehicleData });

    // Transform DVLA response to our format
    const transformedData = {
      found: true,
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      fuelType: vehicleData.fuelType || '',
      transmission: vehicleData.transmission || '',
      yearOfManufacture: vehicleData.yearOfManufacture || '',
      engineCapacity: vehicleData.engineCapacity || '',
      co2Emissions: vehicleData.co2Emissions || '',
      colour: vehicleData.colour || '',
      typeApproval: vehicleData.typeApproval || '',
      wheelplan: vehicleData.wheelplan || '',
      revenueWeight: vehicleData.revenueWeight || ''
    };

    logStep("Transformed vehicle data", { transformedData });

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in DVLA lookup", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      found: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
