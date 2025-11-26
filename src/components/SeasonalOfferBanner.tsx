import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const SeasonalOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  if (!isVisible) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#1e40af] text-white">
        <CollapsibleContent>
          <div className="relative container mx-auto px-4 py-2 md:py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-white text-center md:text-left">
                  ❄️ Don't Risk a Breakdown This Winter – Claim 3 Months FREE Extra Cover ⏰ Order by Sunday 11pm – ✨ Automatically Applied at Checkout
                </p>
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
        </CollapsibleContent>

        {/* Collapse/Expand Trigger */}
        <div className="flex justify-center pb-0.5">
          <CollapsibleTrigger asChild>
            <button
              className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isOpen ? "Collapse banner" : "Expand banner"}
            >
              {isOpen ? (
                <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
      </div>
    </Collapsible>
  );
};
