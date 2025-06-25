import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  deposit: number;
  fullPrice: number;
  color: string;
  popular?: boolean;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
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
  const [paymentType, setPaymentType] = useState<'monthly' | 'full'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'essentials',
      name: 'Essentials',
      monthlyPrice: 67.30,
      deposit: 99,
      fullPrice: 699,
      color: 'bg-gray-500',
      features: [
        { name: 'Engine & Gearbox', included: true },
        { name: 'Cooling System', included: true },
        { name: 'Fuel System', included: true },
        { name: 'Electrical Components', included: false },
        { name: 'Air Conditioning', included: false },
        { name: 'Turbo/Supercharger', included: false },
        { name: 'Hybrid Components', included: false },
      ],
      addOns: [
        { name: "Driver's Legal Protection", price: 15 },
      ]
    },
    {
      id: 'classic',
      name: 'Classic',
      monthlyPrice: 69.80,
      deposit: 109,
      fullPrice: 799,
      color: 'bg-blue-500',
      popular: true,
      features: [
        { name: 'Engine & Gearbox', included: true },
        { name: 'Cooling System', included: true },
        { name: 'Fuel System', included: true },
        { name: 'Electrical Components', included: true },
        { name: 'Air Conditioning', included: true },
        { name: 'Turbo/Supercharger', included: false },
        { name: 'Hybrid Components', included: false },
      ],
      addOns: [
        { name: "Driver's Legal Protection", price: 15 },
        { name: 'Key Care Cover', price: 25 },
      ]
    },
    {
      id: 'premier',
      name: 'Premier',
      monthlyPrice: 166.09,
      deposit: 199,
      fullPrice: 1899,
      color: 'bg-green-600',
      features: [
        { name: 'Engine & Gearbox', included: true },
        { name: 'Cooling System', included: true },
        { name: 'Fuel System', included: true },
        { name: 'Electrical Components', included: true },
        { name: 'Air Conditioning', included: true },
        { name: 'Turbo/Supercharger', included: true },
        { name: 'Hybrid Components', included: true },
      ],
      addOns: [
        { name: "Driver's Legal Protection", price: 15 },
        { name: 'Key Care Cover', price: 25 },
        { name: 'Extended Roadside Assistance', price: 35 },
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId, 'for vehicle:', vehicleData.regNumber);
    // This would integrate with the Warranties 2000 API
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

        {/* Payment Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8 px-4">
          <Label htmlFor="payment-type" className={paymentType === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
            Pay Monthly
          </Label>
          <Switch
            id="payment-type"
            checked={paymentType === 'full'}
            onCheckedChange={(checked) => setPaymentType(checked ? 'full' : 'monthly')}
          />
          <Label htmlFor="payment-type" className={paymentType === 'full' ? 'font-semibold' : 'text-gray-500'}>
            Pay in Full <Badge variant="secondary" className="ml-1">Save 15%</Badge>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="w-full px-4">
          <div className="grid lg:grid-cols-3 md:grid-cols-1 grid-cols-1 gap-8 max-w-6xl mx-auto mb-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative ${plan.popular ? 'transform scale-105' : ''}`}>
                {/* Card Header with Price */}
                <div className={`${plan.color} text-white text-center py-6 rounded-t-lg relative`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Selected
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  {paymentType === 'monthly' ? (
                    <div>
                      <div className="text-3xl font-bold">£{plan.monthlyPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">per month</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold">£{plan.fullPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">one-time payment</div>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="bg-white border-l-2 border-r-2 border-gray-200">
                  <div className="p-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-700">{feature.name}</span>
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Price and Button */}
                <div className={`${plan.color} text-white text-center py-4 rounded-b-lg`}>
                  <div className="text-2xl font-bold mb-2">
                    £{paymentType === 'monthly' ? plan.monthlyPrice.toFixed(2) : plan.fullPrice.toFixed(2)}
                  </div>
                  <div className="text-sm opacity-90 mb-4">
                    {paymentType === 'monthly' ? 'per month' : 'one-time payment'}
                  </div>
                  <Button 
                    className={`w-32 ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white text-gray-800 hover:bg-gray-100'} font-bold`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.popular ? 'Selected' : plan.id === 'premier' ? 'Upgrade' : 'Select'}
                  </Button>
                  {plan.id === 'premier' && (
                    <div className="mt-2 text-xs opacity-75">
                      Upgrade for just £96.29 per month
                    </div>
                  )}
                </div>
              </div>
            ))}
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
