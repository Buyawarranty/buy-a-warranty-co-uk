import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';

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
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchPdfUrls();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar when user scrolls past the initial pricing cards
      const scrollY = window.scrollY;
      setIsFloatingBarVisible(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Dynamic pricing calculation based on database values and voluntary excess
  const calculateDynamicPricing = (plan: Plan, excess: number, paymentPeriod: string) => {
    const basePrice = (() => {
      switch (paymentPeriod) {
        case 'yearly':
          return plan.yearly_price || plan.monthly_price * 12;
        case 'two_yearly':
          return plan.two_yearly_price || plan.monthly_price * 24;
        case 'three_yearly':
          return plan.three_yearly_price || plan.monthly_price * 36;
        default:
          return plan.monthly_price;
      }
    })();

    // Apply voluntary excess discount (1% per £50 excess)
    const excessDiscount = (excess / 50) * 0.01;
    const discountedPrice = basePrice * (1 - excessDiscount);
    
    // Calculate monthly payment and total based on period
    const periodMonths = paymentPeriod === 'yearly' ? 12 : 
                        paymentPeriod === 'two_yearly' ? 24 : 
                        paymentPeriod === 'three_yearly' ? 36 : 1;
    
    const monthlyPayment = Math.round(discountedPrice / periodMonths);
    const total = monthlyPayment * periodMonths;
    
    // Calculate savings compared to yearly
    const yearlyPrice = plan.yearly_price || plan.monthly_price * 12;
    const yearlyWithExcess = yearlyPrice * (1 - excessDiscount);
    const save = paymentPeriod !== 'yearly' ? Math.round(yearlyWithExcess - total) : 0;
    
    return {
      monthly: monthlyPayment,
      total: total,
      save: Math.max(save, 0)
    };
  };

  const calculatePlanPrice = (plan: Plan) => {
    const pricing = calculateDynamicPricing(plan, voluntaryExcess, paymentType);
    return pricing.monthly;
  };

  const getPlanSavings = (plan: Plan) => {
    if (paymentType === 'yearly') return null;
    
    const pricing = calculateDynamicPricing(plan, voluntaryExcess, paymentType);
    return pricing.save;
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    return selectedAddOnCount * 2; // £2 per add-on per month
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

  const toggleAddOnInfo = (planId: string) => {
    setShowAddOnInfo(prev => ({
      ...prev,
      [planId]: !prev[planId]
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
        voluntaryExcess: voluntaryExcess,
        selectedAddOns: selectedAddOns[plan.id] || {},
        vehicleData
      };

      if (true) { // Try Bumper API first, fallback to Stripe if needed
        const { data: bumperData, error: bumperError } = await supabase.functions.invoke('create-bumper-checkout', {
          body: checkoutData
        });

        if (bumperError || bumperData?.fallbackToStripe) {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
            body: checkoutData
          });

          if (stripeError) throw stripeError;
          if (stripeData?.url) window.open(stripeData.url, '_blank');
        } else if (bumperData?.url) {
          window.open(bumperData.url, '_blank');
        }
      } else {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: checkoutData
        });

        if (error) throw error;
        if (data?.url) window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const getPaymentLabel = (price: number) => {
    return `£${price}/mo for 12 months`;
  };

  return (
    <div className="bg-[#e8f4fb] w-full min-h-screen">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back
        </Button>
      </div>

      {/* Trustpilot Header */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-center">
        <TrustpilotHeader />
      </div>

      {/* Header with Vehicle Details */}
      <div className="text-center mb-8 sm:mb-10 px-4 sm:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Your Warranty Quote
        </h1>
        
        {/* Vehicle Registration Display */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-[6px] shadow-sm leading-tight border-2 border-black">
            <img 
              src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
              alt="GB Flag" 
              className="w-[25px] h-[18px] sm:w-[30px] sm:h-[22px] md:w-[35px] md:h-[25px] mr-3 sm:mr-4 object-cover rounded-[2px]"
            />
            <div className="font-bold font-sans tracking-normal">
              {vehicleData.regNumber || 'REG NUM'}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        {vehicleData.make && (
          <div className="mb-6 max-w-2xl mx-auto px-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-700">
              <span className="font-semibold text-gray-900 text-center sm:text-left">
                {vehicleData.make} {vehicleData.model || 'Vehicle'}
              </span>
              {vehicleData.fuelType && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Fuel:</strong> {vehicleData.fuelType}
                </span>
              )}
              {vehicleData.year && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Year:</strong> {vehicleData.year}
                </span>
              )}
              {vehicleData.transmission && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Transmission:</strong> {vehicleData.transmission}
                </span>
              )}
              <span className="text-gray-600 text-center sm:text-left">
                <strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles
              </span>
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
            1 year
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
              2 year
            </button>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
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
              3 year
            </button>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
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
                onClick={() => toggleVoluntaryExcess(amount)}
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

      {/* Pricing Cards Container */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const basePrice = calculatePlanPrice(plan);
            const addOnPrice = calculateAddOnPrice(plan.id);
            const totalPrice = basePrice + addOnPrice;
            const isLoading = loading[plan.id];
            const isPopular = plan.name === 'Gold';
            const savings = getPlanSavings(plan);
            
            return (
              <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden relative ${isPopular ? 'border-2 border-yellow-400' : 'border border-gray-200'} ${isPopular ? 'mt-6' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-yellow-400 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="p-8 text-center">
                  <h3 className={`text-4xl font-bold mb-4 ${
                    plan.name === 'Basic' ? 'text-blue-900' :
                    plan.name === 'Gold' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-900 text-xl font-bold mb-6">
                    {paymentType === 'yearly' ? '1 Year warranty' :
                     paymentType === 'two_yearly' ? '2 Year warranty' :
                     paymentType === 'three_yearly' ? '3 Year warranty' :
                     '1 Year warranty'}
                   </p>
                   <div className="text-4xl font-bold text-gray-900 mb-3">
                     <span className="text-2xl">£</span>{totalPrice}<span className="text-2xl">/mo</span>
                   </div>
                   <div className="text-gray-600 text-base mb-6">
                     for 12 months interest free
                   </div>
                   {savings && paymentType !== 'yearly' && (
                     <div className="text-green-600 font-bold text-lg mb-6">
                       You Save £{savings}
                     </div>
                   )}
                   
                   {/* Buy Now Button */}
                   <Button
                     onClick={() => handleSelectPlan(plan)}
                     disabled={isLoading}
                     className={`w-full py-4 font-bold text-lg rounded-xl transition-colors duration-200 ${
                       plan.name === 'Basic' ? 'bg-[#1a365d] hover:bg-[#2d4a6b] text-white' :
                       plan.name === 'Gold' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                       'bg-orange-500 hover:bg-orange-600 text-white'
                     }`}
                   >
                     {isLoading ? 'Processing...' : 'Buy Now'}
                   </Button>
                 </div>

                 {/* What's Covered */}
                <div className="px-6 mb-6">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">What's Covered:</h4>
                  <div className="space-y-2">
                    {plan.coverage.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className={`text-base text-gray-700 ${feature.includes("Basic plan plus:") || feature.includes("Gold plan plus:") ? "font-bold text-gray-900" : ""}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Add-ons */}
                <div className="px-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-bold text-lg text-gray-900">Optional Add-ons</h4>
                    <button
                      onClick={() => toggleAddOnInfo(plan.id)}
                      className="hover:bg-gray-100 rounded-full p-1 transition-colors"
                    >
                      <Info className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Dropdown info text */}
                  {showAddOnInfo[plan.id] && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md animate-fade-in">
                      <p className="text-sm text-blue-800">£2 per add-on per month</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {plan.add_ons.length > 0 ? (
                      plan.add_ons.map((addon, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${plan.id}-${addon}`}
                            checked={selectedAddOns[plan.id]?.[addon] || false}
                            onCheckedChange={() => toggleAddOn(plan.id, addon)}
                            className="border-gray-400"
                          />
                          <label
                            htmlFor={`${plan.id}-${addon}`}
                            className="text-base text-gray-700 cursor-pointer"
                          >
                            {addon}
                          </label>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <Checkbox disabled className="border-gray-400" />
                          <span className="text-base text-gray-700">Power Hood</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox disabled className="border-gray-400" />
                          <span className="text-base text-gray-700">ECU</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox disabled className="border-gray-400" />
                          <span className="text-base text-gray-700">Air Conditioning</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox disabled className="border-gray-400" />
                          <span className="text-base text-gray-700">Turbo</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Warranty Plan Details PDF - Bottom Section */}
                <div className="p-6 bg-gray-50 rounded-lg m-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Warranty Plan Details</h4>
                      <p className="text-sm text-gray-600">*Full breakdown of coverage</p>
                    </div>
                  </div>
                  {(() => {
                    // Determine which PDF to show based on plan and vehicle type
                    let pdfUrl = null;
                    const planType = plan.name.toLowerCase();
                    const vehicleType = vehicleData.vehicleType?.toLowerCase();

                    if (vehicleType === 'motorbike') {
                      pdfUrl = pdfUrls['motorbike'];
                    } else if (vehicleType === 'electric' || vehicleType === 'ev') {
                      pdfUrl = pdfUrls['electric'];
                    } else if (vehicleType === 'phev' || vehicleType === 'hybrid') {
                      pdfUrl = pdfUrls['phev'];
                    } else {
                      pdfUrl = pdfUrls[planType];
                    }

                    return pdfUrl ? (
                      <Button
                        variant="outline"
                        className="w-full text-sm bg-white hover:bg-gray-50 border-gray-300"
                        onClick={() => window.open(pdfUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-sm bg-white border-gray-300"
                        disabled
                      >
                        PDF Not Available
                      </Button>
                    );
                  })()}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Action Bar */}
      {isFloatingBarVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const basePrice = calculatePlanPrice(plan);
                const addOnPrice = calculateAddOnPrice(plan.id);
                const totalPrice = basePrice + addOnPrice;
                const isLoading = loading[plan.id];
                const savings = getPlanSavings(plan);
                
                return (
                  <div key={plan.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${
                        plan.name === 'Basic' ? 'text-blue-900' :
                        plan.name === 'Gold' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {plan.name}
                      </h4>
                       <div className="flex items-baseline gap-1">
                         <span className="text-sm">£</span><span className="text-2xl font-bold">{Math.round(totalPrice)}</span>
                         <span className="text-sm text-gray-600">x 12</span>
                       </div>
                      {savings && paymentType !== 'yearly' && (
                        <div className="text-green-600 font-semibold text-sm">
                          Save £{savings}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading}
                      size="sm"
                      className={`ml-4 px-6 py-2 font-semibold rounded-lg transition-colors duration-200 ${
                        plan.name === 'Basic' ? 'bg-[#1a365d] hover:bg-[#2d4a6b] text-white' :
                        plan.name === 'Gold' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                        'bg-[#eb4b00] hover:bg-[#d44300] text-white'
                      }`}
                    >
                       {isLoading ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingTable;