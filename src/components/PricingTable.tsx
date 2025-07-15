import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, ArrowLeft, Info, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
  // Debug logging to see what vehicle data we're receiving
  console.log('PricingTable received vehicleData:', vehicleData);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'two_yearly' | 'three_yearly'>('monthly');
  const [voluntaryExcess, setVoluntaryExcess] = useState<{[planId: string]: number}>({});
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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
          // Use the first (most recent) document for each plan type
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

  // Calculate dynamic pricing based on voluntary excess
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

    // Apply voluntary excess discount for this specific plan
    const planExcess = voluntaryExcess[plan.id] || 0;
    const excessDiscount = planExcess * 0.01; // 1% discount per £1 excess
    return Math.max(basePrice * (1 - excessDiscount), basePrice * 0.7); // Min 30% of base price
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    return selectedAddOnCount * 2; // £2 per add-on per year
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

  const getDiscountPercentage = () => {
    switch (paymentType) {
      case 'two_yearly': return 10;
      case 'three_yearly': return 12;
      default: return 0;
    }
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
          if (stripeData?.url) window.location.href = stripeData.url;
        } else if (bumperData?.url) {
          window.location.href = bumperData.url;
        }
      } else {
        // Use Stripe for non-monthly payments
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
    <TooltipProvider>
      <div className="bg-[#e8f4fb] w-full min-h-screen overflow-x-hidden">
        {/* Back Button */}
        <div className="mb-4 sm:mb-8 px-4 sm:px-8 pt-4 sm:pt-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Contact Details
          </Button>
        </div>

        {/* Header with Vehicle Details */}
        <div className="text-center mb-6 sm:mb-10 px-4 sm:px-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Your Warranty Quote
          </h1>
          
          {/* Vehicle Registration Display */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-lg sm:text-2xl md:text-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-[6px] shadow-sm leading-tight border-2 border-black">
              <img 
                src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                alt="GB Flag" 
                className="w-[25px] h-[18px] sm:w-[35px] sm:h-[25px] mr-3 sm:mr-4 object-cover rounded-[2px]"
              />
              <div className="font-bold font-sans tracking-normal">
                {vehicleData.regNumber || 'REG NUM'}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {vehicleData.regNumber ? (
            <div className="mb-6 bg-white rounded-lg p-6 shadow-lg border-2 border-blue-100 max-w-2xl mx-auto">
              {vehicleData.make ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                    {vehicleData.make} {vehicleData.model || 'Vehicle'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
                    {vehicleData.fuelType && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span><strong>Fuel:</strong> {vehicleData.fuelType}</span>
                      </div>
                    )}
                    {vehicleData.year && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span><strong>Year:</strong> {vehicleData.year}</span>
                      </div>
                    )}
                    {vehicleData.transmission && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span><strong>Transmission:</strong> {vehicleData.transmission}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <span><strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-700 mb-2">Vehicle Details</p>
                  <p className="text-lg text-gray-600 mb-2">
                    <strong>Reg:</strong> {vehicleData.regNumber}
                  </p>
                  <p className="text-lg text-gray-600">
                    <strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Vehicle information retrieved via DVLA lookup
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Payment Period Toggle */}
        <div className="flex justify-center mb-12 sm:mb-16 px-4 sm:px-8">
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


        {/* Pricing Cards */}
        <div className="w-full px-4 sm:px-8 pb-8 sm:pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 lg:items-start">
              {plans.map((plan) => {
                const basePrice = calculatePlanPrice(plan);
                const addOnPrice = calculateAddOnPrice(plan.id);
                const totalPrice = basePrice + addOnPrice;
                const isLoading = loading[plan.id];
                const isPopular = plan.name === 'Gold';
                
                return (
                  <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden relative border-2 w-full ${isPopular ? 'border-orange-400 shadow-xl lg:scale-105' : 'border-gray-200'}`}>
                    {isPopular && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    {/* Plan Header */}
                    <div className="p-6 sm:p-8 text-center bg-gray-50 border-b">
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">£</span>
                        <span className="text-3xl sm:text-5xl font-bold text-gray-900">
                          {Math.round(totalPrice)}
                        </span>
                        <div className="text-gray-600 text-base sm:text-lg">{getPaymentLabel()}</div>
                      </div>
                      {paymentType !== 'monthly' && (
                        <div className="text-sm text-gray-500">
                          12 simple interest-free payments
                        </div>
                      )}
                    </div>

                    {/* Plan Content */}
                    <div className="p-6 sm:p-8 space-y-6">
                      {/* What's Covered */}
                      <div>
                        <h4 className="font-bold text-lg mb-4">What's Covered:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {plan.coverage.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Voluntary Excess Selection */}
                      <div>
                        <h4 className="font-bold text-lg mb-4">Voluntary Excess</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => toggleVoluntaryExcess(plan.id, 0)}
                              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                                (voluntaryExcess[plan.id] || 0) === 0
                                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                              }`}
                            >
                              £0
                            </button>
                            <button
                              onClick={() => toggleVoluntaryExcess(plan.id, 150)}
                              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                                (voluntaryExcess[plan.id] || 0) === 150
                                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                              }`}
                            >
                              £150
                            </button>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => toggleVoluntaryExcess(plan.id, 50)}
                              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                                (voluntaryExcess[plan.id] || 0) === 50
                                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                              }`}
                            >
                              £50
                            </button>
                            <button
                              onClick={() => toggleVoluntaryExcess(plan.id, 200)}
                              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                                (voluntaryExcess[plan.id] || 0) === 200
                                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                              }`}
                            >
                              £200
                            </button>
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleVoluntaryExcess(plan.id, 100)}
                              className={`p-2 rounded-lg border text-sm font-semibold transition-all duration-200 w-full ${
                                (voluntaryExcess[plan.id] || 0) === 100
                                  ? 'bg-[#1a365d] text-white border-[#1a365d] shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#1a365d]'
                              }`}
                            >
                              £100
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Add-ons */}
                      {plan.add_ons.length > 0 && (
                        <div>
                          <h4 className="font-bold text-lg mb-4">
                            Optional Add-ons
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 ml-2 inline" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>£2 per item per year</p>
                              </TooltipContent>
                            </Tooltip>
                          </h4>
                          <div className="space-y-3">
                            {plan.add_ons.map((addon, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`${plan.id}-${addon}`}
                                  checked={selectedAddOns[plan.id]?.[addon] || false}
                                  onCheckedChange={() => toggleAddOn(plan.id, addon)}
                                />
                                <label
                                  htmlFor={`${plan.id}-${addon}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {addon}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Complete Coverage Details Section */}
                      <div className="mt-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-1">Warranty Plan Details</h4>
                              <p className="text-gray-600 text-sm">Full breakdown of coverage</p>
                            </div>
                          </div>
                          
                          {pdfUrls[plan.name.toLowerCase()] ? (
                            <a
                              href={pdfUrls[plan.name.toLowerCase()]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg py-3 px-4 transition-colors duration-200"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span className="font-medium text-gray-900">View PDF (Opens in New Tab)</span>
                            </a>
                          ) : (
                            <div className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-center">
                              <span className="text-gray-500 text-sm">Coverage details coming soon</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isLoading}
                        className={`w-full py-4 text-lg font-bold rounded-xl ${
                          plan.name === 'Basic' ? 'bg-[#0e3e87] hover:bg-[#0d3a7a]' :
                          plan.name === 'Gold' ? 'bg-[#f59e0b] hover:bg-[#e4930a]' :
                          'bg-[#dc4f20] hover:bg-[#c8451d]'
                        } text-white transition-colors duration-200`}
                      >
                        {isLoading ? 'Processing...' : `Select ${plan.name}`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PricingTable;