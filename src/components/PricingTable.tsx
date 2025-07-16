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
  const [paymentType, setPaymentType] = useState<'yearly' | 'two_yearly' | 'three_yearly'>('yearly');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(0);
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

  // Pricing data from Excel spreadsheet organized by payment type and excess
  const getPricingData = (excess: number, paymentPeriod: string) => {
    const pricingTable = {
      // 1 Year pricing (Columns D & E)
      yearly: {
        0: { basic: { monthly: 31, total: 372, save: 0 }, gold: { monthly: 34, total: 408, save: 0 }, platinum: { monthly: 36, total: 437, save: 0 } },
        50: { basic: { monthly: 29, total: 348, save: 0 }, gold: { monthly: 31, total: 372, save: 0 }, platinum: { monthly: 32, total: 384, save: 0 } },
        100: { basic: { monthly: 25, total: 300, save: 0 }, gold: { monthly: 27, total: 324, save: 0 }, platinum: { monthly: 29, total: 348, save: 0 } },
        150: { basic: { monthly: 23, total: 276, save: 0 }, gold: { monthly: 26, total: 312, save: 0 }, platinum: { monthly: 27, total: 324, save: 0 } },
        200: { basic: { monthly: 20, total: 240, save: 0 }, gold: { monthly: 23, total: 276, save: 0 }, platinum: { monthly: 25, total: 300, save: 0 } }
      },
      // 2 Year pricing (Columns F, G & H)
      two_yearly: {
        0: { basic: { monthly: 56, total: 670, save: 74 }, gold: { monthly: 61, total: 734, save: 82 }, platinum: { monthly: 65, total: 786, save: 87 } },
        50: { basic: { monthly: 52, total: 626, save: 70 }, gold: { monthly: 56, total: 670, save: 74 }, platinum: { monthly: 58, total: 691, save: 77 } },
        100: { basic: { monthly: 45, total: 540, save: 60 }, gold: { monthly: 49, total: 583, save: 65 }, platinum: { monthly: 52, total: 626, save: 70 } },
        150: { basic: { monthly: 41, total: 497, save: 55 }, gold: { monthly: 47, total: 562, save: 62 }, platinum: { monthly: 49, total: 583, save: 65 } },
        200: { basic: { monthly: 38, total: 456, save: 50 }, gold: { monthly: 44, total: 528, save: 58 }, platinum: { monthly: 46, total: 552, save: 61 } }
      },
      // 3 Year pricing (Columns J, K & L)
      three_yearly: {
        0: { basic: { monthly: 82, total: 982, save: 134 }, gold: { monthly: 90, total: 1077, save: 147 }, platinum: { monthly: 96, total: 1153, save: 157 } },
        50: { basic: { monthly: 77, total: 919, save: 125 }, gold: { monthly: 82, total: 982, save: 134 }, platinum: { monthly: 84, total: 1014, save: 138 } },
        100: { basic: { monthly: 66, total: 792, save: 108 }, gold: { monthly: 71, total: 855, save: 117 }, platinum: { monthly: 77, total: 919, save: 125 } },
        150: { basic: { monthly: 61, total: 729, save: 99 }, gold: { monthly: 69, total: 824, save: 112 }, platinum: { monthly: 71, total: 855, save: 117 } },
        200: { basic: { monthly: 56, total: 672, save: 92 }, gold: { monthly: 66, total: 792, save: 108 }, platinum: { monthly: 69, total: 828, save: 113 } }
      }
    };
    
    const periodData = pricingTable[paymentPeriod as keyof typeof pricingTable] || pricingTable.yearly;
    return periodData[excess as keyof typeof periodData] || periodData[0];
  };

  const calculatePlanPrice = (plan: Plan) => {
    const pricing = getPricingData(voluntaryExcess, paymentType);
    const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    
    // Always show monthly payment for all periods
    return pricing[planType].monthly;
  };

  const getPlanSavings = (plan: Plan) => {
    if (paymentType === 'yearly') return null;
    
    const pricing = getPricingData(voluntaryExcess, paymentType);
    const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    
    return pricing[planType].save;
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

  const toggleVoluntaryExcess = (amount: number) => {
    setVoluntaryExcess(amount);
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
        voluntaryExcess: voluntaryExcess,
        selectedAddOns: selectedAddOns[plan.id] || {},
        vehicleData
      };

      if (false) { // Remove monthly payment logic
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
      case 'yearly': return 'per month for 1 year';
      case 'two_yearly': return 'per month for 2 years';
      case 'three_yearly': return 'per month for 3 years';
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
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 w-full max-w-3xl">
          <div className="grid grid-cols-3 gap-1">
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

      {/* Voluntary Excess Selection */}
      <div className="flex justify-center mb-12 px-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 w-full max-w-2xl">
          <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Voluntary Excess Amount</h3>
          <div className="grid grid-cols-4 gap-3">
            {[0, 50, 100, 150].map((amount) => (
              <button
                key={amount}
                onClick={() => toggleVoluntaryExcess(amount)}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  voluntaryExcess === amount
                    ? 'bg-[#1a365d] text-white border-[#1a365d]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                }`}
              >
                £{amount}
              </button>
            ))}
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
            const savings = getPlanSavings(plan);
            
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
                  <div className="text-gray-600 text-base mb-2">
                    {getPaymentLabel()}
                  </div>
                  {savings && paymentType !== 'yearly' && (
                    <div className="text-green-600 font-bold text-lg">
                      You Save £{savings}
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <div className="px-6 mb-6">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                    className={`w-full py-3 text-white font-semibold rounded-lg ${
                      plan.name === 'Basic' ? 'bg-[#1a365d] hover:bg-[#0f2a4a]' :
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