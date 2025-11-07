import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import pandaMascot from '@/assets/panda-mascot.png';

export const SeasonalOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    // Check if offer is already claimed
    const claimed = localStorage.getItem('seasonal_offer_claimed');
    if (claimed === 'true') {
      setIsClaimed(true);
    }
  }, []);

  const handleClaimOffer = () => {
    const newClaimedState = !isClaimed;
    localStorage.setItem('seasonal_offer_claimed', newClaimedState.toString());
    setIsClaimed(newClaimedState);
    
    if (newClaimedState) {
      // Show success feedback
      const event = new CustomEvent('offerClaimed');
      window.dispatchEvent(event);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e40af] text-white">
      <div className="relative container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Panda Mascot - positioned differently for mobile and desktop */}
          <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 w-28 h-28 lg:w-36 lg:h-36">
            <img 
              src={pandaMascot} 
              alt="Warranty Panda" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          <div className="flex-1 text-center md:text-left md:ml-32 lg:ml-40">
            {/* Mobile Panda - shows above text on mobile */}
            <div className="md:hidden w-32 h-32 mx-auto mb-3">
              <img 
                src={pandaMascot} 
                alt="Warranty Panda" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 text-center md:text-left">
              ❄️ Don't Risk a Breakdown This Winter
            </h1>
            <h2 className="text-lg md:text-xl font-semibold text-yellow-300 mb-2 text-center md:text-left">
              Get 3 Extra Months Cover FREE
            </h2>
            <p className="text-sm md:text-base text-white/90 text-center md:text-left">
              ⏰ Order by Sunday 11pm to Secure Cover
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleClaimOffer}
              size="lg"
              className={`font-bold px-6 py-3 shadow-lg transition-all duration-300 ${
                isClaimed 
                  ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' 
                  : 'bg-white text-blue-700 hover:bg-blue-50 hover:scale-105'
              }`}
            >
              {isClaimed ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                  Offer Claimed!
                </span>
              ) : (
                'Claim Now'
              )}
            </Button>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close banner"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
