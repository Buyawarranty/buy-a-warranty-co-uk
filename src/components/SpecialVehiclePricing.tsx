
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpecialVehiclePricingProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
    fullName: string;
    address: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    vehicleType: 'EV' | 'PHEV' | 'MOTORBIKE';
  };
  onBack: () => void;
}

interface SpecialPlan {
  id: string;
  vehicle_type: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  two_yearly_price: number;
  three_yearly_price: number;
  coverage: string[];
}

const SpecialVehiclePricing: React.FC<SpecialVehiclePricingProps> = ({ vehicleData, onBack }) => {
  const [plan, setPlan] = useState<SpecialPlan | null>(null);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'twoYear' | 'threeYear'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialPlan();
  }, [vehicleData.vehicleType]);

  const fetchSpecialPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .eq('vehicle_type', vehicleData.vehicleType)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error('Error fetching special plan:', error);
      toast.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (!plan) return 0;
    switch (paymentType) {
      case 'monthly': return plan.monthly_price;
      case 'yearly': return plan.yearly_price;
      case 'twoYear': return plan.two_yearly_price;
      case 'threeYear': return plan.three_yearly_price;
      default: return plan.monthly_price;
    }
  };

  const getPeriodText = () => {
    switch (paymentType) {
      case 'monthly': return '/month';
      case 'yearly': return '/year';
      case 'twoYear': return '/2 years';
      case 'threeYear': return '/3 years';
      default: return '/month';
    }
  };

  const getVehicleTypeTitle = () => {
    switch (vehicleData.vehicleType) {
      case 'EV': return 'Electric Vehicle (EV)';
      case 'PHEV': return 'Plug-in Hybrid Electric Vehicle (PHEV)';
      case 'MOTORBIKE': return 'Motorbike';
      default: return vehicleData.vehicleType;
    }
  };

  const handleGetQuote = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: vehicleData.vehicleType.toLowerCase(),
          paymentType: paymentType,
          vehicleData: vehicleData,
          isSpecialVehicle: true
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8f4fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224380] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#e8f4fb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Plan not available for this vehicle type</p>
          <button
            onClick={onBack}
            className="bg-[#224380] text-white px-6 py-2 rounded-lg hover:bg-[#1a3660]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f4fb]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-[#224380] hover:text-[#1a3660] mb-4 flex items-center"
          >
            ← Back to vehicle details
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {getVehicleTypeTitle()} Extended Warranty
            </h1>
            <p className="text-gray-600">
              {vehicleData.make} {vehicleData.model} • {vehicleData.regNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-[#eb4b00]">
          <div className="bg-gradient-to-r from-[#eb4b00] to-[#ff6b1a] text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="text-4xl font-bold">
              £{getPrice()}{getPeriodText()}
            </div>
          </div>

          <div className="p-8">
            {/* Payment Type Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose your payment plan:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'monthly', label: 'Monthly', price: plan.monthly_price, period: '/month' },
                  { key: 'yearly', label: 'Yearly', price: plan.yearly_price, period: '/year' },
                  { key: 'twoYear', label: '2 Years', price: plan.two_yearly_price, period: '/2 years' },
                  { key: 'threeYear', label: '3 Years', price: plan.three_yearly_price, period: '/3 years' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setPaymentType(option.key as any)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      paymentType === option.key
                        ? 'border-[#eb4b00] bg-orange-50 text-[#eb4b00]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm">£{option.price}{option.period}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">What's covered:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.coverage.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Get Quote Button */}
            <div className="text-center">
              <button
                onClick={handleGetQuote}
                className="bg-[#eb4b00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#d63d00] transition-colors w-full md:w-auto"
              >
                Get Your Quote - £{getPrice()}{getPeriodText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialVehiclePricing;
