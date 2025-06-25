
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
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

  const plans = [
    {
      id: 'basic',
      name: 'Basic Extended Warranty',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
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
      color: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-200',
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
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
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
        <div className="mb-6 px-4 pt-8">
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
        <div className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Warranty Quote
          </h1>
          
          {/* Vehicle Registration Plate Display - matching step 1 design */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-full max-w-[520px] mx-auto flex items-center bg-[#ffdb00] text-gray-900 font-bold text-[28px] px-[25px] py-[18px] rounded-[6px] shadow-sm leading-tight border-2 border-black"
            >
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
          
          <p className="text-sm text-gray-500">
            Mileage: {parseInt(vehicleData.mileage).toLocaleString()} miles
          </p>
        </div>

        {/* Contribution Amount Selector */}
        <div className="flex flex-col items-center mb-6 px-4">
          <Label className="text-lg font-semibold mb-4 text-gray-700">
            Select Your Contribution Amount
          </Label>
          <div className="flex flex-wrap justify-center gap-3">
            {[0, 50, 100, 150, 200].map((amount) => (
              <Button
                key={amount}
                variant={contributionAmount === amount ? "default" : "outline"}
                onClick={() => setContributionAmount(amount)}
                className={`px-6 py-2 ${
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
        <div className="flex items-center justify-center gap-4 mb-8 px-4">
          <Label htmlFor="payment-type" className={paymentType === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
            Pay Monthly
          </Label>
          <Switch
            id="payment-type"
            checked={paymentType === 'yearly'}
            onCheckedChange={(checked) => setPaymentType(checked ? 'yearly' : 'monthly')}
          />
          <Label htmlFor="payment-type" className={paymentType === 'yearly' ? 'font-semibold' : 'text-gray-500'}>
            Pay Yearly <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">Save 10%</Badge>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="w-full px-4 pb-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const pricing = getCurrentPricing();
              const planPricing = pricing[plan.id as keyof PricingData];
              const currentPrice = paymentType === 'monthly' ? planPricing.monthly : planPricing.yearly;
              const savings = calculateSavings(planPricing.monthly, planPricing.yearly);
              
              return (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.borderColor} border-2 ${plan.popular ? 'scale-105 shadow-lg' : 'shadow-md'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                      Most Popular
                    </div>
                  )}
                  
                  {/* Header with gradient */}
                  <CardHeader className={`bg-gradient-to-r ${plan.color} text-white text-center py-6`}>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-1">
                      £{currentPrice}
                    </div>
                    <div className="text-sm opacity-90 mb-2">
                      per {paymentType}
                    </div>
                    {paymentType === 'yearly' && (
                      <div className="text-sm bg-white/20 rounded-full px-3 py-1 inline-block">
                        Save £{savings} (10% discount)
                      </div>
                    )}
                  </CardHeader>

                  {/* Features */}
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">✅ What's Covered:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">➕ Optional Add-ons – £25.00 per item:</h4>
                      <div className="space-y-1">
                        {plan.addOns.map((addon, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {addon}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Button */}
                    <Button 
                      className={`w-full ${plan.buttonColor} text-white font-bold py-3`}
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
        <div className="text-center text-sm text-gray-500 px-4 pb-8">
          <p className="mb-2">✓ Approved by financial authorities ✓ 30-day money-back guarantee ✓ UK-based customer support</p>
          <p>All prices include VAT. Terms and conditions apply.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;
