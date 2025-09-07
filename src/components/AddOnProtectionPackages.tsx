import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface AddOnProtectionPackagesProps {
  selectedAddOns: {[key: string]: boolean};
  onAddOnChange: (addOnKey: string, selected: boolean) => void;
}

const addOnPackages = [
  {
    key: 'breakdown',
    icon: '🚨',
    title: '24/7 Breakdown Recovery',
    shortDescription: 'Help whenever you need it.',
    price: 5,
    priceType: 'monthly',
    bulletPoints: [
      'Nationwide 24/7 breakdown recovery service',
      'Qualified technicians for roadside assistance',
      'Safe recovery to garage when needed',
      'Home start service included',
      'Onward travel if repairs take longer than expected'
    ]
  },
  {
    key: 'motRepair',
    icon: '🔧',
    title: 'MOT Repair Cover',
    shortDescription: 'Stay road-legal for just £6/mo',
    price: 6,
    priceType: 'monthly',
    bulletPoints: [
      'Covers repairs needed to pass MOT test',
      'Up to £500 per year coverage',
      'Essential safety items: brakes, lights, tyres',
      'Emissions issues covered',
      'Pre-MOT inspection service included'
    ]
  },
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
    title: 'European Cover',
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
  onAddOnChange
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

  return (
    <div className="mt-8 mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg p-6 border border-border shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Add-On Protection Packages</h3>
            <p className="text-muted-foreground">Enhance your warranty with optional protection covers</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOnPackages.map((addon) => (
              <div 
                key={addon.key}
                className={`p-3 rounded-lg transition-all duration-200 bg-white ${
                  selectedAddOns[addon.key] 
                    ? 'border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                    : 'border border-gray-300 shadow-sm hover:shadow-md hover:border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-lg mt-1">{addon.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base text-foreground mb-1">{addon.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{addon.shortDescription}</p>
                      <div className="text-lg font-bold text-black">
                        £{addon.price}{addon.priceType === 'monthly' ? '/mo' : ''}
                        {addon.priceType === 'one-off' && (
                          <span className="text-xs font-normal text-muted-foreground ml-1">one-time fee</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedAddOns[addon.key] || false}
                    onCheckedChange={(checked) => onAddOnChange(addon.key, !!checked)}
                    className="h-5 w-5 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                </div>

                <Collapsible open={expandedItems[addon.key]} onOpenChange={() => toggleExpanded(addon.key)}>
                  <div className="flex justify-end">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <span>Read more</span>
                      {expandedItems[addon.key] ? (
                        <ChevronUp className="h-4 w-4" strokeWidth={3} />
                      ) : (
                        <ChevronDown className="h-4 w-4" strokeWidth={3} />
                      )}
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-2">
                      {addon.bulletPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                          <span className="text-sm text-muted-foreground">{point}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnProtectionPackages;