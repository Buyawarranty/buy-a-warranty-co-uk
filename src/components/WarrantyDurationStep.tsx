import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Crown, Check, ArrowLeft, X, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WarrantyDurationStepProps {
  vehicleData: any;
  planId: string;
  planName?: string;
  pricingData?: {
    totalPrice: number;
    monthlyPrice: number;
    voluntaryExcess: number;
    selectedAddOns: {[addon: string]: boolean};
    protectionAddOns?: {[key: string]: boolean};
    claimLimit?: number;
  };
  onNext: (paymentType: string) => void;
  onBack: () => void;
}

const WarrantyDurationStep: React.FC<WarrantyDurationStepProps> = ({
  vehicleData,
  planId,
  planName,
  pricingData,
  onNext,
  onBack
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('24months');
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();

  // Get pricing data using the exact pricing structure from the matrix
  const getPricingForDuration = (paymentPeriod: string) => {
    if (!pricingData) return { totalPrice: 0, monthlyPrice: 0 };
    
    const { voluntaryExcess = 50, claimLimit = 1250, protectionAddOns = {}, selectedAddOns = {} } = pricingData;
    
    console.log('WarrantyDurationStep - getPricingForDuration Debug:', {
      paymentPeriod,
      receivedPricingData: pricingData,
      voluntaryExcess,
      claimLimit,
      protectionAddOns,
      selectedAddOns
    });
    
    // Your exact pricing matrix for base warranty
    const pricingTable = {
      '12months': {
        0: { 750: 467, 1250: 497, 2000: 587 },
        50: { 750: 437, 1250: 457, 2000: 547 },
        100: { 750: 387, 1250: 417, 2000: 507 },
        150: { 750: 367, 1250: 387, 2000: 477 }
      },
      '24months': {
        0: { 750: 897, 1250: 937, 2000: 1027 },
        50: { 750: 827, 1250: 877, 2000: 957 },
        100: { 750: 737, 1250: 787, 2000: 877 },
        150: { 750: 697, 1250: 737, 2000: 827 }
      },
      '36months': {
        0: { 750: 1347, 1250: 1397, 2000: 1497 },
        50: { 750: 1247, 1250: 1297, 2000: 1397 },
        100: { 750: 1097, 1250: 1177, 2000: 1277 },
        150: { 750: 1047, 1250: 1097, 2000: 1197 }
      }
    };
    
    const periodData = pricingTable[paymentPeriod as keyof typeof pricingTable] || pricingTable['12months'];
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[50];
    const baseWarrantyPrice = excessData[claimLimit as keyof typeof excessData] || excessData[1250];
    
    // Calculate addon prices for this duration
    const durationMonths = paymentPeriod === '12months' ? 12 : 
                          paymentPeriod === '24months' ? 24 : 
                          paymentPeriod === '36months' ? 36 : 12;
    
    // Plan-specific addons (from step 3 selection)
    const planAddOnCount = Object.values(selectedAddOns || {}).filter(Boolean).length;
    const planAddOnPrice = planAddOnCount * 2 * durationMonths; // £2 per add-on per month * duration
    
    // Protection addons (from step 3 selection)
    let protectionAddOnPrice = 0;
    if (protectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths; // £6/mo
    if (protectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths; // £4/mo (Note: this should be vehicle_rental)
    if (protectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.wearTear) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.european) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths; // £4/mo
    if (protectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.transfer) protectionAddOnPrice += 30; // £30 one-time
    
    const totalPrice = baseWarrantyPrice + planAddOnPrice + protectionAddOnPrice;
    
    // Apply automatic discounts for multi-year plans
    let discountedPrice = totalPrice;
    if (paymentPeriod === '24months') {
      discountedPrice = totalPrice - 100; // £100 discount for 2-year plans
    } else if (paymentPeriod === '36months') {
      discountedPrice = totalPrice - 200; // £200 discount for 3-year plans
    }
    
    const monthlyPrice = Math.round(discountedPrice / 12); // Always use 12 months for monthly calculation
    
    console.log('WarrantyDurationStep - Calculated pricing:', {
      paymentPeriod,
      baseWarrantyPrice,
      planAddOnPrice,
      protectionAddOnPrice,
      totalPrice,
      discountedPrice,
      monthlyPrice,
      selectedFromMatrix: `${voluntaryExcess}_${claimLimit}`,
      durationMonths,
      addOnBreakdown: {
        planAddOnCount,
        protectionAddOns
      }
    });
    
    return { totalPrice: discountedPrice, monthlyPrice };
  };

  const durationOptions = [
    {
      id: '12months',
      title: '✅ 1-Year Cover',
      subtitle: '',
      description: 'Flexible protection for 12 month cover',
      planTitle: 'Platinum Comprehensive Plan',
      features: [
        '*All mechanical & electrical parts',
        'Up to 10 claims per policy',
        'Labour costs included',
        'Fault diagnostics',
        'Consequential damage cover',
        'Fast claims process',
        '14-day money-back guarantee',
        'Optional extras available'
      ],
      exclusions: [
        'Pre-existing faults are not covered'
      ],
      ...getPricingForDuration('12months'),
      isPopular: false,
      isBestValue: false
    },
    {
      id: '24months',
      title: '⭐️ 2-Year Cover — Save £100 Today',
      subtitle: 'Most Popular',
      description: 'Balanced Protection and Value',
      planTitle: 'Platinum Comprehensive Plan',
      features: [
        '*All mechanical & electrical parts',
        'Unlimited claims',
        'Labour costs included',
        'Fault diagnostics',
        'MOT test fee cover',
        'Vehicle recovery claim-back',
        'Consequential damage cover',
        'Fast claims process',
        '14-day money-back guarantee',
        'Optional extras available'
      ],
      exclusions: [
        'Pre-existing faults are not covered'
      ],
      ...getPricingForDuration('24months'),
      originalPrice: getPricingForDuration('24months').totalPrice + 100, // Show original price before discount
      isPopular: true,
      isBestValue: false
    },
    {
      id: '36months',
      title: '🏆 3-Year Cover — Save £200 Today',
      subtitle: 'Best Value',
      description: 'Extended cover for longer peace of mind',
      planTitle: 'Platinum Comprehensive Plan',
      features: [
        '*All mechanical & electrical parts',
        'Unlimited claims',
        'Labour costs included',
        'Fault diagnostics',
        'Vehicle recovery claim-back',
        'MOT test fee cover',
        'Europe repair cover',
        '',
        '',
        'Vehicle rental cover',
        '',
        'Consequential damage cover',
        'Fast claims process',
        '14-day money-back guarantee',
        'Optional extras available – tailor your cover to suit your needs'
      ],
      exclusions: [
        'Pre-existing faults are not covered –'
      ],
      ...getPricingForDuration('36months'),
      originalPrice: getPricingForDuration('36months').totalPrice + 200, // Show original price before discount
      isPopular: false,
      isBestValue: true
    }
  ];

  const handleContinue = () => {
    onNext(selectedPaymentType);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <div className="bg-[#e8f4fb] min-h-screen py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Warranty Duration</h1>
          <p className="text-gray-600">Select the coverage period that works best for you</p>
        </div>

        {/* Vehicle Info Banner */}
        <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1 text-center">
              <span className="font-semibold">{vehicleData.regNumber}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{vehicleData.make} {vehicleData.model}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{vehicleData.year}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{planName}</span>
            </div>
          </div>
        </div>

        {/* Duration Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Choose Warranty Duration and Price
            </h3>
          </div>

          {/* Complete Protection Button */}
          <div className="mb-6">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors duration-200 font-medium">
              <span>Complete Protection</span>
              <div className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                i
              </div>
              <span className="text-sm">What's Included?</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {durationOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedPaymentType(option.id)}
                 className={`relative p-4 sm:p-6 rounded-lg transition-all duration-200 text-left w-full cursor-pointer ${
                   selectedPaymentType === option.id 
                     ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                     : 'bg-white border border-gray-200 shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                 }`}
               >
                 {/* Save Percentage Ribbon */}
                 {(option.id === '24months' || option.id === '36months') && (
                   <div className="absolute top-2 right-2 bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                     {option.id === '24months' ? 'Save £100 today' : 'Save £200 Today'}
                   </div>
                 )}

                {/* Badge Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {option.isPopular && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  )}
                  {option.isBestValue && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <div className="mb-4">
                  <h4 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                    {option.title.split(' — ')[0]}
                  </h4>
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">{option.planTitle}</h5>
                  <p className="text-xs text-gray-600 mb-3">What's included:</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  {(expandedCards[option.id] ? option.features : option.features.slice(0, 10)).map((feature, index) => (
                    feature ? (
                      <div key={index} className="flex items-start text-xs text-gray-600">
                        <span className="mr-2 mt-0.5 text-green-500 font-bold">✓</span>
                        <span>{feature}</span>
                      </div>
                    ) : (
                      <div key={index} className="h-3"></div>
                    )
                  ))}
                  {option.features.filter(f => f).length > 10 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCardExpansion(option.id);
                      }}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium cursor-pointer transition-colors duration-200 flex items-center gap-1"
                    >
                      {expandedCards[option.id] 
                        ? `Show less`
                        : `+${option.features.filter(f => f).length - 10} more benefits`
                      }
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedCards[option.id] ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {option.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-start text-xs text-gray-600">
                      <span className="mr-2 mt-0.5 text-red-500 font-bold">✗</span>
                      <span>{exclusion}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mt-auto">
                  {option.id === '12months' && (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        £{option.monthlyPrice}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Only 12 easy payments
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Total cost: £{option.totalPrice}
                      </div>
                    </>
                  )}
                  {option.id === '24months' && (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        £{option.monthlyPrice}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Only 12 easy payments
                      </div>
                      <div className="text-sm text-gray-600">
                        Nothing to pay in Year 2
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Total cost: <span className="line-through text-gray-400">£{'originalPrice' in option ? option.originalPrice : option.totalPrice + 100}</span> £{option.totalPrice}
                      </div>
                    </>
                  )}
                  {option.id === '36months' && (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        £{option.monthlyPrice}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        Only 12 easy payments
                      </div>
                      <div className="text-sm text-gray-600">
                        Nothing to pay in Year 2 and Year 3
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Total cost: <span className="line-through text-gray-400">£{'originalPrice' in option ? option.originalPrice : option.totalPrice + 200}</span> £{option.totalPrice}
                      </div>
                    </>
                  )}
                  
                  {/* Select Button */}
                  <div className="mt-4">
                    <Button 
                      className={`w-full ${
                        selectedPaymentType === option.id 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500'
                      }`}
                      onClick={() => setSelectedPaymentType(option.id)}
                    >
                      {selectedPaymentType === option.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center mt-2">
                    *For more info please 'Your Cover, Made Clear' below
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Platinum Plan Section */}
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-8 mb-8 border border-gray-200 shadow-lg">
            <div className="text-center">
              <div className="mb-4">
                <Crown className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Discover everything the Platinum Plan offers and any limitations
                </h3>
                <p className="text-base text-gray-700 mb-2">
                  Click here for complete details and peace of mind
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Wondering if we actually pay out? Fair question — and the answer is yes. We genuinely value our customers, and when something goes wrong, we look for reasons to say Yes, not excuses to say no.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="/Platinum-warranty-plan_v2.2-5.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-4 h-4" />
                  View Full Platinum Plan Details
                </a>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Complete coverage breakdown</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>All terms & conditions</span>
                </div>
              </div>
            </div>
          </div>

          {/* One Last Thing Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              One last thing before we take your payment...
            </h3>
            
            <p className="text-gray-700 mb-6">
              By submitting this payment and checking the box in this section, I agree to the terms and conditions, fare rules applicable to my booking and general conditions of carriage.
            </p>

            <div className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-orange-500 hover:text-orange-600 font-medium py-3">
                  <span>Terms and conditions</span>
                  <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-gray-900 text-sm">
                  <p>Complete terms and conditions for your warranty coverage, including coverage details, claim procedures, and policy limitations.</p>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-orange-500 hover:text-orange-600 font-medium py-3">
                  <span>Fare rules</span>
                  <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-gray-900 text-sm">
                  <p>Pricing structure, payment terms, and billing information for your selected warranty plan.</p>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-orange-500 hover:text-orange-600 font-medium py-3">
                  <span>General conditions of carriage</span>
                  <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 text-gray-900 text-sm">
                  <p>Standard terms that apply to the provision of warranty services and customer obligations.</p>
                </CollapsibleContent>
              </Collapsible>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-900 mb-4">
                  I agree that the personal data, which has been provided in connection with this booking, may be passed to government authorities for border control and aviation security purposes.
                </p>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-orange-500 hover:text-orange-600 font-medium py-3">
                    <span>Government access to booking records</span>
                    <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 text-gray-900 text-sm">
                    <p>Information about how your personal data may be shared with relevant authorities as required by law.</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-900 mb-4">
                  I agree that I have read and understood the forbidden articles and substances list.
                </p>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left text-orange-500 hover:text-orange-600 font-medium py-3">
                    <span>Forbidden articles and substances list</span>
                    <ChevronDown className="w-4 h-4 text-orange-500 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 text-gray-900 text-sm">
                    <p>List of prohibited items and substances that are not covered under the warranty policy.</p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button 
              onClick={handleContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-4 text-lg rounded-lg"
            >
              Continue to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyDurationStep;