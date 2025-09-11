
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

// Vehicle eligibility checking functions
function isVehicleBlocked(make?: string, model?: string): { blocked: boolean; reason?: string } {
  if (!make) return { blocked: false };

  const normalizeVehicleIdentifier = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/mercedes-benz/g, 'mercedes')
      .replace(/mercedes amg/g, 'mercedes-amg');
  };

  const BLOCKED_BRANDS = [
    'aston martin', 'bentley', 'ferrari', 'lamborghini', 'lotus', 'maserati', 
    'maybach', 'mclaren', 'morgan', 'rolls-royce', 'rolls royce', 'tvr'
  ];

  const BLOCKED_MODELS_BY_MAKE = {
    'audi': ['rs2 avant', 'rs2', 'rs3', 'rs4 avant', 'rs4', 'rs5', 'rs6 avant', 'rs6', 'rs7 sportback', 'rs7', 'rs q3', 'rsq3', 'rs q5', 'rsq5', 'rs q8', 'rsq8', 'rs e-tron gt', 'rs etron gt', 'tt rs', 'ttrs', 'r8 v8', 'r8v8', 'r8 v10', 'r8v10', 'r8 v10 plus', 'r8 spyder', 'r8 gt', 'r8 lms', 's2 coupé', 's2 coupe', 's2', 's2 avant', 's2 sedan', 's3', 's4', 's5', 's6', 's7', 's8', 'sq5', 'sq7', 'sq8', 'tts', 's e-tron gt', 's etron gt'],
    'bmw': ['m1', '1m coupé', '1m coupe', '1m', 'm2', 'm2 competition', 'm2 cs', 'm3', 'm4', 'm4 competition', 'm4 csl', 'm4 gts', 'm5', 'm6', 'm8', 'm roadster', 'm coupe', 'm3 csl', 'm3 crt', 'm3 gts', 'm4 kith edition', 'm5 cs', '3.0 csl', 'x3 m', 'x4 m', 'x5 m', 'x6 m', 'xm'],
    'mercedes': ['c 36 amg', 'c36 amg', 'c 43 amg', 'c43 amg', 'c 55 amg', 'c55 amg', 'c 63 amg', 'c63 amg', 'e 36 amg', 'e36 amg', 'e 50 amg', 'e50 amg', 'e 55 amg', 'e55 amg', 'e 63 amg', 'e63 amg', 's 55 amg', 's55 amg', 's 63 amg', 's63 amg', 's 65 amg', 's65 amg', 's 70 amg', 's70 amg', 'cl 55 amg', 'cl55 amg', 'cl 63 amg', 'cl63 amg', 'cl 65 amg', 'cl65 amg', 'sl 55 amg', 'sl55 amg', 'sl 60 amg', 'sl60 amg', 'sl 63 amg', 'sl63 amg', 'sl 65 amg', 'sl65 amg', 'sl 73 amg', 'sl73 amg', 'clk 55 amg', 'clk55 amg', 'clk 63 amg', 'clk63 amg', 'clk dtm amg', 'cls 55 amg', 'cls55 amg', 'cls 63 amg', 'cls63 amg', 'amg gt', 'amg sl', 'amg one', 'ml 55 amg', 'ml55 amg', 'ml 63 amg', 'ml63 amg', 'g 36 amg', 'g36 amg', 'g 55 amg', 'g55 amg', 'g 63 amg', 'g63 amg', 'g 65 amg', 'g65 amg', 'gl 63 amg', 'gl63 amg', 'gle 63 amg', 'gle63 amg', 'gls 63 amg', 'gls63 amg', 'r 63 amg', 'r63 amg'],
    'mercedes-amg': ['c36', 'c43', 'c55', 'c63', 'e36', 'e50', 'e55', 'e63', 's55', 's63', 's65', 's70', 'cl55', 'cl63', 'cl65', 'sl55', 'sl60', 'sl63', 'sl65', 'sl73', 'clk55', 'clk63', 'clk dtm', 'cls55', 'cls63', 'gt', 'sl', 'one', 'ml55', 'ml63', 'g36', 'g55', 'g63', 'g65', 'gl63', 'gle63', 'gls63', 'r63']
  };

  const normalizedMake = normalizeVehicleIdentifier(make);
  const normalizedModel = normalizeVehicleIdentifier(model || '');

  // Check if entire brand is blocked
  if (BLOCKED_BRANDS.includes(normalizedMake)) {
    return { 
      blocked: true, 
      reason: `We cannot provide warranty coverage for ${make} vehicles. This brand is excluded from our coverage due to specialized parts and servicing requirements.`
    };
  }

  // Check if specific model is blocked for this make
  const blockedModelsForMake = BLOCKED_MODELS_BY_MAKE[normalizedMake as keyof typeof BLOCKED_MODELS_BY_MAKE];
  
  if (blockedModelsForMake && normalizedModel) {
    const isModelBlocked = blockedModelsForMake.some(blockedModel => {
      const normalizedBlockedModel = normalizeVehicleIdentifier(blockedModel);
      return normalizedModel === normalizedBlockedModel || 
             normalizedModel.includes(normalizedBlockedModel) || 
             normalizedBlockedModel.includes(normalizedModel);
    });

    if (isModelBlocked) {
      return { 
        blocked: true, 
        reason: `We cannot provide warranty coverage for the ${make} ${model}. High-performance and specialty vehicles are excluded from our coverage due to specialized parts and servicing requirements.`
      };
    }
  }

  return { blocked: false };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MOTTest {
  completedDate: string;
  testResult: string;
  expiryDate?: string;
  odometerValue?: number;
  odometerUnit?: string;
  motTestNumber?: string;
  defects?: Array<{
    text: string;
    type: string;
    dangerous?: boolean;
  }>;
}

interface DVSAVehicleResponse {
  make?: string;
  model?: string;
  primaryColour?: string;
  fuelType?: string;
  motTests?: MOTTest[];
  dvlaId?: string;
  registrationDate?: string;
  manufactureDate?: string;
  engineCapacity?: number;
  co2Emissions?: number;
  euroStatus?: string;
  realDrivingEmissions?: string;
  markedForExport?: boolean;
  colour?: string;
  typeApproval?: string;
  wheelplan?: string;
  revenueWeight?: number;
  dateOfLastV5CIssued?: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('MOT_CLIENT_ID');
  const clientSecret = Deno.env.get('MOT_CLIENT_SECRET');
  const tokenUrl = Deno.env.get('MOT_TOKEN_URL');
  const scopeUrl = Deno.env.get('MOT_SCOPE_URL');

  if (!clientId || !clientSecret || !tokenUrl || !scopeUrl) {
    throw new Error('Missing MOT API configuration');
  }

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', scopeUrl);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    console.error('Token request failed:', await response.text());
    throw new Error('Failed to get access token');
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function fetchDVSAVehicleData(registration: string, accessToken: string): Promise<DVSAVehicleResponse> {
  const apiKey = Deno.env.get('MOT_API_KEY');
  
  if (!apiKey) {
    throw new Error('Missing MOT API key');
  }

  const response = await fetch(`https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${registration.toUpperCase()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Vehicle not found');
    }
    console.error('DVSA API request failed:', response.status, await response.text());
    throw new Error('Failed to fetch vehicle data');
  }

  return await response.json();
}

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

    // Get access token for DVSA API
    const accessToken = await getAccessToken();
    
    // Call DVSA API with retry logic
    let vehicleData;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`DVSA API attempt ${attempt} for ${registrationNumber}`);
        
        vehicleData = await fetchDVSAVehicleData(registrationNumber, accessToken);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        console.error(`DVSA API attempt ${attempt} failed:`, error.message);
        
        if (error.message === 'Vehicle not found') {
          return new Response(JSON.stringify({
            found: false,
            error: "Vehicle not found in DVSA database"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt - 1) * 1000;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!vehicleData) {
      throw new Error(`DVSA API failed after ${maxRetries} attempts: ${lastError?.message}`);
    }

    console.log('DVSA API response:', vehicleData);

    // Extract vehicle information from DVSA response
    const make = vehicleData.make;
    const model = vehicleData.model;
    
    // Check if vehicle is blocked from warranty coverage
    if (make) {
      const blocked = isVehicleBlocked(make, model);
      if (blocked.blocked) {
        console.log(`Vehicle ${make} ${model || ''} is blocked from warranty coverage`);
        return new Response(JSON.stringify({
          found: false,
          error: blocked.reason || `We cannot provide warranty coverage for ${make} ${model || ''} vehicles`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    const fuelType = vehicleData.fuelType;
    const colour = vehicleData.primaryColour || vehicleData.colour;
    
    // Calculate year of manufacture from registration or manufacture date
    let yearOfManufacture;
    if (vehicleData.manufactureDate) {
      yearOfManufacture = new Date(vehicleData.manufactureDate).getFullYear();
    } else if (vehicleData.registrationDate) {
      yearOfManufacture = new Date(vehicleData.registrationDate).getFullYear();
    }

    // Determine vehicle type based on DVSA data
    let vehicleType = 'car'; // Default to car
    const fuelTypeLower = fuelType?.toLowerCase() || '';
    const typeApproval = vehicleData.typeApproval?.toLowerCase() || '';
    const wheelplan = vehicleData.wheelplan?.toLowerCase() || '';
    const engineCapacity = vehicleData.engineCapacity || 0;
    const revenueWeight = vehicleData.revenueWeight || 0;
    
    console.log(`Vehicle classification data - Type Approval: ${typeApproval}, Wheelplan: ${wheelplan}, Fuel: ${fuelTypeLower}, Engine: ${engineCapacity}, Weight: ${revenueWeight}`);
    
    // First check for electric/hybrid vehicles (these can be cars, vans, or motorbikes)
    const isElectric = fuelTypeLower.includes('electricity') || fuelTypeLower === 'electric';
    const isHybrid = fuelTypeLower.includes('hybrid') || fuelTypeLower.includes('petrol/electric') || fuelTypeLower.includes('plug-in hybrid');
    
    // Motorcycle detection - L category type approval is the most reliable indicator
    if (typeApproval.startsWith('l') || 
        typeApproval.includes('motorcycle') ||
        wheelplan.includes('2 wheels') ||
        wheelplan.includes('motorcycle') ||
        // Additional motorcycle indicators
        (engineCapacity > 0 && engineCapacity <= 1500 && 
         ['suzuki', 'honda', 'yamaha', 'kawasaki', 'ducati', 'bmw', 'ktm', 'triumph', 'harley-davidson', 'aprilia', 'husqvarna', 'mv agusta', 'piaggio'].includes(make?.toLowerCase()))) {
      
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
             (['ford', 'mercedes', 'volkswagen', 'renault', 'peugeot', 'citroen', 'fiat', 'iveco', 'nissan'].includes(make?.toLowerCase()) &&
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
    const vehicleAge = yearOfManufacture ? currentYear - yearOfManufacture : 0;
    
    if (yearOfManufacture && vehicleAge > 15) {
      console.log(`Vehicle ${registrationNumber} is ${vehicleAge} years old - too old for warranty`);
      return new Response(JSON.stringify({
        found: false,
        error: "We cannot offer warranties for vehicles over 15 years of age"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Process MOT test data from DVSA response
    let motVerified = 'unknown';
    let motStatus = 'Unknown';
    let motExpiryDate = null;
    let taxStatus = 'Unknown'; // DVSA doesn't provide tax status, keep as unknown

    if (vehicleData.motTests && Array.isArray(vehicleData.motTests) && vehicleData.motTests.length > 0) {
      // Get the latest MOT test
      const latestTest = vehicleData.motTests
        .sort((a: MOTTest, b: MOTTest) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())[0];
      
      if (latestTest) {
        const testResult = latestTest.testResult?.toLowerCase();
        const hasCurrentMOT = latestTest.expiryDate && new Date(latestTest.expiryDate) > new Date();
        
        motExpiryDate = latestTest.expiryDate;
        motStatus = testResult === 'passed' ? 'Valid' : testResult === 'failed' ? 'Invalid' : 'Unknown';
        
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
      // No MOT tests found - could be new vehicle
      if (yearOfManufacture) {
        const currentYear = new Date().getFullYear();
        const vehicleAge = currentYear - yearOfManufacture;
        
        if (vehicleAge < 3) {
          // New vehicles don't need MOT for first 3 years
          motVerified = 'verified';
          motStatus = 'Not Required';
          console.log('New vehicle - MOT not required yet');
        } else {
          motVerified = 'invalid';
          motStatus = 'No Tests Found';
          console.log('No MOT tests found for vehicle over 3 years old');
        }
      }
    }

    // Store MOT history data in database for future reference
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      // Calculate MOT expiry date from latest test
      let motExpiryDateForStorage = null;
      if (vehicleData.motTests && vehicleData.motTests.length > 0) {
        const latestTest = vehicleData.motTests
          .filter(test => test.expiryDate)
          .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())[0];
        
        if (latestTest && latestTest.expiryDate) {
          motExpiryDateForStorage = latestTest.expiryDate;
        }
      }

      // Store in database
      const motHistoryData = {
        registration: registrationNumber.toUpperCase(),
        customer_id: null,
        make: vehicleData.make,
        model: vehicleData.model,
        primary_colour: vehicleData.primaryColour,
        fuel_type: vehicleData.fuelType,
        mot_tests: vehicleData.motTests || [],
        dvla_id: vehicleData.dvlaId,
        registration_date: vehicleData.registrationDate ? new Date(vehicleData.registrationDate).toISOString().split('T')[0] : null,
        manufacture_date: vehicleData.manufactureDate ? new Date(vehicleData.manufactureDate).toISOString().split('T')[0] : null,
        engine_capacity: vehicleData.engineCapacity,
        co2_emissions: vehicleData.co2Emissions,
        euro_status: vehicleData.euroStatus,
        real_driving_emissions: vehicleData.realDrivingEmissions,
        marked_for_export: vehicleData.markedForExport || false,
        colour: vehicleData.colour,
        type_approval: vehicleData.typeApproval,
        wheelplan: vehicleData.wheelplan,
        revenue_weight: vehicleData.revenueWeight,
        date_of_last_v5c_issued: vehicleData.dateOfLastV5CIssued ? new Date(vehicleData.dateOfLastV5CIssued).toISOString().split('T')[0] : null,
        mot_expiry_date: motExpiryDateForStorage ? new Date(motExpiryDateForStorage).toISOString().split('T')[0] : null,
      };

      console.log('Attempting to store MOT history for:', registrationNumber.toUpperCase());
      console.log('MOT history data to store:', {
        registration: motHistoryData.registration,
        make: motHistoryData.make,
        model: motHistoryData.model,
        testCount: motHistoryData.mot_tests?.length || 0,
        sampleTest: motHistoryData.mot_tests?.[0]
      });

      const { data, error } = await supabase
        .from('mot_history')
        .upsert(motHistoryData, { onConflict: 'registration' })
        .select()
        .single();

      if (error) {
        console.error('Database error storing MOT history:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.error('No data returned from upsert operation');
        throw new Error('Failed to store MOT history - no data returned');
      }

      console.log('MOT history stored successfully:', {
        id: data.id,
        registration: data.registration,
        testCount: data.mot_tests?.length || 0
      });
    } catch (error) {
      console.error('Error storing MOT history:', error);
      // Continue with response even if storage fails
    }

    return new Response(JSON.stringify({
      found: true,
      make: make,
      model: model || null,
      fuelType: fuelType,
      transmission: null, // DVSA doesn't provide transmission data
      yearOfManufacture: yearOfManufacture,
      colour: colour,
      engineCapacity: vehicleData.engineCapacity,
      vehicleType: vehicleType,
      motStatus: motStatus,
      motExpiryDate: motExpiryDate,
      taxStatus: taxStatus,
      motVerified: motVerified
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in DVSA lookup:', error);
    return new Response(JSON.stringify({
      found: false,
      error: error.message || "Failed to lookup vehicle"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
