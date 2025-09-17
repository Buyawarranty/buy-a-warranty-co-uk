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
    key: 'tyre',
    icon: '🛞',
    title: 'Tyre Cover',
    shortDescription: 'Cheaper than a single tyre repair £5/mo',
    price: 5,
    priceType: 'monthly',
    bulletPoints: [
      'Puncture repairs covered',
      'Replacement due to accidental damage',
      'Emergency roadside tyre fitting',
      'Alloy wheel damage coverage',
      'Valve replacements included'
    ]
  },
  {
    key: 'wearTear',
    icon: '🛠️',
    title: 'Wear & Tear',
    shortDescription: 'Extra peace of mind for ageing parts just £5/mo',
    price: 5,
    priceType: 'monthly',
    bulletPoints: [
      'Natural deterioration of vehicle components',
      'Brake pads and clutch wear covered',
      'Suspension bushes included',
      'High-wear items protection',
      'Essential for vehicles over 5 years old'
    ]
  },
  {
    key: 'european',
    icon: '🇪🇺',
    title: 'Europe Cover',
    shortDescription: 'Drive with confidence across Europe just £3/mo',
    price: 3,
    priceType: 'monthly',
    bulletPoints: [
      'Coverage in all EU countries plus Switzerland, Norway, Iceland',
      'Emergency accommodation provided',
      'Vehicle repatriation service',
      'Hire car if repairs take more than 24 hours',
      '24/7 multilingual helpline'
    ]
  },
  {
    key: 'breakdown',
    icon: '🚗',
    title: '24/7 Recovery',
    shortDescription: '24/7 roadside assistance and recovery service £6/mo',
    price: 6,
    priceType: 'monthly',
    bulletPoints: [
      '24/7 roadside assistance coverage',
      'Vehicle recovery to nearest garage',
      'Emergency fuel delivery',
      'Battery jump start service',
      'Flat tyre change assistance',
      'Key lockout service'
    ]
  },
  {
    key: 'rental',
    icon: '🚙',
    title: 'Vehicle Rental',
    shortDescription: 'Replacement vehicle while yours is being repaired £4/mo',
    price: 4,
    priceType: 'monthly',
    bulletPoints: [
      'Replacement vehicle for up to 14 days',
      'Available while your car is being repaired',
      'Similar category vehicle provided',
      'Comprehensive insurance included',
      'Collection and delivery service',
      'Emergency rental available 24/7'
    ]
  },
  {
    key: 'motRepair',
    icon: '🔧',
    title: 'MOT Repair',
    shortDescription: 'MOT failure repair cover just £4/mo',
    price: 4,
    priceType: 'monthly',
    bulletPoints: [
      'Covers cost of MOT failure repairs',
      'Up to £750 per claim',
      'Includes parts and labour',
      'Fast-track repair service',
      'Nationwide coverage'
    ]
  },
  {
    key: 'motFee',
    icon: '📋',
    title: 'MOT Fee',
    shortDescription: 'Annual MOT test fee covered £3/mo',
    price: 3,
    priceType: 'monthly',
    bulletPoints: [
      'Annual MOT test fee covered',
      'Choose your preferred test center',
      'Reminder service included',
      'Online booking available',
      'Certificate delivery service'
    ]
  },
  {
    key: 'lostKey',
    icon: '🔑',
    title: 'Lost Key',
    shortDescription: 'Lost or stolen key replacement £3/mo',
    price: 3,
    priceType: 'monthly',
    bulletPoints: [
      'Lost or stolen key replacement',
      'Emergency locksmith service',
      'New key programming included',
      '24/7 assistance available',
      'Up to £500 per claim'
    ]
  },
  {
    key: 'consequential',
    icon: '⚡',
    title: 'Consequential Damage',
    shortDescription: 'Cover for damage caused by covered failures £5/mo',
    price: 5,
    priceType: 'monthly',
    bulletPoints: [
      'Damage caused by covered component failures',
      'Engine damage from cooling system failure',
      'Transmission damage from clutch issues',
      'Additional peace of mind protection',
      'Up to claim limit coverage'
    ]
  },
  {
    key: 'transfer',
    icon: '🔁',
    title: 'Transfer Cover',
    shortDescription: 'Transfer to a new owner - One-off fee £30',
    price: 30,
    priceType: 'one-off',
    bulletPoints: [
      'Transfer remaining warranty to new owner',
      'Increases vehicle resale value',
      'Makes vehicle more attractive to buyers',
      'Simple online transfer process',
      'Immediate confirmation and updated documentation'
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
    <div className="grid sm:grid-cols-2 gap-3">
      {addOnPackages.map((addon) => {
              // Calculate total price based on duration for monthly add-ons
              const totalPrice = addon.priceType === 'monthly' ? addon.price * months : addon.price;
              const priceDisplay = addon.priceType === 'monthly' 
                ? `£${totalPrice} (£${addon.price}/mo × ${months} months)`
                : `£${addon.price}`;
              
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
                          {addon.priceType === 'one-off' && (
                            <span className="text-xs font-normal text-muted-foreground ml-1">one-time fee</span>
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