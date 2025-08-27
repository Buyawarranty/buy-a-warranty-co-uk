
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

    console.log(`Looking up vehicle: ${registrationNumber}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, try to fetch MOT history from DVSA API to get primary vehicle details
    let motData = null;
    let hasMOTData = false;
    
    try {
      console.log('Attempting to fetch MOT data for:', registrationNumber.replace(/\s/g, '').toUpperCase());
      
      const motResponse = await supabase.functions.invoke('fetch-mot-history', {
        body: { 
          registration: registrationNumber.replace(/\s/g, '').toUpperCase(),
          customer_id: null
        }
      });

      console.log('MOT Response structure:', {
        error: motResponse.error,
        data: motResponse.data,
        dataSuccess: motResponse.data?.success,
        dataError: motResponse.data?.error
      });

      if (motResponse.error) {
        console.log('MOT function invocation error:', motResponse.error);
      } else if (motResponse.data?.success && motResponse.data?.data) {
        motData = motResponse.data.data;
        hasMOTData = true;
        console.log('DVSA MOT API response received successfully');
      } else {
        console.log('DVSA MOT API failed or no data. Error:', motResponse.data?.error || 'No error message provided');
      }
    } catch (error) {
      console.log('DVSA MOT API error (catch block):', error.message || error);
    }
    // Initialize vehicle data structure
    let vehicleData = {
      make: null,
      model: null,
      fuelType: null,
      yearOfManufacture: null,
      colour: null,
      engineCapacity: null,
      motExpiryDate: null,
      motStatus: null,
      taxStatus: null,
      transmission: null
    };

    // Use MOT data as primary source if available
    if (hasMOTData && motData) {
      vehicleData = {
        make: motData.make,
        model: motData.model,
        fuelType: motData.fuel_type,
        yearOfManufacture: motData.manufacture_date ? new Date(motData.manufacture_date).getFullYear() : null,
        colour: motData.primary_colour || motData.colour,
        engineCapacity: motData.engine_capacity,
        motExpiryDate: motData.mot_expiry_date,
        motStatus: null, // Will get from DVLA
        taxStatus: null, // Will get from DVLA
        transmission: null // Will get from DVLA if available
      };
    }

    // Now try to get data from DVLA API (this should be the primary source if DVSA fails)
    const dvlaApiKey = Deno.env.get("DVLA_API_KEY");
    let hasDVLAData = false;
    
    if (dvlaApiKey) {
      try {
        console.log(`Fetching data from DVLA for ${registrationNumber}`);
        
        const dvlaResponse = await fetch(`https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles`, {
          method: 'POST',
          headers: {
            'x-api-key': dvlaApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registrationNumber: registrationNumber.replace(/\s/g, '').toUpperCase()
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (dvlaResponse.ok) {
          const dvlaData = await dvlaResponse.json();
          console.log('DVLA API response:', dvlaData);
          hasDVLAData = true;
          
          // Use DVLA data as primary or supplement existing MOT data
          vehicleData = {
            make: vehicleData.make || dvlaData.make,
            model: vehicleData.model || dvlaData.model,
            fuelType: vehicleData.fuelType || dvlaData.fuelType,
            yearOfManufacture: vehicleData.yearOfManufacture || dvlaData.yearOfManufacture,
            colour: vehicleData.colour || dvlaData.colour,
            engineCapacity: vehicleData.engineCapacity || dvlaData.engineCapacity,
            motExpiryDate: vehicleData.motExpiryDate,
            motStatus: dvlaData.motStatus,
            taxStatus: dvlaData.taxStatus,
            transmission: dvlaData.transmission || vehicleData.transmission
          };
          
          console.log('Vehicle data after DVLA:', {
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.yearOfManufacture
          });
        } else {
          console.log('DVLA API failed with status:', dvlaResponse.status);
        }
      } catch (error) {
        console.log('DVLA API error:', error.message);
      }
    } else {
      console.log('No DVLA API key configured');
    }

    // If model is still missing and we have MOT data, try to get it from DVSA
    if (!vehicleData.model && hasMOTData && motData && motData.model) {
      console.log('Using DVSA model as fallback:', motData.model);
      vehicleData.model = motData.model;
    }
    
    // If make is still missing and we have MOT data, try to get it from DVSA  
    if (!vehicleData.make && hasMOTData && motData && motData.make) {
      console.log('Using DVSA make as fallback:', motData.make);
      vehicleData.make = motData.make;
    }

    console.log('Final vehicle data:', {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.yearOfManufacture,
      hasMOTData,
      hasDVLAData
    });

    // Check if we have enough data to proceed
    if (!vehicleData.make) {
      console.log('No vehicle data found from either DVLA or DVSA');
      return new Response(JSON.stringify({
        found: false,
        error: "Vehicle not found in DVLA or DVSA databases"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If we don't have year data, try to extract from other sources or set a reasonable default
    if (!vehicleData.yearOfManufacture) {
      console.log('No year data available, vehicle lookup incomplete');
      // For now, we'll still allow the lookup to proceed without year validation
    }

    // Determine vehicle type based on combined vehicle data
    let vehicleType = 'car'; // Default to car
    const fuelType = vehicleData.fuelType?.toLowerCase() || '';
    const typeApproval = motData?.type_approval?.toLowerCase() || '';
    const wheelplan = motData?.wheelplan?.toLowerCase() || '';
    const engineCapacity = vehicleData.engineCapacity || 0;
    const revenueWeight = motData?.revenue_weight || 0;
    
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
         ['suzuki', 'honda', 'yamaha', 'kawasaki', 'ducati', 'bmw', 'ktm', 'triumph', 'harley-davidson', 'aprilia', 'husqvarna', 'mv agusta', 'piaggio'].includes(vehicleData.make?.toLowerCase()))) {
      
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
             (['ford', 'mercedes', 'volkswagen', 'renault', 'peugeot', 'citroen', 'fiat', 'iveco', 'nissan'].includes(vehicleData.make?.toLowerCase()) &&
              ['transit', 'sprinter', 'crafter', 'master', 'boxer', 'ducato', 'daily', 'nv200', 'nv300', 'nv400'].some(model => 
                (vehicleData.model?.toLowerCase() || '').includes(model)))) {
      
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

    // Check vehicle age (must be 15 years or newer) - only if we have year data
    if (vehicleData.yearOfManufacture) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicleData.yearOfManufacture;
      
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
    }

    return new Response(JSON.stringify({
      found: true,
      make: vehicleData.make,
      model: vehicleData.model || null,
      fuelType: vehicleData.fuelType,
      transmission: vehicleData.transmission || null,
      yearOfManufacture: vehicleData.yearOfManufacture,
      colour: vehicleData.colour,
      engineCapacity: vehicleData.engineCapacity,
      vehicleType: vehicleType,
      motStatus: vehicleData.motStatus,
      motExpiryDate: vehicleData.motExpiryDate,
      taxStatus: vehicleData.taxStatus
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
