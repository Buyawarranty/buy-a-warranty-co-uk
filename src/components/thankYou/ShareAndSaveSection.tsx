import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Star } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
import trustpilotLogo from '/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png';

interface ShareAndSaveSectionProps {
  onReferClick?: () => void;
}

export const ShareAndSaveSection: React.FC<ShareAndSaveSectionProps> = ({
  onReferClick
}) => {
  const handleReferClick = () => {
    if (onReferClick) {
      onReferClick();
    }
    // Implement referral logic
    window.open('mailto:?subject=Get £30 off your car warranty&body=I just got a great warranty from Buy-A-Warranty. Use my referral to get £30 off! https://www.buyawarranty.co.uk', '_blank');
  };

  const handleTrustpilotClick = () => {
    window.open('https://uk.trustpilot.com/review/buyawarranty.co.uk', '_blank');
  };

  return (
    <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
          Share & Save
        </h2>
        
        <div className="space-y-6">
          {/* Referral Section */}
          <div className="text-center p-6 bg-background rounded-lg border border-border">
            <Gift className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-2">
              Refer a mate and get £30 off your next warranty!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share the love and save on your future coverage
            </p>
            <Button
              onClick={handleReferClick}
              className="w-full md:w-auto bg-primary hover:bg-primary/90"
            >
              📨 Refer a Friend
            </Button>
          </div>
          
          {/* Trustpilot Section */}
          <div className="text-center p-6 bg-background rounded-lg border border-border">
            <Star className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-3">
              See what others are saying
            </h3>
            <button
              onClick={handleTrustpilotClick}
              className="inline-block transition-opacity hover:opacity-80"
            >
              <OptimizedImage 
                src={trustpilotLogo} 
                alt="Trustpilot 5 stars" 
                className="h-auto w-32 object-contain mx-auto"
                priority={false}
                width={120}
                height={37}
              />
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              Rated Excellent on Trustpilot
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
