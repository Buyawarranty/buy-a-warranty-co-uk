import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

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
  defects?: Array<{
    text: string;
    type: string;
    dangerous?: boolean;
  }>;
}

interface ReliabilityResult {
  reliability_score: number;
  tier: number;
  tier_label: string;
  pricing: {
    "12M": number;
    "24M": number;
    "36M": number;
  };
  calculation_details: {
    failure_rate: number;
    critical_failures: number;
    mileage_factor: number;
    total_tests: number;
    failed_tests: number;
    vehicle_age_years: number;
  };
}

// Critical failure categories that carry higher weight
const CRITICAL_DEFECT_KEYWORDS = [
  'brake', 'brakes', 'braking',
  'steering', 'wheel', 'tyre', 'tire',
  'suspension', 'shock',
  'exhaust', 'emission',
  'light', 'lighting', 'headlight', 'indicator',
  'seatbelt', 'seat belt',
  'windscreen', 'windshield',
  'fuel', 'petrol', 'diesel',
  'engine', 'transmission'
];

// Tier definitions
const TIERS = [
  { tier: 1, label: "Exceptional Reliability", min: 95, max: 100, pricing: { "12M": 359, "24M": 649, "36M": 869 } },
  { tier: 2, label: "Excellent Reliability", min: 90, max: 94, pricing: { "12M": 409, "24M": 739, "36M": 989 } },
  { tier: 3, label: "Very Good Reliability", min: 85, max: 89, pricing: { "12M": 459, "24M": 829, "36M": 1109 } },
  { tier: 4, label: "Good Reliability", min: 80, max: 84, pricing: { "12M": 509, "24M": 919, "36M": 1229 } },
  { tier: 5, label: "Moderate Reliability", min: 70, max: 79, pricing: { "12M": 559, "24M": 1009, "36M": 1349 } },
  { tier: 6, label: "Low Reliability", min: 60, max: 69, pricing: { "12M": 609, "24M": 1099, "36M": 1469 } },
  { tier: 7, label: "Poor Reliability", min: 0, max: 59, pricing: { "12M": 659, "24M": 1189, "36M": 1589 } }
];

function calculateVehicleAge(registrationDate: string): number {
  const regDate = new Date(registrationDate);
  const today = new Date();
  const ageInYears = (today.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(ageInYears, 1); // Minimum 1 year to avoid division issues
}

function isCriticalDefect(defectText: string, defectType: string, isDangerous: boolean): boolean {
  if (isDangerous) return true;
  if (defectType?.toLowerCase() === 'major') return true;
  
  const text = defectText.toLowerCase();
  return CRITICAL_DEFECT_KEYWORDS.some(keyword => text.includes(keyword));
}

function calculateMileageFactor(motTests: MOTTest[], vehicleAgeYears: number): number {
  // Get the most recent test with mileage data
  const testsWithMileage = motTests
    .filter(test => test.odometerValue && test.odometerUnit)
    .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
  
  if (testsWithMileage.length === 0) {
    // Fallback to UK average: 7,400 miles per year
    return 7400 / vehicleAgeYears;
  }
  
  const latestTest = testsWithMileage[0];
  let mileage = latestTest.odometerValue!;
  
  // Convert to miles if in km
  if (latestTest.odometerUnit?.toLowerCase() === 'km') {
    mileage = mileage * 0.621371; // Convert km to miles
  }
  
  return mileage / vehicleAgeYears;
}

function calculateReliabilityScore(motTests: MOTTest[], vehicleAgeYears: number): ReliabilityResult {
  const totalTests = motTests.length;
  
  if (totalTests === 0) {
    // No MOT history - assume average reliability
    const score = 75;
    const tier = TIERS.find(t => score >= t.min && score <= t.max)!;
    return {
      reliability_score: score,
      tier: tier.tier,
      tier_label: tier.label,
      pricing: tier.pricing,
      calculation_details: {
        failure_rate: 0,
        critical_failures: 0,
        mileage_factor: 7400,
        total_tests: 0,
        failed_tests: 0,
        vehicle_age_years: vehicleAgeYears
      }
    };
  }

  // Calculate failure rate
  const failedTests = motTests.filter(test => test.testResult.toLowerCase() === 'fail').length;
  const failureRate = (failedTests / totalTests) * 100;

  // Calculate critical failures
  let criticalFailures = 0;
  motTests.forEach(test => {
    if (test.defects) {
      test.defects.forEach(defect => {
        if (isCriticalDefect(defect.text, defect.type, defect.dangerous || false)) {
          criticalFailures++;
        }
      });
    }
  });

  // Calculate mileage factor
  const mileageFactor = calculateMileageFactor(motTests, vehicleAgeYears);

  // Apply the reliability formula
  let reliabilityScore = 100 - (
    failureRate * 0.4 +
    criticalFailures * 5 +
    (mileageFactor / 1000) * 2
  );

  // Cap the score between 0 and 100
  reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));

  // Determine tier
  const tier = TIERS.find(t => reliabilityScore >= t.min && reliabilityScore <= t.max) || TIERS[TIERS.length - 1];

  return {
    reliability_score: Math.round(reliabilityScore),
    tier: tier.tier,
    tier_label: tier.label,
    pricing: tier.pricing,
    calculation_details: {
      failure_rate: Math.round(failureRate * 100) / 100,
      critical_failures: criticalFailures,
      mileage_factor: Math.round(mileageFactor),
      total_tests: totalTests,
      failed_tests: failedTests,
      vehicle_age_years: Math.round(vehicleAgeYears * 100) / 100
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { registration } = await req.json();
    
    if (!registration) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Registration number is required' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`Calculating reliability score for registration: ${registration}`);

    // Fetch MOT history from database
    let { data: motHistory, error } = await supabase
      .from('mot_history')
      .select('*')
      .eq('registration', registration.toUpperCase())
      .single();

    // If no MOT history exists, try to fetch it automatically
    if (error && error.code === 'PGRST116') {
      console.log(`No MOT history found for ${registration}, attempting to fetch...`);
      
      try {
        // Call the fetch-mot-history function
        const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-mot-history', {
          body: { registration: registration }
        });
        
        if (fetchError) {
          console.error('Error fetching MOT history:', fetchError);
          // Fall back to default reliability score
          const defaultScore = 75; // Average reliability
          const defaultTier = TIERS.find(t => defaultScore >= t.min && defaultScore <= t.max)!;
          
          return new Response(JSON.stringify({ 
            success: true, 
            data: {
              reliability_score: defaultScore,
              tier: defaultTier.tier,
              tier_label: defaultTier.label,
              pricing: defaultTier.pricing,
              calculation_details: {
                failure_rate: 0,
                critical_failures: 0,
                mileage_factor: 7400,
                total_tests: 0,
                failed_tests: 0,
                vehicle_age_years: 10 // Default estimate
              }
            },
            vehicle_info: {
              registration: registration.toUpperCase(),
              make: 'Unknown',
              model: 'Unknown',
              age_years: 10
            },
            note: 'Default reliability score used - MOT data not available'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        
        // Try to fetch the newly created MOT history
        const { data: newMotHistory, error: newError } = await supabase
          .from('mot_history')
          .select('*')
          .eq('registration', registration.toUpperCase())
          .single();
          
        if (newError || !newMotHistory) {
          throw new Error('Failed to fetch MOT history after auto-fetch attempt');
        }
        
        motHistory = newMotHistory;
        
      } catch (autoFetchError) {
        console.error('Auto-fetch failed:', autoFetchError);
        // Return default reliability score when auto-fetch fails
        const defaultScore = 75;
        const defaultTier = TIERS.find(t => defaultScore >= t.min && defaultScore <= t.max)!;
        
        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            reliability_score: defaultScore,
            tier: defaultTier.tier,
            tier_label: defaultTier.label,
            pricing: defaultTier.pricing,
            calculation_details: {
              failure_rate: 0,
              critical_failures: 0,
              mileage_factor: 7400,
              total_tests: 0,
              failed_tests: 0,
              vehicle_age_years: 10
            }
          },
          vehicle_info: {
            registration: registration.toUpperCase(),
            make: 'Unknown',
            model: 'Unknown',
            age_years: 10
          },
          note: 'Default reliability score used - MOT data unavailable'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } else if (error) {
      throw error;
    }

    if (!motHistory.registration_date) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Vehicle registration date not found. Cannot calculate age.' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Calculate vehicle age
    const vehicleAgeYears = calculateVehicleAge(motHistory.registration_date);
    
    // Parse MOT tests from JSON
    const motTests: MOTTest[] = Array.isArray(motHistory.mot_tests) ? motHistory.mot_tests : [];
    
    // Calculate reliability score
    const result = calculateReliabilityScore(motTests, vehicleAgeYears);

    console.log(`Reliability calculation complete for ${registration}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      vehicle_info: {
        registration: motHistory.registration,
        make: motHistory.make,
        model: motHistory.model,
        age_years: result.calculation_details.vehicle_age_years
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error calculating vehicle reliability:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});