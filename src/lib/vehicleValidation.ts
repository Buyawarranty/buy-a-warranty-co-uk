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

// Excluded vehicle makes (entire brands)
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

// Specific model exclusions by make
const MODEL_EXCLUSIONS = {
  'audi': [
    'rs2 avant', 'rs3', 'rs4 avant', 'rs5', 'rs6 avant', 'rs7 sportback',
    'rs q3', 'rs q5', 'rs q8', 'rs e-tron gt', 'tt rs', 'r8 v8', 'r8 v10',
    'r8 v10 plus', 'r8 spyder', 'r8 gt', 'r8 lms', 's2 coupé', 's2 avant',
    's2 sedan', 's3', 's4', 's5', 's6', 's7', 's8', 'sq5', 'sq7', 'sq8',
    'tts', 's e-tron gt'
  ],
  'bmw': [
    'm1', '1m coupé', 'm2', 'm2 competition', 'm2 cs', 'm3', 'm4',
    'm4 competition', 'm4 csl', 'm4 gts', 'm5', 'm6', 'm8',
    'm roadster', 'm coupe', 'm3 csl', 'm3 crt', 'm3 gts',
    'm4 kith edition', 'm5 cs', '3.0 csl', 'x3 m', 'x4 m', 'x5 m',
    'x6 m', 'xm'
  ],
  'mercedes': [
    'c 36 amg', 'c 43 amg', 'c 55 amg', 'c 63 amg', 'e 36 amg',
    'e 50 amg', 'e 55 amg', 'e 63 amg', 's 55 amg', 's 63 amg',
    's 65 amg', 's 70 amg', 'cl 55 amg', 'cl 63 amg', 'cl 65 amg',
    'sl 55 amg', 'sl 60 amg', 'sl 63 amg', 'sl 65 amg', 'sl 73 amg',
    'clk 55 amg', 'clk 63 amg', 'clk dtm amg', 'cls 55 amg', 'cls 63 amg',
    'amg gt', 'amg sl', 'amg one', 'ml 55 amg', 'ml 63 amg', 'g 36 amg',
    'g 55 amg', 'g 63 amg', 'g 65 amg', 'gl 63 amg', 'gle 63 amg',
    'gls 63 amg', 'r 63 amg', 'e-class amg estates'
  ]
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
      // Normalize both model strings for comparison
      const normalizedModel = model.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const normalizedExcludedModel = excludedModel.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      
      // Check for exact match or if the model starts with the excluded model
      return normalizedModel === normalizedExcludedModel || 
             normalizedModel.startsWith(normalizedExcludedModel + ' ') ||
             normalizedModel.includes(' ' + normalizedExcludedModel + ' ') ||
             normalizedModel.includes(' ' + normalizedExcludedModel);
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