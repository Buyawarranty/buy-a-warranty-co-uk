
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationNumber } = await req.json();
    
    if (!registrationNumber) {
      throw new Error("Registration number is required");
    }

    const dvlaApiKey = Deno.env.get("DVLA_API_KEY");
    if (!dvlaApiKey) {
      throw new Error("DVLA API key not configured");
    }

    console.log(`Looking up vehicle: ${registrationNumber}`);

    // Call DVLA API
    const response = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
      method: 'POST',
      headers: {
        'x-api-key': dvlaApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationNumber: registrationNumber.replace(/\s/g, '').toUpperCase()
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({
          found: false,
          error: "Vehicle not found in DVLA database"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error(`DVLA API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DVLA API response:', data);

    // Determine vehicle type based on fuel type
    let vehicleType = 'standard';
    const fuelType = data.fuelType?.toLowerCase() || '';
    
    if (fuelType.includes('electricity') || fuelType === 'electric') {
      vehicleType = 'EV';
    } else if (fuelType.includes('hybrid') || fuelType.includes('petrol/electric')) {
      vehicleType = 'PHEV';
    } else if (data.vehicleClass?.toLowerCase().includes('motorcycle') || 
               data.typeApproval?.toLowerCase().includes('motorcycle') ||
               data.wheelplan?.toLowerCase().includes('2 wheels')) {
      vehicleType = 'MOTORBIKE';
    }

    return new Response(JSON.stringify({
      found: true,
      make: data.make,
      model: data.model || null, // Model might not be available from DVLA
      fuelType: data.fuelType,
      transmission: data.transmission || null, // Transmission might not be available
      yearOfManufacture: data.yearOfManufacture,
      colour: data.colour,
      engineCapacity: data.engineCapacity,
      vehicleType: vehicleType,
      motStatus: data.motStatus,
      motExpiryDate: data.motExpiryDate,
      taxStatus: data.taxStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in DVLA lookup:', error);
    return new Response(JSON.stringify({
      found: false,
      error: error.message || "Failed to lookup vehicle"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
