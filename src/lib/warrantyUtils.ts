// Utility functions for warranty calculations that match the edge function logic

export function getWarrantyDuration(paymentType: string): number {
  switch (paymentType?.toLowerCase()) {
    case 'monthly': return 12; // API expects 12 months minimum
    case 'yearly': return 12;
    case 'two_yearly': return 24;
    case 'three_yearly': return 36;
    default: return 12;
  }
}

export function getWarrantyDurationDisplay(paymentType: string): string {
  const months = getWarrantyDuration(paymentType);
  if (months === 12) return '12 months';
  if (months === 24) return '24 months';
  if (months === 36) return '36 months';
  return `${months} months`;
}

export function getPaymentTypeDisplay(paymentType: string): string {
  switch (paymentType?.toLowerCase()) {
    case 'monthly': return 'Monthly';
    case 'yearly': return '12 months';
    case 'two_yearly': return '24 months';
    case 'three_yearly': return '36 months';
    default: return paymentType;
  }
}