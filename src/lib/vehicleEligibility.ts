/**
 * Vehicle eligibility checking utility
 * Blocks specific high-performance and luxury vehicles from warranty coverage
 */

// Entire brands that are completely blocked
const BLOCKED_BRANDS = [
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

// Specific models blocked by make
const BLOCKED_MODELS_BY_MAKE = {
  'audi': [
    'rs2 avant', 'rs2',
    'rs3',
    'rs4 avant', 'rs4',
    'rs5',
    'rs6 avant', 'rs6',
    'rs7 sportback', 'rs7',
    'rs q3', 'rsq3',
    'rs q5', 'rsq5', 
    'rs q8', 'rsq8',
    'rs e-tron gt', 'rs etron gt',
    'tt rs', 'ttrs',
    'r8 v8', 'r8v8',
    'r8 v10', 'r8v10',
    'r8 v10 plus',
    'r8 spyder',
    'r8 gt',
    'r8 lms',
    's2 coupé', 's2 coupe', 's2',
    's2 avant',
    's2 sedan',
    's3',
    's4',
    's5',
    's6',
    's7',
    's8',
    'sq5',
    'sq7',
    'sq8',
    'tts',
    's e-tron gt', 's etron gt'
  ],
  'bmw': [
    'm1',
    '1m coupé', '1m coupe', '1m',
    'm2',
    'm2 competition',
    'm2 cs',
    'm3',
    'm4',
    'm4 competition',
    'm4 csl',
    'm4 gts',
    'm5',
    'm6',
    'm8',
    'm roadster',
    'm coupe',
    'm3 csl',
    'm3 crt',
    'm3 gts',
    'm4 kith edition',
    'm5 cs',
    '3.0 csl',
    'x3 m',
    'x4 m',
    'x5 m',
    'x6 m',
    'xm'
  ],
  'mercedes': [
    'c 36 amg', 'c36 amg',
    'c 43 amg', 'c43 amg',
    'c 55 amg', 'c55 amg',
    'c 63 amg', 'c63 amg',
    'e 36 amg', 'e36 amg',
    'e 50 amg', 'e50 amg',
    'e 55 amg', 'e55 amg',
    'e 63 amg', 'e63 amg',
    's 55 amg', 's55 amg',
    's 63 amg', 's63 amg',
    's 65 amg', 's65 amg',
    's 70 amg', 's70 amg',
    'cl 55 amg', 'cl55 amg',
    'cl 63 amg', 'cl63 amg',
    'cl 65 amg', 'cl65 amg',
    'sl 55 amg', 'sl55 amg',
    'sl 60 amg', 'sl60 amg',
    'sl 63 amg', 'sl63 amg',
    'sl 65 amg', 'sl65 amg',
    'sl 73 amg', 'sl73 amg',
    'clk 55 amg', 'clk55 amg',
    'clk 63 amg', 'clk63 amg',
    'clk dtm amg',
    'cls 55 amg', 'cls55 amg',
    'cls 63 amg', 'cls63 amg',
    'amg gt',
    'amg sl',
    'amg one',
    'ml 55 amg', 'ml55 amg',
    'ml 63 amg', 'ml63 amg',
    'g 36 amg', 'g36 amg',
    'g 55 amg', 'g55 amg',
    'g 63 amg', 'g63 amg',
    'g 65 amg', 'g65 amg',
    'gl 63 amg', 'gl63 amg',
    'gle 63 amg', 'gle63 amg',
    'gls 63 amg', 'gls63 amg',
    'r 63 amg', 'r63 amg'
  ],
  'mercedes-amg': [
    // Handle Mercedes-AMG as separate brand
    'c36', 'c43', 'c55', 'c63',
    'e36', 'e50', 'e55', 'e63',
    's55', 's63', 's65', 's70',
    'cl55', 'cl63', 'cl65',
    'sl55', 'sl60', 'sl63', 'sl65', 'sl73',
    'clk55', 'clk63', 'clk dtm',
    'cls55', 'cls63',
    'gt', 'sl', 'one',
    'ml55', 'ml63',
    'g36', 'g55', 'g63', 'g65',
    'gl63', 'gle63', 'gls63',
    'r63'
  ]
};

/**
 * Normalizes make/model strings for consistent comparison
 */
function normalizeVehicleIdentifier(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/mercedes-benz/g, 'mercedes')
    .replace(/mercedes amg/g, 'mercedes-amg');
}

/**
 * Checks if a vehicle make/model combination is blocked from warranty coverage
 */
export function isVehicleBlocked(make?: string, model?: string): { blocked: boolean; reason?: string } {
  if (!make) {
    return { blocked: false };
  }

  const normalizedMake = normalizeVehicleIdentifier(make);
  const normalizedModel = normalizeVehicleIdentifier(model || '');

  console.log(`🚫 Checking vehicle eligibility: ${normalizedMake} ${normalizedModel}`);

  // Check if entire brand is blocked
  if (BLOCKED_BRANDS.includes(normalizedMake)) {
    console.log(`❌ Brand ${normalizedMake} is completely blocked`);
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
      
      // Exact match
      if (normalizedModel === normalizedBlockedModel) {
        return true;
      }
      
      // Partial match for model variants (e.g., "RS3" matches "RS3 Sportback")
      if (normalizedModel.includes(normalizedBlockedModel) || normalizedBlockedModel.includes(normalizedModel)) {
        return true;
      }
      
      return false;
    });

    if (isModelBlocked) {
      console.log(`❌ Model ${normalizedMake} ${normalizedModel} is blocked`);
      return { 
        blocked: true, 
        reason: `We cannot provide warranty coverage for the ${make} ${model}. High-performance and specialty vehicles are excluded from our coverage due to specialized parts and servicing requirements.`
      };
    }
  }

  console.log(`✅ Vehicle ${normalizedMake} ${normalizedModel} is eligible for warranty`);
  return { blocked: false };
}

/**
 * Gets a user-friendly error message for blocked vehicles
 */
export function getBlockedVehicleMessage(make?: string, model?: string): string {
  const result = isVehicleBlocked(make, model);
  
  if (result.blocked && result.reason) {
    return result.reason;
  }
  
  return `We're sorry, but we cannot provide warranty coverage for ${make ? `${make} ` : ''}${model ? `${model} ` : ''}vehicles at this time.`;
}