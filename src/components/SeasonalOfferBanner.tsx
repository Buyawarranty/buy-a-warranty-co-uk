import { useState } from 'react';
import { X } from 'lucide-react';

export const SeasonalOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e40af] text-white">
      {/* Snowfall effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animation: `fall ${8 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
              fontSize: `${10 + Math.random() * 8}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>
      
      <div className="relative container mx-auto px-4 py-2 md:py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs md:text-sm text-white text-center md:text-left space-y-0.5">
              <p>
                <span className="text-yellow-300">❄️ Don't Risk a Breakdown This Winter</span>
                <span className="font-bold text-white"> – Claim 3 Months FREE Extra Cover</span>
              </p>
              <p>
                <span className="font-bold text-white">⏰ Order by Sunday 11pm – ✨</span>
                <span className="text-[0.7rem] md:text-xs text-white"> Automatically Applied at Checkout</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Close banner"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
