import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    longDescription: 'Our nationwide 24/7 breakdown recovery service ensures you\'re never stranded. Whether it\'s a flat battery, punctured tyre, or mechanical failure, our qualified technicians will get you back on the road or arrange safe recovery to a garage. Includes roadside assistance, home start, and onward travel if repairs take longer than expected.'
  },
  {
    key: 'motRepair',
    icon: '🔧',
    title: 'MOT Repair Cover',
    shortDescription: 'Stay road-legal for just £6/mo',
    price: 6,
    priceType: 'monthly',
    longDescription: 'Covers the cost of repairs needed to pass your MOT test, up to £500 per year. This includes essential safety items like brakes, lights, tyres, and emissions issues that could cause your vehicle to fail. Pre-MOT inspection service included to identify potential failures before your test date.'
  },
  {
    key: 'tyre',
    icon: '🛞',
    title: 'Tyre Cover',
    shortDescription: 'Cheaper than a single tyre repair £5/mo',
    price: 5,
    priceType: 'monthly',
    longDescription: 'Comprehensive tyre protection covering puncture repairs, replacement due to accidental damage, and emergency roadside tyre fitting. Includes coverage for alloy wheel damage and valve replacements. With average tyre costs exceeding £100, this cover pays for itself with just one claim.'
  },
  {
    key: 'wearTear',
    icon: '🛠️',
    title: 'Wear & Tear',
    shortDescription: 'Extra peace of mind for ageing parts just £5/mo',
    price: 5,
    priceType: 'monthly',
    longDescription: 'Covers the natural deterioration of vehicle components that standard warranties exclude. Includes brake pads, clutch wear, suspension bushes, and other high-wear items that fail through normal use. Essential protection for vehicles over 5 years old where wear and tear becomes more common.'
  },
  {
    key: 'european',
    icon: '🇪🇺',
    title: 'European Cover',
    shortDescription: 'Drive with confidence across Europe just £3/mo',
    price: 3,
    priceType: 'monthly',
    longDescription: 'Extends your warranty coverage to all EU countries plus Switzerland, Norway, and Iceland. Includes emergency accommodation, vehicle repatriation, and hire car if repairs take more than 24 hours. Also covers additional costs for parts and labour in European garages, plus 24/7 multilingual helpline.'
  },
  {
    key: 'transfer',
    icon: '🔁',
    title: 'Transfer Cover',
    shortDescription: 'Transfer to a new owner - One-off fee £30',
    price: 30,
    priceType: 'one-off',
    longDescription: 'Transfer your remaining warranty to the new owner when you sell your vehicle. This valuable benefit can increase your vehicle\'s resale value and makes it more attractive to potential buyers. Simple online transfer process with immediate confirmation and updated documentation for the new owner.'
  }
];

const AddOnProtectionPackages: React.FC<AddOnProtectionPackagesProps> = ({
  selectedAddOns,
  onAddOnChange
}) => {
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mt-12 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">Add-On Protection Packages</h3>
          <p className="text-muted-foreground">Enhance your warranty with optional protection covers</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addOnPackages.map((addon) => (
            <div 
              key={addon.key}
              className={`p-4 rounded-lg transition-all duration-200 ${
                selectedAddOns[addon.key] 
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-xl">{addon.icon}</div>
                <Checkbox 
                  checked={selectedAddOns[addon.key] || false}
                  onCheckedChange={(checked) => onAddOnChange(addon.key, !!checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <h4 className="font-semibold text-base text-foreground mb-1">{addon.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{addon.shortDescription}</p>
              
              <div className="mb-3">
                <div className="text-lg font-bold text-primary">
                  £{addon.price}{addon.priceType === 'monthly' ? '/mo' : ''}
                  {addon.priceType === 'one-off' && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">one-time fee</span>
                  )}
                </div>
              </div>

              <Collapsible open={expandedItems[addon.key]} onOpenChange={() => toggleExpanded(addon.key)}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-primary hover:text-primary/80 transition-colors">
                  <span>Read more</span>
                  {expandedItems[addon.key] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {addon.longDescription}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddOnProtectionPackages;