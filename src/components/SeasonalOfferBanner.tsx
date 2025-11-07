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
    localStorage.setItem('seasonal_offer_claimed', 'true');
    setIsClaimed(true);
    
    // Show success feedback
    const event = new CustomEvent('offerClaimed');
    window.dispatchEvent(event);
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
            <div className="md:hidden w-24 h-24 mx-auto mb-3">
              <img 
                src={pandaMascot} 
                alt="Warranty Panda" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              ❄️ Don't Risk a Breakdown This Winter
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-yellow-300 mb-2">
              Get 3 Extra Months Cover FREE
            </h2>
            <p className="text-base md:text-lg text-white/90">
              Order by Sunday 11pm to Secure Cover
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isClaimed ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg font-semibold text-white">
                <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                <span>Offer Claimed!</span>
              </div>
            ) : (
              <Button
                onClick={handleClaimOffer}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Claim Now
              </Button>
            )}
            
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
