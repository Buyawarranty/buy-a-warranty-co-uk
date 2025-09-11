// Vehicle validation and pricing adjustment utilities

export interface VehicleData {
  make?: string;
  model?: string;
  vehicleType?: string;
  regNumber: string;
}

export interface PriceAdjustment {
  isValid: boolean;
  errorMessage?: string;
  adjustmentAmount: number;
  adjustmentType: string;
  breakdown: {
    baseAdjustment: number;
    adjustmentReason: string;
  }[];
}

// Excluded vehicle makes
const EXCLUDED_MAKES = [
  'aston martin',
  'bentley', 
  'ferrari',
  'lamborghini',
  'lotus',
  'maserati',
  'maybach',
  'mclaren',
  'morgan',
  'rolls-royce',
  'rolls royce',
  'tvr'
];

// Specific model exclusions
const MODEL_EXCLUSIONS = {
  'audi': ['rs', 'r8', 's series'],
  'bmw': ['m series'],
  'mercedes': ['amg', 'mercedes-amg']
};

const EXCLUSION_ERROR_MESSAGE = "⚠️ Warranty Coverage Not Available\nSorry about this - this vehicle isn't eligible due to specialist parts and a limited repair network 🙏";

/**
 * Check if a vehicle is excluded from coverage
 */
export function validateVehicleEligibility(vehicleData: VehicleData): { isValid: boolean; errorMessage?: string } {
  const make = vehicleData.make?.toLowerCase().trim() || '';
  const model = vehicleData.model?.toLowerCase().trim() || '';
  
  // Check excluded makes
  if (EXCLUDED_MAKES.includes(make)) {
    return {
      isValid: false,
      errorMessage: EXCLUSION_ERROR_MESSAGE
    };
  }
  
  // Check specific model exclusions
  if (MODEL_EXCLUSIONS[make]) {
    const excludedModels = MODEL_EXCLUSIONS[make];
    const isExcluded = excludedModels.some(excludedModel => {
      if (excludedModel.includes('series')) {
        // Handle series exclusions (e.g., "M Series", "S Series")
        const seriesLetter = excludedModel.replace(' series', '').trim();
        return model.startsWith(seriesLetter.toLowerCase()) || 
               model.includes(`${seriesLetter.toLowerCase()} `) ||
               model.includes(`${seriesLetter.toLowerCase()}-`);
      }
      return model.includes(excludedModel);
    });
    
    if (isExcluded) {
      return {
        isValid: false,
        errorMessage: EXCLUSION_ERROR_MESSAGE
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Determine vehicle category for pricing adjustments
 */
function getVehicleCategory(vehicleData: VehicleData): string {
  const make = vehicleData.make?.toLowerCase().trim() || '';
  const model = vehicleData.model?.toLowerCase().trim() || '';
  const vehicleType = vehicleData.vehicleType?.toLowerCase().trim() || '';
  
  // Check for motorbike first (highest priority discount)
  if (vehicleType.includes('motor') || vehicleType.includes('bike')) {
    return 'motorbike';
  }
  
  // Check for Range Rover (highest price adjustment)
  if (make === 'land rover' && model.includes('range rover')) {
    return 'range_rover';
  }
  
  // Check for special variants (same as SUV pricing)
  if (make === 'audi' && (model.includes('s-line') || model.includes('sline'))) {
    return 'special_variant';
  }
  if (make === 'bmw' && (model.includes('m-sport') || model.includes('msport'))) {
    return 'special_variant';
  }
  if (make === 'mercedes' && (model.includes('amg-line') || model.includes('amgline'))) {
    return 'special_variant';
  }
  
  // Check for SUV/Van
  if (vehicleType === 'suv' || vehicleType === 'van' || 
      model.includes('suv') || model.includes('van')) {
    return 'suv_van';
  }
  
  return 'standard';
}

/**
 * Calculate price adjustments based on vehicle type and duration
 */
export function calculateVehiclePriceAdjustment(
  vehicleData: VehicleData, 
  warrantyDurationYears: number
): PriceAdjustment {
  // First validate eligibility
  const eligibility = validateVehicleEligibility(vehicleData);
  if (!eligibility.isValid) {
    return {
      isValid: false,
      errorMessage: eligibility.errorMessage,
      adjustmentAmount: 0,
      adjustmentType: 'exclusion',
      breakdown: []
    };
  }
  
  const category = getVehicleCategory(vehicleData);
  let adjustmentAmount = 0;
  let adjustmentType = 'standard';
  const breakdown: { baseAdjustment: number; adjustmentReason: string }[] = [];
  
  switch (category) {
    case 'motorbike':
      // 50% discount on base price - this will be applied as negative adjustment
      adjustmentAmount = -0.5; // 50% discount (will be applied as percentage)
      adjustmentType = 'motorbike_discount';
      breakdown.push({
        baseAdjustment: -0.5,
        adjustmentReason: 'Motorbike 50% discount applied'
      });
      break;
      
    case 'range_rover':
      if (warrantyDurationYears === 1) adjustmentAmount = 200;
      else if (warrantyDurationYears === 2) adjustmentAmount = 400;
      else if (warrantyDurationYears === 3) adjustmentAmount = 600;
      adjustmentType = 'range_rover_premium';
      breakdown.push({
        baseAdjustment: adjustmentAmount,
        adjustmentReason: `Range Rover premium: +£${adjustmentAmount} for ${warrantyDurationYears} year warranty`
      });
      break;
      
    case 'special_variant':
    case 'suv_van':
      if (warrantyDurationYears === 1) adjustmentAmount = 100;
      else if (warrantyDurationYears === 2) adjustmentAmount = 200;
      else if (warrantyDurationYears === 3) adjustmentAmount = 300;
      adjustmentType = category === 'special_variant' ? 'special_variant_premium' : 'suv_van_premium';
      const vehicleTypeLabel = category === 'special_variant' ? 'Special variant' : 'SUV/Van';
      breakdown.push({
        baseAdjustment: adjustmentAmount,
        adjustmentReason: `${vehicleTypeLabel} premium: +£${adjustmentAmount} for ${warrantyDurationYears} year warranty`
      });
      break;
      
    default:
      adjustmentType = 'standard';
      breakdown.push({
        baseAdjustment: 0,
        adjustmentReason: 'Standard vehicle - no adjustment applied'
      });
  }
  
  return {
    isValid: true,
    adjustmentAmount,
    adjustmentType,
    breakdown
  };
}

/**
 * Apply price adjustment to a base price
 */
export function applyPriceAdjustment(basePrice: number, adjustment: PriceAdjustment): number {
  if (!adjustment.isValid) return basePrice;
  
  // Handle percentage adjustments (motorbike discount)
  if (adjustment.adjustmentAmount < 0 && adjustment.adjustmentAmount > -1) {
    return Math.round(basePrice * (1 + adjustment.adjustmentAmount));
  }
  
  // Handle fixed amount adjustments
  return Math.round(basePrice + adjustment.adjustmentAmount);
}