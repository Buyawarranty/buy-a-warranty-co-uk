import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import TrustpilotHeader from '@/components/TrustpilotHeader';

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
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'two_yearly' | 'three_yearly'>('monthly');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();

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

      if (data) {
        setPlan({
          ...data,
          coverage: Array.isArray(data.coverage) ? data.coverage.map(item => String(item)) : []
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

  const getBasePrice = () => {
    if (!plan) return 0;
    
    switch (paymentType) {
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

  const calculatePlanPrice = () => {
    const basePrice = getBasePrice();
    // Apply voluntary excess discount
    const excessDiscount = voluntaryExcess * 0.01; // 1% discount per £1 excess
    return Math.max(basePrice * (1 - excessDiscount), basePrice * 0.7); // Min 30% of base price
  };

  const handlePurchase = async () => {
    if (!plan) return;
    
    setCheckoutLoading(true);
    
    try {
      const totalPrice = calculatePlanPrice();

      const checkoutData = {
        planId: plan.id,
        planName: plan.name,
        paymentType,
        totalPrice,
        voluntaryExcess,
        vehicleData,
        isSpecialVehicle: true,
        vehicleType: vehicleData.vehicleType
      };

      // For monthly payments, try Bumper first
      if (paymentType === 'monthly') {
        const { data: bumperData, error: bumperError } = await supabase.functions.invoke('create-bumper-checkout', {
          body: checkoutData
        });

        if (bumperError || bumperData?.fallbackToStripe) {
          // Fallback to Stripe
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
            body: checkoutData
          });

          if (stripeError) throw stripeError;
          if (stripeData?.url) window.open(stripeData.url, '_blank');
        } else if (bumperData?.url) {
          window.open(bumperData.url, '_blank');
        }
      } else {
        // Use Stripe for non-monthly payments
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: checkoutData
        });

        if (error) throw error;
        if (data?.url) window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getPaymentLabel = () => {
    switch (paymentType) {
      case 'yearly': return 'per year';
      case 'two_yearly': return 'for 2 years';
      case 'three_yearly': return 'for 3 years';
      default: return 'per month';
    }
  };

  const getVehicleTypeTitle = () => {
    switch (vehicleData.vehicleType) {
      case 'EV': return 'Electric Vehicle';
      case 'PHEV': return 'PHEV / Hybrid';
      case 'MOTORBIKE': return 'Motorbikes';
      default: return vehicleData.vehicleType;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="text-center">Loading special vehicle plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="mb-4">No special plan found for this vehicle type.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
        {/* Back Button and Trustpilot Header */}
        <div className="mb-4 sm:mb-8 px-4 sm:px-8 pt-4 sm:pt-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Contact Details
          </Button>
          <TrustpilotHeader />
        </div>

        {/* Header with Vehicle Type Image */}
        <div className="text-center mb-6 sm:mb-10 px-4 sm:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {getVehicleTypeTitle()}
          </h1>
          
          {/* Vehicle Registration Display */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-sm sm:text-lg px-3 sm:px-4 py-2 sm:py-3 rounded-[6px] shadow-sm leading-tight border-2 border-black">
              <img 
                src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                alt="GB Flag" 
                className="w-[20px] h-[14px] sm:w-[25px] sm:h-[18px] mr-2 sm:mr-3 object-cover rounded-[2px]"
              />
              <div className="font-bold font-sans tracking-normal">
                {vehicleData.regNumber}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {vehicleData.make && vehicleData.model && (
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border max-w-md mx-auto">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {vehicleData.make} {vehicleData.model}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm sm:text-base text-gray-600">
                {vehicleData.fuelType && <span><strong>Fuel:</strong> {vehicleData.fuelType}</span>}
                {vehicleData.year && <span><strong>Year:</strong> {vehicleData.year}</span>}
                {vehicleData.transmission && <span><strong>Transmission:</strong> {vehicleData.transmission}</span>}
                <span><strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Period Toggle */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white rounded-2xl p-1 shadow-lg border border-gray-200 inline-flex">
            <button
              onClick={() => setPaymentType('yearly')}
              className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                paymentType === 'yearly' 
                  ? 'bg-[#1a365d] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              1 Year
            </button>
            <div className="relative">
              <button
                onClick={() => setPaymentType('two_yearly')}
                className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                  paymentType === 'two_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                2 Years
              </button>
              <div className="absolute -top-2 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-1">
                10% OFF
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setPaymentType('three_yearly')}
                className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                  paymentType === 'three_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                3 Years
              </button>
              <div className="absolute -top-2 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-1">
                20% OFF
              </div>
            </div>
          </div>
        </div>

        {/* Voluntary Excess Selection */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Voluntary Excess Amount</h3>
            <div className="flex justify-center gap-3">
              {[0, 50, 100, 150].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setVoluntaryExcess(amount)}
                  className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 min-w-[80px] ${
                    voluntaryExcess === amount
                      ? 'bg-[#1a365d] text-white border-2 border-[#1a365d]'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#1a365d]'
                  }`}
                >
                  £{amount}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Single Plan Card */}
        <div className="w-full px-4 pb-16">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Card className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-400 shadow-xl">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
                
                {/* Plan Header */}
                <CardHeader className="p-6 text-center bg-gray-50 border-b">
                  <CardTitle className="text-2xl font-bold mb-4 text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">£</span>
                    <span className="text-5xl font-bold text-gray-900">
                      {Math.round(calculatePlanPrice())}
                    </span>
                    <div className="text-gray-600 text-lg">{getPaymentLabel()}</div>
                  </div>
                  {paymentType !== 'monthly' && (
                    <div className="text-sm text-gray-500">
                      12 simple interest-free payments
                    </div>
                  )}
                </CardHeader>

                {/* Plan Content */}
                <CardContent className="p-6 space-y-6">
                  {/* What's Covered */}
                  <div>
                    <h4 className="font-bold text-lg mb-4">What's Covered:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {plan.coverage.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    variant="outline"
                    className="w-full py-4 text-lg font-bold rounded-xl border-2 border-[#f59e0b] text-[#f59e0b] bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    {checkoutLoading ? 'Processing...' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p className="mb-2">From £26 per month</p>
              <p>{getVehicleTypeTitle()} Extended Warranty</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SpecialVehiclePricing;