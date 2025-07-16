import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  two_yearly_price: number | null;
  three_yearly_price: number | null;
  coverage: string[];
  add_ons: string[];
  is_active: boolean;
}

interface PricingTableProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email?: string;
    phone?: string;
    fullName?: string;
    address?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    vehicleType?: string;
  };
  onBack: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack }) => {
  console.log('PricingTable received vehicleData:', vehicleData);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'two_yearly' | 'three_yearly'>('monthly');
  const [voluntaryExcess, setVoluntaryExcess] = useState<{[planId: string]: number}>({});
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});

  useEffect(() => {
    fetchPlans();
    fetchPdfUrls();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price');

      if (error) throw error;

      if (data) {
        setPlans(data.map(plan => ({
          ...plan,
          coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
          add_ons: Array.isArray(plan.add_ons) ? plan.add_ons.map(item => String(item)) : []
        })));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    }
  };

  const fetchPdfUrls = async () => {
    try {
      console.log('Fetching PDF URLs...');
      const { data, error } = await supabase
        .from('customer_documents')
        .select('plan_type, file_url, document_name')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('PDF documents from database:', data);

      if (data) {
        const urlMap: {[planName: string]: string} = {};
        data.forEach(doc => {
          if (!urlMap[doc.plan_type]) {
            urlMap[doc.plan_type] = doc.file_url;
            console.log(`Mapped ${doc.plan_type} to ${doc.file_url}`);
          }
        });
        console.log('Final PDF URL mapping:', urlMap);
        setPdfUrls(urlMap);
      }
    } catch (error) {
      console.error('Error fetching PDF URLs:', error);
    }
  };

  const calculatePlanPrice = (plan: Plan) => {
    let basePrice = 0;
    
    switch (paymentType) {
      case 'yearly':
        basePrice = plan.yearly_price || plan.monthly_price * 12;
        break;
      case 'two_yearly':
        basePrice = plan.two_yearly_price || plan.monthly_price * 24;
        break;
      case 'three_yearly':
        basePrice = plan.three_yearly_price || plan.monthly_price * 36;
        break;
      default:
        basePrice = plan.monthly_price;
    }

    const planExcess = voluntaryExcess[plan.id] || 0;
    const excessDiscount = planExcess * 0.01;
    return Math.max(basePrice * (1 - excessDiscount), basePrice * 0.7);
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    return selectedAddOnCount * 25; // £25 per add-on per year
  };

  const toggleAddOn = (planId: string, addon: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [addon]: !prev[planId]?.[addon]
      }
    }));
  };

  const toggleVoluntaryExcess = (planId: string, amount: number) => {
    setVoluntaryExcess(prev => ({
      ...prev,
      [planId]: amount
    }));
  };

  const handleSelectPlan = async (plan: Plan) => {
    setLoading(prev => ({ ...prev, [plan.id]: true }));
    
    try {
      const basePrice = calculatePlanPrice(plan);
      const addOnPrice = calculateAddOnPrice(plan.id);
      const totalPrice = basePrice + addOnPrice;

      const checkoutData = {
        planId: plan.id,
        planName: plan.name,
        paymentType,
        basePrice,
        addOnPrice,
        totalPrice,
        voluntaryExcess: voluntaryExcess[plan.id] || 0,
        selectedAddOns: selectedAddOns[plan.id] || {},
        vehicleData
      };

      if (paymentType === 'monthly') {
        const { data: bumperData, error: bumperError } = await supabase.functions.invoke('create-bumper-checkout', {
          body: checkoutData
        });

        if (bumperError || bumperData?.fallbackToStripe) {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
            body: checkoutData
          });

          if (stripeError) throw stripeError;
          if (stripeData?.url) window.location.href = stripeData.url;
        } else if (bumperData?.url) {
          window.location.href = bumperData.url;
        }
      } else {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: checkoutData
        });

        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(prev => ({ ...prev, [plan.id]: false }));
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

  return (
    <div className="bg-[#e8f4fb] w-full min-h-screen">
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

      {/* Header with Vehicle Details */}
      <div className="text-center mb-10 px-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your Warranty Quote
        </h1>
        
        {/* Vehicle Registration Display */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-3xl px-6 py-4 rounded-[6px] shadow-sm leading-tight border-2 border-black">
            <img 
              src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
              alt="GB Flag" 
              className="w-[35px] h-[25px] mr-4 object-cover rounded-[2px]"
            />
            <div className="font-bold font-sans tracking-normal">
              {vehicleData.regNumber || 'REG NUM'}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        {vehicleData.make && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 text-base text-gray-700">
              <span className="font-semibold text-gray-900">
                {vehicleData.make} {vehicleData.model || 'Vehicle'}
              </span>
              {vehicleData.fuelType && (
                <span className="text-gray-600">
                  <strong>Fuel:</strong> {vehicleData.fuelType}
                </span>
              )}
              {vehicleData.year && (
                <span className="text-gray-600">
                  <strong>Year:</strong> {vehicleData.year}
                </span>
              )}
              {vehicleData.transmission && (
                <span className="text-gray-600">
                  <strong>Transmission:</strong> {vehicleData.transmission}
                </span>
              )}
              <span className="text-gray-600">
                <strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Period Toggle */}
      <div className="flex justify-center mb-12 px-8">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 w-full max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              onClick={() => setPaymentType('monthly')}
              className={`px-3 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-200 ${
                paymentType === 'monthly' 
                  ? 'bg-[#1a365d] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <div className="relative">
              <button
                onClick={() => setPaymentType('yearly')}
                className={`w-full px-3 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-200 ${
                  paymentType === 'yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                1 Year
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setPaymentType('two_yearly')}
                className={`w-full px-3 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-200 ${
                  paymentType === 'two_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                2 Years
              </button>
              <div className="absolute -top-2 -right-1 sm:-right-2 bg-orange-500 text-white text-xs px-1 sm:px-2 py-1 rounded-full font-bold">
                10% OFF
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setPaymentType('three_yearly')}
                className={`w-full px-3 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-200 ${
                  paymentType === 'three_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                3 Years
              </button>
              <div className="absolute -top-2 -right-1 sm:-right-2 bg-orange-500 text-white text-xs px-1 sm:px-2 py-1 rounded-full font-bold">
                12% OFF
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Container */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const basePrice = calculatePlanPrice(plan);
            const addOnPrice = calculateAddOnPrice(plan.id);
            const totalPrice = basePrice + addOnPrice;
            const isLoading = loading[plan.id];
            const isPopular = plan.name === 'Gold';
            
            return (
              <div key={plan.id} className={`bg-white rounded-lg shadow-lg overflow-hidden relative ${isPopular ? 'border-2 border-yellow-500' : 'border border-gray-200'}`}>
                {isPopular && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white text-xs px-3 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="p-6 text-center">
                  <h3 className={`text-2xl font-bold mb-4 ${
                    plan.name === 'Basic' ? 'text-blue-900' :
                    plan.name === 'Gold' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">£</span>
                    <span className="text-4xl font-bold text-black">
                      {Math.round(totalPrice)}
                    </span>
                  </div>
                  <div className="text-gray-600 text-base mb-2">{getPaymentLabel()}</div>
                  <div className="text-sm text-gray-800 font-semibold">
                    Only 12 easy payments
                  </div>
                </div>

                {/* Select Button */}
                <div className="px-6 mb-6">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                    className={`w-full py-3 text-white font-semibold rounded-lg ${
                      plan.name === 'Basic' ? 'bg-blue-800 hover:bg-blue-900' :
                      plan.name === 'Gold' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      'bg-[#eb4b00] hover:bg-[#d43f00]'
                    } transition-colors duration-200`}
                  >
                    {isLoading ? 'Processing...' : `Select ${plan.name}`}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Login details will be emailed after purchase
                  </p>
                </div>

                {/* What's Covered */}
                <div className="px-6 mb-6">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">What's Covered:</h4>
                  <div className="space-y-2">
                    {plan.coverage.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voluntary Excess */}
                <div className="px-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-bold text-lg text-gray-900">Voluntary Excess</h4>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[0, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => toggleVoluntaryExcess(plan.id, amount)}
                        className={`p-2 rounded border text-sm font-semibold transition-all duration-200 ${
                          (voluntaryExcess[plan.id] || 0) === amount
                            ? 'bg-[#1a365d] text-white border-[#1a365d]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                        }`}
                      >
                        £{amount}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[150, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => toggleVoluntaryExcess(plan.id, amount)}
                        className={`p-2 rounded border text-sm font-semibold transition-all duration-200 ${
                          (voluntaryExcess[plan.id] || 0) === amount
                            ? 'bg-[#1a365d] text-white border-[#1a365d]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                        }`}
                      >
                        £{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Components */}
                <div className="px-6 pb-6">
                  <h4 className="font-bold text-lg mb-2 text-gray-900">
                    Additional Components (Optional Add-ons - £25.00 per item p/year)
                  </h4>
                  <div className="space-y-2">
                    {plan.add_ons.length > 0 ? (
                      plan.add_ons.map((addon, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${plan.id}-${addon}`}
                            checked={selectedAddOns[plan.id]?.[addon] || false}
                            onCheckedChange={() => toggleAddOn(plan.id, addon)}
                          />
                          <label
                            htmlFor={`${plan.id}-${addon}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            {addon}
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Checkbox disabled />
                        <span className="text-sm text-gray-700">Power Hood</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingTable;