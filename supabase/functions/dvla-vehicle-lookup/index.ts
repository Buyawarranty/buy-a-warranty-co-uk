
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

    // First, fetch MOT history from DVSA API to get primary vehicle details
    const motResponse = await supabase.functions.invoke('fetch-mot-history', {
      body: { 
        registration: registrationNumber.replace(/\s/g, '').toUpperCase(),
        customer_id: null
      }
    });

    if (!motResponse.data?.success) {
      console.error('DVSA MOT API failed:', motResponse.data?.error);
      return new Response(JSON.stringify({
        found: false,
        error: "Vehicle not found in DVSA MOT database"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const motData = motResponse.data.data;
    console.log('DVSA MOT API response:', motData);

    // Use MOT data as primary source for vehicle details
    let vehicleData = {
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

    // Now supplement with DVLA data for tax status and other details
    const dvlaApiKey = Deno.env.get("DVLA_API_KEY");
    if (dvlaApiKey) {
      try {
        console.log(`Fetching additional data from DVLA for ${registrationNumber}`);
        
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
          console.log('DVLA API supplementary response:', dvlaData);
          
          // Supplement vehicle data with DVLA info where MOT data is missing
          vehicleData = {
            ...vehicleData,
            motStatus: dvlaData.motStatus,
            taxStatus: dvlaData.taxStatus,
            transmission: dvlaData.transmission || vehicleData.transmission,
            // Use DVLA data as fallback if MOT data is missing
            make: vehicleData.make || dvlaData.make,
            model: vehicleData.model || dvlaData.model,
            fuelType: vehicleData.fuelType || dvlaData.fuelType,
            yearOfManufacture: vehicleData.yearOfManufacture || dvlaData.yearOfManufacture,
            colour: vehicleData.colour || dvlaData.colour,
            engineCapacity: vehicleData.engineCapacity || dvlaData.engineCapacity
          };
        } else {
          console.log('DVLA API failed, continuing with MOT data only');
        }
      } catch (error) {
        console.log('DVLA API error, continuing with MOT data only:', error.message);
      }
    }

    // Determine vehicle type based on combined vehicle data
    let vehicleType = 'car'; // Default to car
    const fuelType = vehicleData.fuelType?.toLowerCase() || '';
    const typeApproval = motData.type_approval?.toLowerCase() || '';
    const wheelplan = motData.wheelplan?.toLowerCase() || '';
    const engineCapacity = vehicleData.engineCapacity || 0;
    const revenueWeight = motData.revenue_weight || 0;
    
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

    // Check vehicle age (must be 15 years or newer)
    const currentYear = new Date().getFullYear();
    const vehicleAge = vehicleData.yearOfManufacture ? currentYear - vehicleData.yearOfManufacture : 0;
    
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
