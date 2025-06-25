
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: number}>({
    basic: 0,
    gold: 0,
    platinum: 0
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

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12;
    return monthlyTotal - yearly;
  };

  const calculateAddOnPrice = (planId: string) => {
    const addOnCount = selectedAddOns[planId];
    if (paymentType === 'monthly') {
      return Math.round((25 * addOnCount) / 12 * 100) / 100;
    }
    return 25 * addOnCount;
  };

  const updateAddOns = (planId: string, change: number) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planId]: Math.max(0, prev[planId] + change)
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

      {/* Pricing Table */}
      <div className="w-full px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-7xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-gray-50 border-b">
            <div className="p-6 font-bold text-gray-700 text-lg">Features</div>
            {plans.map((plan) => {
              const pricing = getCurrentPricing();
              const planPricing = pricing[plan.id as keyof PricingData];
              const basePrice = paymentType === 'monthly' ? planPricing.monthly : planPricing.yearly;
              const addOnPrice = calculateAddOnPrice(plan.id);
              const totalPrice = basePrice + addOnPrice;
              
              return (
                <div key={plan.id} className="p-6 text-center relative">
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-2">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: plan.color }}>
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      £{totalPrice}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {paymentType}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Features */}
          {allFeatures.map((feature, index) => (
            <div key={index} className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="p-4 font-medium text-gray-700">{feature}</div>
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 text-center">
                  {plan.features.includes(feature) ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <div className="w-5 h-5 mx-auto"></div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Add-ons Section */}
          <div className="bg-blue-50 border-b">
            <div className="grid grid-cols-4">
              <div className="p-4 font-bold text-gray-800">
                Optional Add-ons (£25/year each)
              </div>
              <div className="p-4"></div>
              <div className="p-4"></div>
              <div className="p-4"></div>
            </div>
          </div>

          {allAddOns.map((addon, index) => (
            <div key={index} className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="p-4 font-medium text-gray-700">{addon}</div>
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 text-center">
                  {plan.addOns.includes(addon) ? (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAddOns(plan.id, -1)}
                        disabled={selectedAddOns[plan.id] === 0}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">
                        {selectedAddOns[plan.id]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAddOns(plan.id, 1)}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="grid grid-cols-4 bg-gray-50">
            <div className="p-6"></div>
            {plans.map((plan) => (
              <div key={plan.id} className="p-6 text-center">
                <Button 
                  className="w-full text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{ backgroundColor: plan.color }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Select {plan.name}
                </Button>
              </div>
            ))}
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
