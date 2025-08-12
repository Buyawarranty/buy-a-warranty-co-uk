
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

    // Check if vehicle is eligible for warranty coverage
    const make = data.make?.toLowerCase() || '';
    const model = data.model?.toLowerCase() || '';
    
    console.log(`Checking eligibility for: ${make} ${model} (Engine: ${data.engineCapacity}cc, Year: ${data.yearOfManufacture})`);
    
    // Special handling for vehicles where DVLA doesn't return model but we can identify from engine specs
    let identifiedModel = model;
    if (!model && make === 'nissan' && data.engineCapacity === 3799) {
      identifiedModel = 'gt-r';
      console.log('Identified as Nissan GT-R based on engine capacity');
    }
    
    if (isVehicleExcluded(make, identifiedModel)) {
      console.log(`Vehicle excluded: ${data.make} ${identifiedModel}`);
      return new Response(JSON.stringify({
        found: true,
        eligible: false,
        error: "We're sorry - this vehicle isn't eligible for our warranty cover. Unfortunately, we're unable to provide warranty cover for certain high-performance, modified, or specialist vehicles, and your vehicle falls into this category. If you believe this is incorrect, please contact our Customer Service team on 0330 229 5040 or email info@buyawarranty.co.uk and we'll be happy to review your enquiry."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

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

    return new Response(JSON.stringify({
      found: true,
      eligible: true,
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

// Function to check if a vehicle is excluded from warranty coverage
function isVehicleExcluded(make: string, model: string): boolean {
  const excludedVehicles = [
    // Supercars & Hypercars
    { make: 'aston martin', models: ['db11 amr', 'vantage f1 edition', 'dbs superleggera', 'valkyrie'] },
    { make: 'audi', models: ['r8'] },
    { make: 'bugatti', models: ['veyron', 'chiron', 'divo', 'bolide'] },
    { make: 'ferrari', models: ['296 gtb', '812 superfast', 'f8 tributo', 'sf90 stradale', 'purosangue'] },
    { make: 'lamborghini', models: ['huracán', 'huracan', 'aventador', 'revuelto', 'sian'] },
    { make: 'mclaren', models: ['540c', '570s', '600lt', '650s', '675lt', '720s', '765lt', 'artura', 'p1', 'speedtail', 'elva'] },
    { make: 'porsche', models: ['911 gt3', '911 gt3 rs', '911 gt2 rs', '911 turbo', '911 turbo s', '911 carrera gts', '918 spyder', 'cayman gt4 rs'] },
    { make: 'lotus', models: ['emira first edition', 'evija hypercar'] },
    { make: 'maserati', models: ['mc20'] },
    
    // Performance Coupés & Grand Tourers
    { make: 'alfa romeo', models: ['giulia quadrifoglio', 'stelvio quadrifoglio'] },
    { make: 'aston martin', models: ['rapide s'] },
    { make: 'audi', models: ['rs5', 'rs7 sportback'] },
    { make: 'bentley', models: ['continental gt speed', 'flying spur speed'] },
    { make: 'bmw', models: ['m2 competition', 'm3 competition', 'm4 gts', 'm5 cs', 'm8 competition'] },
    { make: 'jaguar', models: ['f-type r', 'f-type svr', 'xe sv project 8', 'xkr-s'] },
    { make: 'lexus', models: ['lc500', 'rc f track edition'] },
    { make: 'mercedes-amg', models: ['c63 s', 'e63 s', 'gt r', 'gt black series', 'sl63 amg'] },
    { make: 'mercedes', models: ['c63 s', 'e63 s', 'gt r', 'gt black series', 'sl63 amg'] },
    { make: 'nissan', models: ['gt-r'] },
    { make: 'toyota', models: ['gr supra 3.0', 'gr yaris circuit pack'] },
    { make: 'tesla', models: ['model s plaid', 'model x plaid'] },
    
    // Hot Hatches & Smaller Performance Cars
    { make: 'abarth', models: ['695 biposto'] },
    { make: 'audi', models: ['s3', 'rs3'] },
    { make: 'ford', models: ['fiesta st', 'focus st', 'focus rs'] },
    { make: 'honda', models: ['civic type r fk2', 'civic type r fk8', 'civic type r fl5', 'civic type r'] },
    { make: 'hyundai', models: ['i20 n', 'i30 n'] },
    { make: 'mini', models: ['john cooper works gp'] },
    { make: 'peugeot', models: ['308 gti by peugeot sport'] },
    { make: 'renault', models: ['megane r.s. trophy-r', 'clio r.s. 220 trophy'] },
    { make: 'volkswagen', models: ['golf gti clubsport', 'golf r'] },
    
    // Performance SUVs
    { make: 'aston martin', models: ['dbx707'] },
    { make: 'audi', models: ['sq7', 'sq8', 'rs q3', 'rs q8'] },
    { make: 'bentley', models: ['bentayga speed'] },
    { make: 'bmw', models: ['x3 m competition', 'x5 m', 'x6 m'] },
    { make: 'jaguar', models: ['f-pace svr'] },
    { make: 'lamborghini', models: ['urus performante'] },
    { make: 'maserati', models: ['levante trofeo'] },
    { make: 'mercedes-amg', models: ['glc 63 s', 'gle 63 s', 'gls 63'] },
    { make: 'mercedes', models: ['glc 63 s', 'gle 63 s', 'gls 63'] },
    { make: 'porsche', models: ['macan gts', 'cayenne turbo', 'cayenne turbo gt', 'cayenne coupé turbo gt'] },
    { make: 'land rover', models: ['range rover sport svr', 'range rover svautobiography dynamic'] },
    
    // Limited-Edition or Track-Focused Cars
    { make: 'ariel', models: ['atom 4', 'nomad'] },
    { make: 'caterham', models: ['420r', 'seven 620r'] },
    { make: 'ktm', models: ['x-bow'] },
    { make: 'radical', models: ['sr3 xxr', 'sr10'] },
    { make: 'lotus', models: ['exige cup 430', 'elise cup 250'] },
    { make: 'bmw', models: ['m4 csl', 'm2 cs'] },
    { make: 'mercedes-amg', models: ['one hypercar'] },
    { make: 'mercedes', models: ['one hypercar'] },
    { make: 'porsche', models: ['cayman gt4 rs clubsport'] }
  ];

  // Normalize the input for comparison
  const normalizedMake = make.toLowerCase().trim();
  const normalizedModel = model.toLowerCase().trim();

  // Find the make in excluded vehicles
  for (const excludedVehicle of excludedVehicles) {
    if (excludedVehicle.make === normalizedMake) {
      // Check for exact model matches only
      return excludedVehicle.models.some(excludedModel => {
        const normalizedExcludedModel = excludedModel.toLowerCase().trim();
        
        // Exact match
        if (normalizedModel === normalizedExcludedModel) {
          return true;
        }
        
        // Special case for Honda Civic Type R variants - any Type R should be excluded
        if (excludedModel.includes('civic type r') && normalizedModel.includes('civic type r')) {
          return true;
        }
        
        // Special case for Porsche 911 variants - check if the model contains the specific variant
        if (excludedModel.startsWith('911 ') && normalizedModel.includes(excludedModel.replace('911 ', ''))) {
          return true;
        }
        
        return false;
      });
    }
  }
  
  return false;
}
