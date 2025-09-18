import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface AddOnProtectionPackagesProps {
  selectedAddOns: {[key: string]: boolean};
  onAddOnChange: (addOnKey: string, selected: boolean) => void;
  paymentType: '12months' | '24months' | '36months';
}

const addOnPackages = [
  {
    key: 'breakdown',
    icon: '🚗',
    title: '24/7 Vehicle recovery',
    shortDescription: 'Only 12 interest-free easy installments for entire warranty period',
    price: 3.99,
    priceType: 'monthly',
    bulletPoints: [
      'Get roadside assistance and recovery if your vehicle breaks down unexpectedly',
      'For full details please see platinum warranty cover below'
    ]
  },
  {
    key: 'tyre',
    icon: '🛞',
    title: 'TyreCover',
    shortDescription: 'Only 12 interest-free easy installments for entire warranty period',
    price: 7.99,
    priceType: 'monthly',
    bulletPoints: [
      'Includes repair or replacement for damaged tyres',
      'For full details please see platinum warranty cover below'
    ]
  },
  {
    key: 'european',
    icon: '🇪🇺',
    title: 'Europe Cover',
    shortDescription: 'Same UK level platinum cover whilst you drive with confidence across Europe',
    price: 0,
    priceType: 'monthly',
    bulletPoints: [
      'Same UK level platinum cover whilst you drive with confidence across Europe',
      'For full details please see platinum warranty cover below'
    ]
  },
  {
    key: 'rental',
    icon: '🚙',
    title: 'Vehicle Rental',
    shortDescription: 'Only 12 interest-free easy installments for entire warranty period',
    price: 3.99,
    priceType: 'monthly',
    bulletPoints: [
      'Replacement vehicle while yours is being repaired',
      'For full details please see platinum warranty cover below'
    ]
  },
  {
    key: 'transfer',
    icon: '🔁',
    title: 'Transfer Cover',
    shortDescription: 'Transfer to a new owner',
    price: 19.99,
    priceType: 'one-off',
    bulletPoints: [
      'Transfer remaining warranty to new owner',
      'Increases vehicle resale value',
      'Makes vehicle more attractive to buyers'
    ]
  }
];

const AddOnProtectionPackages: React.FC<AddOnProtectionPackagesProps> = ({
  selectedAddOns,
  onAddOnChange,
  paymentType
}) => {
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => {
      const isCurrentlyOpen = prev[key];
      // Close all items first, then open the clicked one if it wasn't open
      const newState: {[key: string]: boolean} = {};
      addOnPackages.forEach(addon => {
        newState[addon.key] = false;
      });
      if (!isCurrentlyOpen) {
        newState[key] = true;
      }
      return newState;
    });
  };

  // Calculate the number of months based on payment type
  const getMonthsFromPaymentType = (paymentType: string) => {
    switch (paymentType) {
      case '12months': return 12;
      case '24months': return 24;
      case '36months': return 36;
      default: return 12;
    }
  };

  const months = getMonthsFromPaymentType(paymentType);

  return (
    <div className="grid md:grid-cols-3 gap-3">
      {addOnPackages.map((addon) => {
              // Calculate total price based on duration for monthly add-ons
              const totalPrice = addon.priceType === 'monthly' ? addon.price * months : addon.price;
              const priceDisplay = addon.priceType === 'monthly' 
                ? addon.price > 0 
                  ? `£${addon.price.toFixed(2)} per month`
                  : 'Included'
                : `£${addon.price} one-time fee`;
              
              return (
                 <div 
                   key={addon.key}
                   onClick={() => onAddOnChange(addon.key, !selectedAddOns[addon.key])}
                   className={`p-4 rounded-lg transition-all duration-200 bg-white cursor-pointer ${
                     selectedAddOns[addon.key] 
                       ? 'border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                       : 'border border-gray-300 shadow-sm hover:shadow-md hover:border-orange-300 hover:bg-gray-50'
                   }`}
                 >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl mt-1">{addon.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground mb-1">{addon.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{addon.shortDescription}</p>
                        <div className="text-sm font-bold text-black">
                          {priceDisplay}
                          {addon.priceType === 'monthly' && addon.price > 0 && (
                            <div className="text-xs font-normal text-muted-foreground">
                              Only 12 interest-free easy installments for entire warranty period
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Checkbox 
                      checked={selectedAddOns[addon.key] || false}
                      onCheckedChange={(checked) => onAddOnChange(addon.key, !!checked)}
                      className="h-4 w-4 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:border-black flex-shrink-0"
                    />
                  </div>

                  <Collapsible open={expandedItems[addon.key]} onOpenChange={() => toggleExpanded(addon.key)}>
                    <div className="flex justify-end">
                      <CollapsibleTrigger 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <span>Read more</span>
                        {expandedItems[addon.key] ? (
                          <ChevronUp className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          <ChevronDown className="h-3 w-3" strokeWidth={3} />
                        )}
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-1">
                        {addon.bulletPoints.map((point, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" strokeWidth={3} />
                            <span className="text-xs text-muted-foreground">{point}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
    </div>
  );
};

export default AddOnProtectionPackages;