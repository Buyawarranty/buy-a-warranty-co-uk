// Dynamic pricing system based on vehicle age, MOT history, and vehicle characteristics
// Single plan structure with age-based and vehicle-specific pricing tiers

export interface VehiclePricingData {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  bodyType?: string;
  engineCapacity?: number;
  motHistory?: any[];
  isVan?: boolean;
  isPremiumBrand?: boolean;
  isEV?: boolean;
  isPHEV?: boolean;
}

export interface PricingTier {
  oneYear: number;
  twoYear: number;
  threeYear: number;
  enhancedOneYear: number;
  enhancedTwoYear: number;
  enhancedThreeYear: number;
}

// Base price tiers (reduced by £50 from original)
const BASE_PRICE_TIERS = [349, 399, 449, 499, 549, 599, 649, 749, 799, 849];

// Premium brands that get higher tier pricing
const PREMIUM_BRANDS = [
  'audi', 'bmw', 'mercedes', 'mercedes-benz', 'porsche', 'jaguar', 'land rover', 
  'bentley', 'maserati', 'tesla', 'lexus', 'infiniti', 'cadillac', 'volvo'
];

// Excluded premium series/models
const EXCLUDED_MODELS = [
  'audi r', 'audi s', 'bmw m', 'mercedes amg', 'bentley', 'maserati'
];

// Van identifiers
const VAN_KEYWORDS = ['van', 'transit', 'sprinter', 'crafter', 'daily', 'boxer', 'ducato'];

/**
 * Determine if vehicle is excluded from coverage
 */
export function isVehicleEligible(vehicleData: VehiclePricingData): boolean {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleData.year;
  
  // Exclude vehicles >12 years old
  if (vehicleAge > 12) return false;
  
  // Check for excluded premium models
  const makeModel = `${vehicleData.make} ${vehicleData.model}`.toLowerCase();
  return !EXCLUDED_MODELS.some(excluded => makeModel.includes(excluded));
}

/**
 * Determine if vehicle is a van
 */
export function isVan(vehicleData: VehiclePricingData): boolean {
  if (vehicleData.isVan) return true;
  
  const makeModel = `${vehicleData.make} ${vehicleData.model}`.toLowerCase();
  return VAN_KEYWORDS.some(keyword => makeModel.includes(keyword));
}

/**
 * Determine if vehicle is premium brand
 */
export function isPremiumBrand(vehicleData: VehiclePricingData): boolean {
  if (vehicleData.isPremiumBrand) return true;
  
  const make = vehicleData.make.toLowerCase();
  return PREMIUM_BRANDS.some(brand => make.includes(brand));
}

/**
 * Calculate base price tier index based on vehicle characteristics
 */
export function calculateBasePriceTier(vehicleData: VehiclePricingData): number {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleData.year;
  
  // Start with age-based tier (newer = higher tier)
  let tierIndex = Math.max(0, 9 - Math.floor(vehicleAge * 1.5)); // Rough age gradient
  
  // Adjust for vehicle characteristics
  if (isPremiumBrand(vehicleData)) {
    tierIndex = Math.min(9, tierIndex + 2); // Premium brands get higher tier
  }
  
  if (isVan(vehicleData)) {
    tierIndex = Math.min(9, tierIndex + 1); // Vans get surcharge
  }
  
  // EV/PHEV premium only for premium brands (like Tesla)
  if ((vehicleData.isEV || vehicleData.isPHEV) && isPremiumBrand(vehicleData)) {
    tierIndex = Math.min(9, tierIndex + 1);
  }
  
  // MOT history impact - more failures = higher tier (higher risk)
  if (vehicleData.motHistory && vehicleData.motHistory.length > 0) {
    const recentFailures = vehicleData.motHistory
      .slice(0, 3) // Last 3 MOTs
      .filter((mot: any) => mot.testResult === 'FAIL').length;
    
    if (recentFailures >= 2) {
      tierIndex = Math.min(9, tierIndex + 1);
    }
  }
  
  // Model year specific adjustments (median price steps)
  if (vehicleData.year >= 2019) {
    tierIndex = Math.max(0, tierIndex - 2); // 2019+ generally cheaper
  } else if (vehicleData.year <= 2013) {
    tierIndex = Math.min(9, tierIndex + 2); // 2013- more expensive
  }
  
  return Math.max(0, Math.min(9, tierIndex));
}

/**
 * Calculate multi-year pricing with bundle savings
 */
export function calculateMultiYearPricing(oneYearPrice: number): { twoYear: number; threeYear: number } {
  // Standard bundle savings formula
  const twoYearSaving = Math.floor(oneYearPrice * 0.15); // ~15% saving
  const threeYearSaving = Math.max(50, 2 * twoYearSaving - 50); // S₃ = 2·S₂ − £50
  
  return {
    twoYear: (oneYearPrice * 2) - twoYearSaving,
    threeYear: (oneYearPrice * 3) - threeYearSaving
  };
}

/**
 * Calculate enhanced cover pricing (+£79 per year modal uplift)
 */
export function calculateEnhancedPricing(standardPricing: PricingTier): PricingTier {
  const vanSurcharge = 20; // Some vans show +£99 instead of +£79
  const enhancedUplift = 79;
  
  return {
    ...standardPricing,
    enhancedOneYear: standardPricing.oneYear + enhancedUplift,
    enhancedTwoYear: standardPricing.twoYear + (enhancedUplift * 2),
    enhancedThreeYear: standardPricing.threeYear + (enhancedUplift * 3)
  };
}

/**
 * Apply payment method discounts
 */
export function applyPaymentDiscount(price: number, paymentMethod: 'full' | 'monthly'): number {
  if (paymentMethod === 'full') {
    return Math.floor(price * 0.9); // 10% discount for paying in full
  }
  return price; // Monthly 0% APR - no discount
}

/**
 * Calculate monthly payment amount
 */
export function calculateMonthlyPayment(annualPrice: number, years: number): number {
  const totalPrice = (annualPrice / 12) * (years * 12);
  return Math.ceil(totalPrice / (years * 12));
}

/**
 * Main pricing calculation function
 */
export function calculateVehiclePricing(vehicleData: VehiclePricingData): PricingTier | null {
  if (!isVehicleEligible(vehicleData)) {
    return null; // Vehicle not eligible
  }
  
  // Get base price tier
  const tierIndex = calculateBasePriceTier(vehicleData);
  const baseOneYearPrice = BASE_PRICE_TIERS[tierIndex];
  
  // Calculate multi-year pricing
  const multiYear = calculateMultiYearPricing(baseOneYearPrice);
  
  // Create standard pricing tier
  const standardPricing: PricingTier = {
    oneYear: baseOneYearPrice,
    twoYear: multiYear.twoYear,
    threeYear: multiYear.threeYear,
    enhancedOneYear: 0, // Will be calculated next
    enhancedTwoYear: 0,
    enhancedThreeYear: 0
  };
  
  // Add enhanced pricing
  return calculateEnhancedPricing(standardPricing);
}

/**
 * Get pricing display information
 */
export interface PricingDisplay {
  monthly1Year: number;
  monthly2Year: number;
  monthly3Year: number;
  full1Year: number;
  full2Year: number;
  full3Year: number;
  savings2Year: number;
  savings3Year: number;
}

export function getPricingDisplay(pricing: PricingTier, enhanced: boolean = false): PricingDisplay {
  const prices = enhanced ? {
    oneYear: pricing.enhancedOneYear,
    twoYear: pricing.enhancedTwoYear,
    threeYear: pricing.enhancedThreeYear
  } : {
    oneYear: pricing.oneYear,
    twoYear: pricing.twoYear,
    threeYear: pricing.threeYear
  };
  
  return {
    monthly1Year: calculateMonthlyPayment(prices.oneYear, 1),
    monthly2Year: calculateMonthlyPayment(prices.twoYear, 2),
    monthly3Year: calculateMonthlyPayment(prices.threeYear, 3),
    full1Year: applyPaymentDiscount(prices.oneYear, 'full'),
    full2Year: applyPaymentDiscount(prices.twoYear, 'full'),
    full3Year: applyPaymentDiscount(prices.threeYear, 'full'),
    savings2Year: (prices.oneYear * 2) - prices.twoYear,
    savings3Year: (prices.oneYear * 3) - prices.threeYear
  };
}