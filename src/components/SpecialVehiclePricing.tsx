import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SpecialPlan {
  id: string;
  vehicle_type: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  two_yearly_price: number | null;
  three_yearly_price: number | null;
  coverage: string[];
  is_active: boolean;
}

interface VehicleData {
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
  vehicleType?: string;
}

interface SpecialVehiclePricingProps {
  vehicleData: VehicleData;
  onBack: () => void;
}

const SpecialVehiclePricing: React.FC<SpecialVehiclePricingProps> = ({ vehicleData, onBack }) => {
  const [plan, setPlan] = useState<SpecialPlan | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'monthly' | 'yearly' | 'two_yearly' | 'three_yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpecialPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('special_vehicle_plans')
          .select('*')
          .eq('vehicle_type', vehicleData.vehicleType)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          // Convert JSON coverage to string array
          const coverage = Array.isArray(data.coverage) ? data.coverage : [];
          setPlan({
            ...data,
            coverage: coverage as string[]
          });
        }
      } catch (error) {
        console.error('Error fetching special vehicle plan:', error);
        toast({
          title: "Error",
          description: "Failed to load vehicle plan. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (vehicleData.vehicleType) {
      fetchSpecialPlan();
    }
  }, [vehicleData.vehicleType, toast]);

  const getPrice = () => {
    if (!plan) return 0;
    
    switch (selectedPaymentType) {
      case 'yearly':
        return plan.yearly_price || plan.monthly_price * 12;
      case 'two_yearly':
        return plan.two_yearly_price || plan.monthly_price * 24;
      case 'three_yearly':
        return plan.three_yearly_price || plan.monthly_price * 36;
      default:
        return plan.monthly_price;
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: {
          planType: plan?.name || 'Special Vehicle Plan',
          paymentType: selectedPaymentType,
          price: getPrice(),
          vehicleData: vehicleData,
          isSpecialVehicle: true,
          vehicleType: vehicleData.vehicleType
        }
      });

      if (response.error) throw response.error;

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading special vehicle plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p>No special plan found for this vehicle type.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e8f4fb] min-h-screen py-4 sm:py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          className="mb-4 sm:mb-6 text-[#224380] hover:text-[#1a3460]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to vehicle details
        </Button>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#224380] mb-4">
            {plan.name}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Specialized coverage for your {vehicleData.vehicleType} vehicle
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center bg-[#224380] text-white">
            <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
            <div className="text-2xl sm:text-3xl font-bold">
              £{getPrice()}
              <span className="text-base sm:text-lg font-normal">
                /{selectedPaymentType === 'monthly' ? 'month' : 
                  selectedPaymentType === 'yearly' ? 'year' : 
                  selectedPaymentType === 'two_yearly' ? '2 years' : '3 years'}
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            {/* Payment Type Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Choose payment period:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { key: 'monthly' as const, label: 'Monthly', price: plan.monthly_price },
                  { key: 'yearly' as const, label: 'Yearly', price: plan.yearly_price },
                  { key: 'two_yearly' as const, label: '2 Years', price: plan.two_yearly_price },
                  { key: 'three_yearly' as const, label: '3 Years', price: plan.three_yearly_price }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedPaymentType(option.key)}
                    className={`p-2 sm:p-3 rounded-md border text-xs sm:text-sm font-medium transition-colors ${
                      selectedPaymentType === option.key 
                        ? 'bg-[#224380] text-white border-[#224380]' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#224380]'
                    }`}
                    disabled={!option.price}
                  >
                    {option.label}
                    {option.price && (
                      <div className="text-xs mt-1">£{option.price}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg mb-4 border-b pb-2">What's covered:</h3>
              <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                {plan.coverage.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 mb-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handlePurchase}
              className="w-full mt-6 sm:mt-8 bg-[#eb4b00] hover:bg-[#d43f00] text-white font-bold py-3 sm:py-4 text-base sm:text-lg"
              size="lg"
            >
              Get My {vehicleData.vehicleType} Warranty - £{getPrice()}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpecialVehiclePricing;
