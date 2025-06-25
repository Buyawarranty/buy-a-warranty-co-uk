
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Circle } from 'lucide-react';
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
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData }) => {
  const [paymentType, setPaymentType] = useState<'monthly' | 'full'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'essentials',
      name: 'Essentials',
      monthlyPrice: 67.30,
      deposit: 99,
      fullPrice: 699,
      color: 'from-green-500 to-emerald-600',
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
      color: 'from-blue-500 to-indigo-600',
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
      color: 'from-purple-500 to-pink-600',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Your Warranty Quote
          </h1>
          <p className="text-gray-600 mb-2">
            For vehicle: <span className="font-mono font-semibold text-blue-600">{vehicleData.regNumber}</span>
          </p>
          <p className="text-sm text-gray-500">
            Mileage: {parseInt(vehicleData.mileage).toLocaleString()} miles
          </p>
        </div>

        {/* Payment Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-r ${plan.color} text-white ${plan.popular ? 'pt-8' : ''}`}>
                <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                <div className="text-center">
                  {paymentType === 'monthly' ? (
                    <div>
                      <div className="text-4xl font-bold">£{plan.monthlyPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">per month</div>
                      <div className="text-sm opacity-75">+ £{plan.deposit} deposit</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold">£{plan.fullPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">one-time payment</div>
                      <div className="text-xs opacity-75 line-through">£{(plan.monthlyPrice * 12 + plan.deposit).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.addOns && plan.addOns.length > 0 && (
                  <div className="border-t pt-4 mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Available Add-ons:</h4>
                    {plan.addOns.map((addon, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{addon.name}</span>
                        <span>+£{addon.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-semibold"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">✓ Approved by financial authorities ✓ 30-day money-back guarantee ✓ UK-based customer support</p>
          <p>All prices include VAT. Terms and conditions apply.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;
