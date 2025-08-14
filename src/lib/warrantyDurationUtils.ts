// Centralized warranty duration utilities to ensure consistency across all systems
// This should be the single source of truth for warranty duration calculations

export interface PaymentDuration {
  months: number;
  displayText: string;
  paymentFrequency: string;
}

/**
 * Get warranty duration in months based on payment type
 * This is the MASTER function for warranty duration calculation
 */
export function getWarrantyDurationInMonths(paymentType: string): number {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
      return 12; // Monthly payments still provide 12 months minimum coverage
    case 'yearly':
    case 'annual':
    case '12months':
    case '12month':
    case 'year':
      return 12;
    case 'twoyearly':
    case '2yearly':
    case '24months':
    case '24month':
    case '2years':
    case '2year':
    case 'two_yearly':
      return 24;
    case 'threeyearly':
    case '3yearly':
    case '36months':
    case '36month':
    case '3years':
    case '3year':
    case 'three_yearly':
      return 36;
    case 'fouryearly':
    case '4yearly':
    case '48months':
    case '48month':
    case '4years':
    case '4year':
    case 'four_yearly':
      return 48;
    case 'fiveyearly':
    case '5yearly':
    case '60months':
    case '60month':
    case '5years':
    case '5year':
    case 'five_yearly':
      return 60;
    default:
      console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
      return 12;
  }
}

/**
 * Get warranty duration display text
 */
export function getWarrantyDurationDisplay(paymentType: string): string {
  const months = getWarrantyDurationInMonths(paymentType);
  if (months === 12) return '12 months';
  if (months === 24) return '24 months';
  if (months === 36) return '36 months';
  if (months === 48) return '48 months';
  if (months === 60) return '60 months';
  return `${months} months`;
}

/**
 * Get payment type display name
 */
export function getPaymentTypeDisplay(paymentType: string): string {
  const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
  
  switch (normalizedPaymentType) {
    case 'monthly':
    case '1month':
    case 'month':
      return 'Monthly';
    case 'yearly':
    case 'annual':
    case '12months':
    case '12month':
    case 'year':
      return '12 months';
    case 'twoyearly':
    case '2yearly':
    case '24months':
    case '24month':
    case '2years':
    case '2year':
    case 'two_yearly':
      return '24 months';
    case 'threeyearly':
    case '3yearly':
    case '36months':
    case '36month':
    case '3years':
    case '3year':
    case 'three_yearly':
      return '36 months';
    case 'fouryearly':
    case '4yearly':
    case '48months':
    case '48month':
    case '4years':
    case '4year':
    case 'four_yearly':
      return '48 months';
    case 'fiveyearly':
    case '5yearly':
    case '60months':
    case '60month':
    case '5years':
    case '5year':
    case 'five_yearly':
      return '60 months';
    default:
      return paymentType || 'Unknown';
  }
}

/**
 * Calculate policy end date based on start date and payment type
 */
export function calculatePolicyEndDate(startDate: Date, paymentType: string): Date {
  const months = getWarrantyDurationInMonths(paymentType);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
}

/**
 * Get warranty duration for Warranties 2000 API (string format)
 */
export function getWarrantyDurationForAPI(paymentType: string): string {
  return getWarrantyDurationInMonths(paymentType).toString();
}

/**
 * Get comprehensive payment duration information
 */
export function getPaymentDurationInfo(paymentType: string): PaymentDuration {
  const months = getWarrantyDurationInMonths(paymentType);
  const displayText = getWarrantyDurationDisplay(paymentType);
  const paymentFrequency = getPaymentTypeDisplay(paymentType);
  
  return {
    months,
    displayText,
    paymentFrequency
  };
}

/**
 * Format duration for email templates
 */
export function formatDurationForEmail(paymentType: string): string {
  const months = getWarrantyDurationInMonths(paymentType);
  return `${months} month${months === 1 ? '' : 's'}`;
}