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
      {/* Animated snowflakes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-[fall_10s_linear_infinite] opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 10}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Panda Mascot - positioned differently for mobile and desktop */}
          <div className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 w-24 h-24 lg:w-32 lg:h-32">
            <img 
              src={pandaMascot} 
              alt="Warranty Panda" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <div className="flex-1 text-center md:text-left md:ml-28 lg:ml-36">
            {/* Mobile Panda - shows above text on mobile */}
            <div className="md:hidden w-20 h-20 mx-auto mb-2">
              <img 
                src={pandaMascot} 
                alt="Warranty Panda" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Don't Risk a Breakdown This Winter
              </h3>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
            </div>
            <p className="text-sm md:text-base text-white">
              Get 3 Extra Months Cover FREE – Limited Time Only! Order by Sunday 11:00pm to Guarantee Your Bonus Cover
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

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
