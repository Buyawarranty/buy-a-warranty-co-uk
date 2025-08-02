
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

    // Call DVLA API with retry logic
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DVLA API attempt ${attempt} for ${registrationNumber}`);
        
        response = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
          method: 'POST',
          headers: {
            'x-api-key': dvlaApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registrationNumber: registrationNumber.replace(/\s/g, '').toUpperCase()
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.error(`DVLA API attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt - 1) * 1000;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!response) {
      throw new Error(`DVLA API failed after ${maxRetries} attempts: ${lastError?.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DVLA API error: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return new Response(JSON.stringify({
          found: false,
          error: "Vehicle not found in DVLA database"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error(`DVLA API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DVLA API response:', data);

    // Determine vehicle type based on fuel type and engine capacity
    let vehicleType = 'standard';
    const fuelType = data.fuelType?.toLowerCase() || '';
    const engineCapacity = data.engineCapacity || 0;
    
    if (fuelType.includes('electricity') || fuelType === 'electric') {
      vehicleType = 'EV';
    } else if (fuelType.includes('hybrid') || fuelType.includes('petrol/electric')) {
      vehicleType = 'PHEV';
    } else if (data.vehicleClass?.toLowerCase().includes('motorcycle') || 
               data.typeApproval?.toLowerCase().includes('motorcycle') ||
               data.wheelplan?.toLowerCase().includes('2 wheels') ||
               // Detect motorcycles based on engine capacity (typically under 1500cc for bikes)
               (engineCapacity > 0 && engineCapacity <= 1500 && 
                (data.make?.toLowerCase() === 'suzuki' || 
                 data.make?.toLowerCase() === 'honda' ||
                 data.make?.toLowerCase() === 'yamaha' ||
                 data.make?.toLowerCase() === 'kawasaki' ||
                 data.make?.toLowerCase() === 'ducati' ||
                 data.make?.toLowerCase() === 'bmw' ||
                 data.make?.toLowerCase() === 'ktm' ||
                 data.make?.toLowerCase() === 'triumph' ||
                 data.make?.toLowerCase() === 'harley-davidson'))) {
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
