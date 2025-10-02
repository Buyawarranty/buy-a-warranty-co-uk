import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ReturnDiscountBannerProps {
  firstPurchaseDate: string | null;
  onDismiss?: () => void;
}

export const ReturnDiscountBanner: React.FC<ReturnDiscountBannerProps> = ({ 
  firstPurchaseDate,
  onDismiss 
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('returnDiscountBanner_dismissed') === 'true';
    setIsDismissed(dismissed);

    // Check if discount was already used
    const discountUsed = localStorage.getItem('returnDiscount_used') === 'true';
    
    if (!firstPurchaseDate || dismissed || discountUsed) {
      setIsEligible(false);
      return;
    }

    // Calculate if within 30 days
    const purchaseDate = new Date(firstPurchaseDate);
    const now = new Date();
    const diffTime = now.getTime() - purchaseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 30 - diffDays;

    if (remaining > 0) {
      setIsEligible(true);
      setDaysRemaining(remaining);
    } else {
      setIsEligible(false);
    }
  }, [firstPurchaseDate]);

  const handleDismiss = () => {
    localStorage.setItem('returnDiscountBanner_dismissed', 'true');
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleGetDiscount = () => {
    // Navigate to quote page with discount flag
    navigate('/?returnDiscount=true');
  };

  if (!isEligible || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 relative animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold text-lg">Your 10% discount is ready!</p>
            <p className="text-sm text-orange-100">
              Valid for {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} on your next purchase
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGetDiscount}
            variant="secondary"
            size="sm"
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
          >
            Get Another Warranty
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-orange-700 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
