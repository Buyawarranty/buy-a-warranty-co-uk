
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PricingData {
  basic: { monthly: number; yearly: number; };
  gold: { monthly: number; yearly: number; };
  platinum: { monthly: number; yearly: number; };
}

interface PricingTableProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email?: string;
    phone?: string;
  };
  onBack: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack }) => {
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly'>('monthly');
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {[addon: string]: boolean}}>({
    basic: {},
    gold: {},
    platinum: {}
  });

  // Pricing data based on your Excel sheet
  const pricingData: Record<number, PricingData> = {
    0: {
      basic: { monthly: 31, yearly: 381 },
      gold: { monthly: 34, yearly: 409 },
      platinum: { monthly: 36, yearly: 437 }
    },
    50: {
      basic: { monthly: 29, yearly: 350 },
      gold: { monthly: 31, yearly: 377 },
      platinum: { monthly: 32, yearly: 396 }
    },
    100: {
      basic: { monthly: 25, yearly: 308 },
      gold: { monthly: 27, yearly: 336 },
      platinum: { monthly: 29, yearly: 354 }
    },
    150: {
      basic: { monthly: 23, yearly: 287 },
      gold: { monthly: 26, yearly: 315 },
      platinum: { monthly: 27, yearly: 333 }
    },
    200: {
      basic: { monthly: 23, yearly: 287 },
      gold: { monthly: 26, yearly: 315 },
      platinum: { monthly: 27, yearly: 333 }
    }
  };

  const getCurrentPricing = () => pricingData[contributionAmount];

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId]).filter(Boolean).length;
    if (paymentType === 'monthly') {
      return Math.round((25 * selectedAddOnCount) / 12 * 100) / 100;
    }
    return 25 * selectedAddOnCount;
  };

  const toggleAddOn = (planId: string, addon: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [addon]: !prev[planId][addon]
      }
    }));
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      color: '#0e3e87',
      features: [
        'Mechanical Breakdown Protection',
        'Labour up to £35 p/hr',
        '10 Claims per year',
        'Engine',
        'Manual Gearbox',
        'Automatic Transmission',
        'Torque Convertor',
        'Overdrive',
        'Differential',
        'Electrics',
        'Casings',
        'Recovery'
      ],
      addOns: ['Power Hood', 'ECU', 'Air Conditioning', 'Turbo']
    },
    {
      id: 'gold',
      name: 'Gold',
      color: '#f59e0b',
      popular: true,
      features: [
        'Mechanical & Electrical Breakdown Warranty',
        'Labour up to £75 p/hr',
        'Halfords MOT test',
        'Unlimited Claims',
        'Engine',
        'Manual Gearbox',
        'Automatic Transmission',
        'Overdrive',
        'Clutch',
        'Differential',
        'Torque Converter',
        'Cooling System',
        'Fuel System',
        'Electricals',
        'Braking System',
        'Propshaft',
        'Casings',
        'Vehicle Hire',
        'Recovery',
        'European Cover'
      ],
      addOns: ['Power Hood', 'ECU', 'Air Conditioning', 'Turbo']
    },
    {
      id: 'platinum',
      name: 'Platinum',
      color: '#dc4f20',
      features: [
        'Mechanical & Electrical Breakdown',
        'Labour up to £100 p/hr',
        'Halfords MOT test',
        'Unlimited Claims',
        'Engine',
        'Turbo Unit',
        'Manual Gearbox',
        'Automatic Transmission',
        'Clutch',
        'Differential',
        'Drive Shafts',
        'Brakes',
        'Steering',
        'Suspension',
        'Bearings',
        'Cooling System',
        'Ventilation',
        'E.C.U.',
        'Electrics',
        'Fuel System',
        'Air Conditioning',
        'Locks',
        'Seals',
        'Casings',
        'Vehicle Hire',
        'Vehicle Recovery',
        'European Cover'
      ],
      addOns: ['Power Hood']
    }
  ];

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId, 'for vehicle:', vehicleData.regNumber);
  };

  const allFeatures = Array.from(new Set(plans.flatMap(plan => plan.features)));
  const allAddOns = Array.from(new Set(plans.flatMap(plan => plan.addOns)));

  return (
    <div className="min-h-screen bg-[#e8f4fb] w-full">
      {/* Back Button */}
      <div className="mb-8 px-8 pt-8">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-white text-lg px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Contact Details
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Your Warranty Quote
        </h1>
        
        {/* Vehicle Registration Plate Display */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-[520px] mx-auto flex items-center bg-[#ffdb00] text-gray-900 font-bold text-[28px] px-[25px] py-[18px] rounded-[6px] shadow-sm leading-tight border-2 border-black">
            <img 
              src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
              alt="GB Flag" 
              className="w-[35px] h-[25px] mr-[15px] object-cover rounded-[2px]"
            />
            <div className="flex-1 text-center font-bold font-sans tracking-normal">
              {vehicleData.regNumber || 'H12 FXL'}
            </div>
          </div>
        </div>
        
        <p className="text-xl text-gray-600 mb-8">
          Mileage: {parseInt(vehicleData.mileage).toLocaleString()} miles
        </p>
      </div>

      {/* Contribution Amount Selector */}
      <div className="flex flex-col items-center mb-8 px-8">
        <Label className="text-xl font-semibold mb-6 text-gray-700">
          Select Your Contribution Amount
        </Label>
        <div className="flex flex-wrap justify-center gap-4">
          {[0, 50, 100, 150, 200].map((amount) => (
            <Button
              key={amount}
              variant={contributionAmount === amount ? "default" : "outline"}
              onClick={() => setContributionAmount(amount)}
              className={`px-8 py-3 text-lg font-semibold ${
                contributionAmount === amount 
                  ? 'bg-[#224380] hover:bg-[#1a3460]' 
                  : 'border-[#224380] text-[#224380] hover:bg-[#f0f8ff]'
              }`}
            >
              £{amount}
            </Button>
          ))}
        </div>
      </div>

      {/* Payment Toggle */}
      <div className="flex items-center justify-center mb-8 px-8">
        <div className="bg-white rounded-full p-4 shadow-lg border-2 border-gray-200">
          <div className="flex items-center gap-8 px-8 py-4">
            <Label 
              htmlFor="payment-type" 
              className={`text-lg font-semibold cursor-pointer ${paymentType === 'monthly' ? 'text-[#224380]' : 'text-gray-500'}`}
            >
              Pay Monthly
            </Label>
            <Switch
              id="payment-type"
              checked={paymentType === 'yearly'}
              onCheckedChange={(checked) => setPaymentType(checked ? 'yearly' : 'monthly')}
              className="scale-150"
            />
            <Label 
              htmlFor="payment-type" 
              className={`text-lg font-semibold cursor-pointer ${paymentType === 'yearly' ? 'text-[#224380]' : 'text-gray-500'}`}
            >
              Pay Yearly 
              <Badge variant="secondary" className="ml-3 bg-green-100 text-green-800 font-bold text-sm px-3 py-1">
                Save 10%
              </Badge>
            </Label>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="w-full px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const pricing = getCurrentPricing();
              const planPricing = pricing[plan.id as keyof PricingData];
              const basePrice = paymentType === 'monthly' ? planPricing.monthly : planPricing.yearly;
              const addOnPrice = calculateAddOnPrice(plan.id);
              const totalPrice = basePrice + addOnPrice;
              const savings = paymentType === 'yearly' ? (planPricing.monthly * 12) - planPricing.yearly : 0;
              
              return (
                <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden relative border-2 ${plan.popular ? 'border-orange-400 shadow-xl' : 'border-gray-200'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold z-10">
                      MOST POPULAR
                    </div>
                  )}
                  
                  {/* Plan Header */}
                  <div className="p-8 text-center bg-gray-50 border-b">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: plan.color }}>
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">£</span>
                      <span className="text-5xl font-bold text-gray-900">{totalPrice}</span>
                      <div className="text-gray-600 text-lg">/{paymentType}</div>
                    </div>
                    {savings > 0 && (
                      <div className="text-green-600 font-semibold text-sm">
                        £{savings} Saving
                      </div>
                    )}
                    <Button 
                      className="w-full mt-6 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ backgroundColor: plan.color }}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Select {plan.name}
                    </Button>
                  </div>

                  {/* Features Section */}
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Core Features</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {allFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {plan.features.includes(feature) ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${plan.features.includes(feature) ? 'text-gray-700' : 'text-gray-400'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add-ons Section */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-bold text-gray-800 mb-4">Optional Add-ons <span className="text-sm font-normal text-gray-600">(£25/year each)</span></h4>
                      <div className="space-y-3">
                        {allAddOns.map((addon, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {plan.addOns.includes(addon) ? (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedAddOns[plan.id][addon] || false}
                                  onCheckedChange={() => toggleAddOn(plan.id, addon)}
                                />
                                <span className="text-sm text-gray-700">{addon}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
                                <span className="text-sm text-gray-400">{addon}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="text-center text-gray-500 px-8 pb-12">
        <div className="flex items-center justify-center gap-8 mb-4 text-base flex-wrap">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Approved by financial authorities</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>UK-based customer support</span>
          </div>
        </div>
        <p className="text-base">All prices include VAT. Terms and conditions apply.</p>
      </div>
    </div>
  );
};

export default PricingTable;
