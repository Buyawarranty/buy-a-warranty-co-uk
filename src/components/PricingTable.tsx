
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
      return Math.round((25 * addOnCount) / 12 * 100) / 100; // £25 per year divided by 12 months
    }
    return 25 * addOnCount; // £25 per year
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
      name: 'Basic Extended Warranty',
      color: '#0e3e87',
      bgGradient: 'from-[#0e3e87] to-[#1a4ba3]',
      borderColor: 'border-[#0e3e87]',
      buttonColor: 'bg-[#0e3e87] hover:bg-[#0d3675]',
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
      name: 'Gold Extended Warranty',
      color: '#f59e0b',
      bgGradient: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-400',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
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
      name: 'Platinum Extended Warranty',
      color: '#dc4f20',
      bgGradient: 'from-[#dc4f20] to-[#c44018]',
      borderColor: 'border-[#dc4f20]',
      buttonColor: 'bg-[#dc4f20] hover:bg-[#c44018]',
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

  return (
    <div className="min-h-screen bg-[#e8f4fb] w-full">
      <div className="w-full">
        {/* Back Button */}
        <div className="mb-6 px-6 pt-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contact Details
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 px-6">
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
          
          <p className="text-lg text-gray-600 mb-8">
            Mileage: {parseInt(vehicleData.mileage).toLocaleString()} miles
          </p>
        </div>

        {/* Contribution Amount Selector */}
        <div className="flex flex-col items-center mb-8 px-6">
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

        {/* Payment Toggle - Larger and more prominent */}
        <div className="flex items-center justify-center mb-12 px-6">
          <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-200">
            <div className="flex items-center gap-6 px-6 py-3">
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
                className="scale-125"
              />
              <Label 
                htmlFor="payment-type" 
                className={`text-lg font-semibold cursor-pointer ${paymentType === 'yearly' ? 'text-[#224380]' : 'text-gray-500'}`}
              >
                Pay Yearly 
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 font-bold">
                  Save 10%
                </Badge>
              </Label>
            </div>
          </div>
        </div>

        {/* Pricing Cards - Full Width */}
        <div className="w-full px-6 pb-12">
          <div className="grid lg:grid-cols-3 gap-8 max-w-none">
            {plans.map((plan) => {
              const pricing = getCurrentPricing();
              const planPricing = pricing[plan.id as keyof PricingData];
              const basePrice = paymentType === 'monthly' ? planPricing.monthly : planPricing.yearly;
              const addOnPrice = calculateAddOnPrice(plan.id);
              const totalPrice = basePrice + addOnPrice;
              const savings = calculateSavings(planPricing.monthly, planPricing.yearly);
              
              return (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.borderColor} border-2 ${plan.popular ? 'scale-105 shadow-2xl ring-4 ring-yellow-300' : 'shadow-xl'} bg-white`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  {/* Header with brand colors */}
                  <CardHeader className={`bg-gradient-to-r ${plan.bgGradient} text-white text-center py-8`}>
                    <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                    <div className="text-sm opacity-90 mb-2">From</div>
                    <div className="text-4xl font-bold mb-2">
                      £{totalPrice}
                    </div>
                    <div className="text-lg opacity-90 mb-3">
                      per {paymentType}
                    </div>
                    {paymentType === 'yearly' && (
                      <div className="text-sm bg-white/20 rounded-full px-4 py-2 inline-block">
                        Save £{savings} (10% discount)
                      </div>
                    )}
                  </CardHeader>

                  {/* Features */}
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-800">What's Covered:</h4>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add-ons with interactive selection */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-6 h-6 text-blue-500" />
                        <h4 className="text-xl font-bold text-gray-800">Optional Add-ons – £25.00 per item per year:</h4>
                      </div>
                      <div className="space-y-3 mb-4">
                        {plan.addOns.map((addon, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-700">{addon}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAddOns(plan.id, -1)}
                                disabled={selectedAddOns[plan.id] === 0}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {selectedAddOns[plan.id]}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAddOns(plan.id, 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAddOns[plan.id] > 0 && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          Add-ons total: £{addOnPrice.toFixed(2)} per {paymentType}
                        </div>
                      )}
                    </div>

                    {/* Select Button */}
                    <Button 
                      className={`w-full ${plan.buttonColor} text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200`}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Select {plan.name.split(' ')[0]}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-gray-500 px-6 pb-8">
          <div className="flex items-center justify-center gap-8 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Approved by financial authorities</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>UK-based customer support</span>
            </div>
          </div>
          <p className="text-sm">All prices include VAT. Terms and conditions apply.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;
