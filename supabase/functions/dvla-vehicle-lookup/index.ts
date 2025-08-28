
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

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
          signal: AbortSignal.timeout(8000) // 8 second timeout
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

    // Determine vehicle type based on DVLA data
    let vehicleType = 'car'; // Default to car
    const fuelType = data.fuelType?.toLowerCase() || '';
    const typeApproval = data.typeApproval?.toLowerCase() || '';
    const wheelplan = data.wheelplan?.toLowerCase() || '';
    const engineCapacity = data.engineCapacity || 0;
    const revenueWeight = data.revenueWeight || 0;
    
    console.log(`Vehicle classification data - Type Approval: ${typeApproval}, Wheelplan: ${wheelplan}, Fuel: ${fuelType}, Engine: ${engineCapacity}, Weight: ${revenueWeight}`);
    
    // First check for electric/hybrid vehicles (these can be cars, vans, or motorbikes)
    const isElectric = fuelType.includes('electricity') || fuelType === 'electric';
    const isHybrid = fuelType.includes('hybrid') || fuelType.includes('petrol/electric') || fuelType.includes('plug-in hybrid');
    
    // Motorcycle detection - L category type approval is the most reliable indicator
    if (typeApproval.startsWith('l') || 
        typeApproval.includes('motorcycle') ||
        wheelplan.includes('2 wheels') ||
        wheelplan.includes('motorcycle') ||
        // Additional motorcycle indicators
        (engineCapacity > 0 && engineCapacity <= 1500 && 
         ['suzuki', 'honda', 'yamaha', 'kawasaki', 'ducati', 'bmw', 'ktm', 'triumph', 'harley-davidson', 'aprilia', 'husqvarna', 'mv agusta', 'piaggio'].includes(data.make?.toLowerCase()))) {
      
      if (isElectric) {
        vehicleType = 'EV'; // Electric motorcycle
      } else if (isHybrid) {
        vehicleType = 'PHEV'; // Hybrid motorcycle (rare but possible)
      } else {
        vehicleType = 'MOTORBIKE';
      }
    }
    // Van detection - N1 category (light commercial vehicles) and weight indicators
    else if (typeApproval.startsWith('n1') || 
             typeApproval.includes('commercial') ||
             wheelplan.includes('van') ||
             wheelplan.includes('commercial') ||
             // Weight-based detection for vans (typically heavier than cars)
             (revenueWeight > 2000 && revenueWeight <= 3500) ||
             // Make/model based detection for common van manufacturers
             (['ford', 'mercedes', 'volkswagen', 'renault', 'peugeot', 'citroen', 'fiat', 'iveco', 'nissan'].includes(data.make?.toLowerCase()) &&
              ['transit', 'sprinter', 'crafter', 'master', 'boxer', 'ducato', 'daily', 'nv200', 'nv300', 'nv400'].some(model => 
                (data.model?.toLowerCase() || '').includes(model)))) {
      
      if (isElectric) {
        vehicleType = 'EV'; // Electric van
      } else if (isHybrid) {
        vehicleType = 'PHEV'; // Hybrid van
      } else {
        vehicleType = 'van';
      }
    }
    // Car detection - M1 category (passenger cars) or default case
    else {
      if (isElectric) {
        vehicleType = 'EV';
      } else if (isHybrid) {
        vehicleType = 'PHEV';
      } else {
        vehicleType = 'car';
      }
    }
    
    console.log(`Determined vehicle type: ${vehicleType}`);

    // Check vehicle age (must be 15 years or newer)
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - data.yearOfManufacture;
    
    if (vehicleAge > 15) {
      console.log(`Vehicle ${registrationNumber} is ${vehicleAge} years old - too old for warranty`);
      return new Response(JSON.stringify({
        found: false,
        error: "We cannot offer warranties for vehicles over 15 years of age"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch MOT history to get missing model data and verify MOT status
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let motHistoryData = null;
    let motVerified = 'unknown';
    let finalModel = data.model;

    try {
      // Try to get MOT history synchronously for model data and MOT verification
      const motResponse = await supabase.functions.invoke('fetch-mot-history', {
        body: { 
          registration: registrationNumber.replace(/\s/g, '').toUpperCase(),
          customer_id: null
        }
      });

      if (motResponse.data?.success && motResponse.data?.data) {
        motHistoryData = motResponse.data.data;
        console.log('MOT history fetched successfully:', motHistoryData);
        
        // Use model from MOT data if DVLA doesn't provide it
        if (!finalModel && motHistoryData.model) {
          finalModel = motHistoryData.model;
          console.log(`Using model from MOT API: ${finalModel}`);
        }
        
        // Check MOT validity
        if (motHistoryData.mot_tests && Array.isArray(motHistoryData.mot_tests) && motHistoryData.mot_tests.length > 0) {
          // Get the latest MOT test
          const latestTest = motHistoryData.mot_tests
            .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())[0];
          
          if (latestTest) {
            const testResult = latestTest.testResult?.toLowerCase();
            const hasCurrentMOT = latestTest.expiryDate && new Date(latestTest.expiryDate) > new Date();
            
            // Check if MOT is valid (passed and not expired)
            if (testResult === 'passed' && hasCurrentMOT) {
              motVerified = 'verified';
            } else if (testResult === 'failed' || !hasCurrentMOT) {
              motVerified = 'invalid';
            } else {
              motVerified = 'unknown';
            }
            
            console.log(`MOT status determined: ${motVerified} (test result: ${testResult}, has current MOT: ${hasCurrentMOT})`);
          }
        } else {
          // No MOT tests found - could be new vehicle or data issue
          const currentYear = new Date().getFullYear();
          const vehicleAge = currentYear - data.yearOfManufacture;
          
          if (vehicleAge < 3) {
            // New vehicles don't need MOT for first 3 years
            motVerified = 'verified';
            console.log('New vehicle - MOT not required yet');
          } else {
            motVerified = 'invalid';
            console.log('No MOT tests found for vehicle over 3 years old');
          }
        }
      } else {
        console.log('MOT history fetch failed or no data returned');
        // Default to unknown if we can't get MOT data
        motVerified = 'unknown';
      }
    } catch (error) {
      console.error('Error fetching MOT history:', error);
      motVerified = 'unknown';
    }

    return new Response(JSON.stringify({
      found: true,
      make: data.make,
      model: finalModel || null,
      fuelType: data.fuelType,
      transmission: data.transmission || null,
      yearOfManufacture: data.yearOfManufacture,
      colour: data.colour,
      engineCapacity: data.engineCapacity,
      vehicleType: vehicleType,
      motStatus: data.motStatus,
      motExpiryDate: data.motExpiryDate,
      taxStatus: data.taxStatus,
      motVerified: motVerified
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
