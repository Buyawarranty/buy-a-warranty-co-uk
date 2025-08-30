import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingTableProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    vehicleType?: string;
  };
  onBack: () => void;
  onPlanSelected?: (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  // Separate add-ons state for each plan
  const [selectedAddOns, setSelectedAddOns] = useState<{
    '12months': {[addon: string]: boolean};
    '24months': {[addon: string]: boolean};
    '36months': {[addon: string]: boolean};
  }>({
    '12months': {},
    '24months': {},
    '36months': {}
  });
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
  const [reliabilityTier, setReliabilityTier] = useState<string | null>(null);
  const [reliabilityPricing, setReliabilityPricing] = useState<any>(null);
  const [reliabilityLoading, setReliabilityLoading] = useState(false);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);

  // Voluntary excess options with discounts
  const excessOptions = [
    { amount: 0, label: '£0', discount: '' },
    { amount: 50, label: '£50', discount: '5% discount' },
    { amount: 100, label: '£100', discount: '10% discount' },
    { amount: 150, label: '£150', discount: '12% discount' },
    { amount: 200, label: '£200', discount: '15% discount' },
    { amount: 250, label: '£250', discount: '18% discount' },
    { amount: 300, label: '£300', discount: '20% discount' },
    { amount: 400, label: '£400', discount: '22% discount' },
    { amount: 500, label: '£500', discount: '25% discount' },
  ];

  // Coverage features - matching the image content
  const coverageFeatures = [
    'Engine',
    'Manual Gearbox',
    'Automatic Transmission',
    'Torque Converter',
    'Overdrive',
    'Differential',
    'Electrics',
    'Casings',
    'Recover Claim-back',
    'Basic plan plus:',
    'Labour up to £75 p/hr',
    '*FREE Halfords MOT test',
    '*Unlimited Claims',
    'Clutch',
    'Cooling System',
    'Fuel System',
    'Braking System',
    'Propshaft',
    'Vehicle Hire',
    'European Cover'
  ];

  // Add-on options - matching the image
  const addOnOptions = [
    { name: 'Power Hood', price: 25 },
    { name: 'ECU', price: 30 },
    { name: 'Air Conditioning', price: 35 },
    { name: 'Turbo', price: 40 }
  ];

  // Check vehicle age validation
  const vehicleAgeError = useMemo(() => {
    if (vehicleData?.year) {
      const currentYear = new Date().getFullYear();
      const vehicleYear = parseInt(vehicleData.year);
      const vehicleAge = currentYear - vehicleYear;
      
      if (vehicleAge > 15) {
        return 'We cannot offer warranties for vehicles over 15 years of age';
      }
    }
    return null;
  }, [vehicleData?.year]);

  useEffect(() => {
    fetchPdfUrl();
  }, []);

  // Auto-calculate reliability score when component loads with registration
  useEffect(() => {
    if (vehicleData?.regNumber && !vehicleAgeError) {
      calculateReliabilityScore();
    }
  }, [vehicleData?.regNumber]);

  // Handle scroll to show/hide sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar when user scrolls past the plan cards section
      const scrollY = window.scrollY;
      setIsFloatingBarVisible(scrollY > 800); // Adjust this value based on when you want it to appear
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPdfUrl = async () => {
    try {
      // Try to fetch PDF based on vehicle type first, then fallback to general warranty
      const vehicleType = vehicleData?.vehicleType || 'standard';
      
      const { data, error } = await supabase
        .from('customer_documents')
        .select('file_url, plan_type, vehicle_type')
        .or(`vehicle_type.eq.${vehicleType},vehicle_type.eq.standard,plan_type.eq.Warranty`)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        // Prefer vehicle-specific documents, then fallback to general warranty
        const specificDoc = data.find(doc => doc.vehicle_type === vehicleType) || data[0];
        setPdfUrl(specificDoc.file_url);
      }
    } catch (error) {
      console.error('Error fetching PDF URL:', error);
    }
  };

  const calculateReliabilityScore = async () => {
    if (!vehicleData?.regNumber) return;
    
    setReliabilityLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-vehicle-reliability', {
        body: { registration: vehicleData.regNumber }
      });

      if (error) throw error;

      if (data?.success) {
        setReliabilityScore(data.data.reliability_score);
        setReliabilityTier(data.data.tier_label);
        setReliabilityPricing(data.data.pricing);
      }
    } catch (error) {
      console.error('Error calculating reliability:', error);
    } finally {
      setReliabilityLoading(false);
    }
  };

  const getPricingData = () => {
    // If we have reliability-based pricing, use it as the base
    if (reliabilityPricing) {
      const baseTotalPrice = reliabilityPricing[paymentType === '12months' ? '12M' : paymentType === '24months' ? '24M' : '36M'];
      
      // Apply voluntary excess discounts
      const discountMultiplier = (() => {
        switch (voluntaryExcess) {
          case 0: return 1.0; // No discount
          case 50: return 0.95; // 5% discount
          case 100: return 0.90; // 10% discount
          case 150: return 0.88; // 12% discount
          case 200: return 0.85; // 15% discount
          case 250: return 0.82; // 18% discount
          case 300: return 0.80; // 20% discount
          case 400: return 0.78; // 22% discount
          case 500: return 0.75; // 25% discount
          default: return 0.95;
        }
      })();
      
      const discountedTotal = Math.round(baseTotalPrice * discountMultiplier);
      const monthlyDivisor = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
      const monthlyPrice = Math.round(discountedTotal / monthlyDivisor);
      const savings = baseTotalPrice - discountedTotal;
      
      return {
        monthly: monthlyPrice,
        total: discountedTotal,
        save: savings
      };
    }
    
    // Fallback to hardcoded pricing if reliability pricing is not available
    const basePrices = {
      '12months': { 
        0: { monthly: 46, total: 559, save: 0 },
        50: { monthly: 44, total: 529, save: 5 },
        100: { monthly: 38, total: 459, save: 17 },
        150: { monthly: 36, total: 429, save: 22 },
        200: { monthly: 34, total: 409, save: 25 },
        250: { monthly: 32, total: 389, save: 28 },
        300: { monthly: 31, total: 369, save: 32 },
        400: { monthly: 29, total: 349, save: 35 },
        500: { monthly: 27, total: 329, save: 41 }
      },
      '24months': { 
        0: { monthly: 84, total: 1009, save: 107 },
        50: { monthly: 80, total: 959, save: 119 },
        100: { monthly: 69, total: 829, save: 189 },
        150: { monthly: 65, total: 779, save: 219 },
        200: { monthly: 61, total: 729, save: 249 },
        250: { monthly: 58, total: 689, save: 278 },
        300: { monthly: 55, total: 659, save: 298 },
        400: { monthly: 52, total: 629, save: 328 },
        500: { monthly: 48, total: 579, save: 378 }
      },
      '36months': { 
        0: { monthly: 112, total: 1349, save: 238 },
        50: { monthly: 106, total: 1279, save: 308 },
        100: { monthly: 92, total: 1109, save: 478 },
        150: { monthly: 87, total: 1039, save: 548 },
        200: { monthly: 81, total: 979, save: 608 },
        250: { monthly: 77, total: 929, save: 658 },
        300: { monthly: 74, total: 889, save: 698 },
        400: { monthly: 70, total: 849, save: 738 },
        500: { monthly: 65, total: 779, save: 808 }
      }
    };

    return basePrices[paymentType][voluntaryExcess as keyof typeof basePrices[typeof paymentType]] || basePrices[paymentType][50];
  };

  const calculateAddOnTotal = (planKey?: '12months' | '24months' | '36months') => {
    const planAddOns = planKey ? selectedAddOns[planKey] : selectedAddOns[paymentType];
    return Object.entries(planAddOns)
      .filter(([_, selected]) => selected)
      .reduce((total, [addonName]) => {
        const addon = addOnOptions.find(a => a.name === addonName);
        return total + (addon?.price || 0);
      }, 0);
  };

  const toggleAddOn = (addonName: string, planKey: '12months' | '24months' | '36months') => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planKey]: {
        ...prev[planKey],
        [addonName]: !prev[planKey][addonName]
      }
    }));
  };

  const handleSelectPlan = async () => {
    setLoading(true);
    
    try {
      const pricing = getPricingData();
      const addOnTotal = calculateAddOnTotal(paymentType); // Use specific payment type
      const totalPrice = pricing.total + addOnTotal;
      const monthlyPrice = pricing.monthly + Math.round(addOnTotal / (paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36));
      
      const pricingData = {
        totalPrice,
        monthlyPrice,
        voluntaryExcess,
        selectedAddOns: selectedAddOns[paymentType]
      };

      if (onPlanSelected) {
        onPlanSelected('warranty-plan', paymentType, 'Vehicle Warranty Plan', pricingData);
      }
    } catch (error) {
      console.error('Error in plan selection:', error);
      toast.error('An error occurred while processing your selection');
    } finally {
      setLoading(false);
    }
  };

  if (vehicleAgeError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to vehicle details
          </Button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Vehicle Not Eligible</h2>
            <p className="text-gray-600 mb-6">{vehicleAgeError}</p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pricing = getPricingData();
  const addOnTotal = calculateAddOnTotal();
  const totalPriceWithAddons = pricing.total + addOnTotal;
  const monthlyPriceWithAddons = pricing.monthly + Math.round(addOnTotal / 12);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to vehicle details
        </Button>

        {/* Vehicle Reliability & Pricing Explanation */}
        {reliabilityScore !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Your Vehicle's Reliability Assessment
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                We've analyzed your vehicle's MOT history and reliability data to provide you with fair, personalized pricing
              </p>
              
              {/* Vehicle Registration Display */}
              <div className="mb-6">
                <div className="inline-block bg-yellow-400 text-black font-bold text-2xl px-6 py-3 rounded border-2 border-black">
                  {vehicleData.regNumber?.toUpperCase()}
                </div>
                {vehicleData.make && vehicleData.model && (
                  <p className="text-lg text-gray-600 mt-3">
                    {vehicleData.year} {vehicleData.make} {vehicleData.model}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Reliability Score */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    reliabilityScore >= 80 ? 'bg-green-100 text-green-600' :
                    reliabilityScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {reliabilityScore}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Reliability Score</h4>
                <p className="text-sm text-gray-600">Based on MOT data</p>
              </div>
              
              {/* Tier Badge */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="mb-3">
                  {reliabilityTier && (
                    <Badge className={`text-lg px-4 py-2 ${
                      reliabilityTier.toLowerCase().includes('excellent') ? 'bg-green-100 text-green-800' :
                      reliabilityTier.toLowerCase().includes('good') ? 'bg-blue-100 text-blue-800' :
                      reliabilityTier.toLowerCase().includes('average') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reliabilityTier}
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Risk Category</h4>
                <p className="text-sm text-gray-600">Determines base pricing</p>
              </div>
              
              {/* Pricing Impact */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    reliabilityScore >= 80 ? 'bg-green-100' :
                    reliabilityScore >= 60 ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {reliabilityScore >= 80 ? '💰' : reliabilityScore >= 60 ? '💳' : '⚠️'}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Your Pricing</h4>
                <p className="text-sm text-gray-600">
                  {reliabilityScore >= 80 ? 'Lower risk = Better rates' :
                   reliabilityScore >= 60 ? 'Standard pricing applied' :
                   'Higher risk = Premium pricing'}
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                <strong>How it works:</strong> Our AI analyzes your vehicle's MOT test history, failure rates, and defect patterns 
                to calculate a reliability score. Higher scores indicate more reliable vehicles and qualify for better pricing.
              </p>
            </div>
          </div>
        )}

        {/* Voluntary Excess Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Voluntary Excess Amount</h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {excessOptions.slice(0, 4).map((option) => (
              <button
                key={option.amount}
                onClick={() => setVoluntaryExcess(option.amount)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[80px] ${
                  voluntaryExcess === option.amount
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              key: '12months' as const, 
              title: 'Basic', 
              subtitle: '1 year warranty',
              borderColor: 'border-slate-800',
              buttonColor: 'bg-slate-800 hover:bg-slate-900',
              titleColor: 'text-slate-800',
              textColor: 'text-gray-800'
            },
            { 
              key: '24months' as const, 
              title: 'Gold', 
              subtitle: '2 year warranty',
              borderColor: 'border-yellow-400',
              buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
              titleColor: 'text-yellow-600',
              textColor: 'text-gray-800',
              mostPopular: true
            },
            { 
              key: '36months' as const, 
              title: 'Platinum', 
              subtitle: '3 year warranty',
              borderColor: 'border-orange-600',
              buttonColor: 'bg-orange-600 hover:bg-orange-700',
              titleColor: 'text-orange-600',
              textColor: 'text-gray-800'
            }
          ].map((plan) => {
            const isSelected = paymentType === plan.key;
            
            // Calculate specific pricing for this plan period using reliability-based pricing if available
            const planPricing = (() => {
              if (reliabilityPricing) {
                const baseTotalPrice = reliabilityPricing[plan.key === '12months' ? '12M' : plan.key === '24months' ? '24M' : '36M'];
                
                // Apply voluntary excess discounts
                const discountMultiplier = (() => {
                  switch (voluntaryExcess) {
                    case 0: return 1.0; // No discount
                    case 50: return 0.95; // 5% discount
                    case 100: return 0.90; // 10% discount
                    case 150: return 0.88; // 12% discount
                    case 200: return 0.85; // 15% discount
                    case 250: return 0.82; // 18% discount
                    case 300: return 0.80; // 20% discount
                    case 400: return 0.78; // 22% discount
                    case 500: return 0.75; // 25% discount
                    default: return 0.95;
                  }
                })();
                
                const discountedTotal = Math.round(baseTotalPrice * discountMultiplier);
                const monthlyDivisor = plan.key === '12months' ? 12 : plan.key === '24months' ? 24 : 36;
                const monthlyPrice = Math.round(discountedTotal / monthlyDivisor);
                const savings = baseTotalPrice - discountedTotal;
                
                return {
                  monthly: monthlyPrice,
                  total: discountedTotal,
                  save: savings
                };
              }
              
              // Fallback to hardcoded pricing
              const prices = {
                '12months': { 
                  0: { monthly: 46, total: 559, save: 0 },
                  50: { monthly: 44, total: 529, save: 5 },
                  100: { monthly: 38, total: 459, save: 17 },
                  150: { monthly: 36, total: 429, save: 22 },
                  200: { monthly: 34, total: 409, save: 25 },
                  250: { monthly: 32, total: 389, save: 28 },
                  300: { monthly: 31, total: 369, save: 32 },
                  400: { monthly: 29, total: 349, save: 35 },
                  500: { monthly: 27, total: 329, save: 41 }
                },
                '24months': { 
                  0: { monthly: 42, total: 1009, save: 107 },
                  50: { monthly: 40, total: 959, save: 119 },
                  100: { monthly: 35, total: 829, save: 189 },
                  150: { monthly: 32, total: 779, save: 219 },
                  200: { monthly: 30, total: 729, save: 249 },
                  250: { monthly: 29, total: 689, save: 278 },
                  300: { monthly: 27, total: 659, save: 298 },
                  400: { monthly: 26, total: 629, save: 328 },
                  500: { monthly: 24, total: 579, save: 378 }
                },
                '36months': { 
                  0: { monthly: 37, total: 1349, save: 238 },
                  50: { monthly: 36, total: 1279, save: 308 },
                  100: { monthly: 31, total: 1109, save: 478 },
                  150: { monthly: 29, total: 1039, save: 548 },
                  200: { monthly: 27, total: 979, save: 608 },
                  250: { monthly: 26, total: 929, save: 658 },
                  300: { monthly: 25, total: 889, save: 698 },
                  400: { monthly: 24, total: 849, save: 738 },
                  500: { monthly: 22, total: 779, save: 808 }
                }
              };
              return prices[plan.key][voluntaryExcess as keyof typeof prices[typeof plan.key]] || prices[plan.key][50];
            })();

            // Calculate plan-specific add-on total
            const planAddOnTotal = calculateAddOnTotal(plan.key);
            const planTotalWithAddons = planPricing.total + planAddOnTotal;
            const planMonthlyWithAddons = planPricing.monthly + Math.round(planAddOnTotal / (plan.key === '12months' ? 12 : plan.key === '24months' ? 24 : 36));

            return (
              <div key={plan.key} className="relative">
                {plan.mostPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-yellow-500 text-white px-3 py-1 text-xs font-bold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <div className={`bg-white ${plan.borderColor} border-2 ${plan.textColor} rounded-xl p-6 h-full ${isSelected ? 'ring-4 ring-blue-400' : ''} cursor-pointer transition-all duration-200 hover:shadow-xl`}
                     onClick={() => setPaymentType(plan.key)}>
                  
                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.titleColor}`}>{plan.title}</h3>
                    <p className="text-sm text-gray-600">{plan.subtitle}</p>
                    
                    <div className="mt-6">
                      <div className="text-3xl font-bold text-gray-800">
                        £{planMonthlyWithAddons}/mo
                      </div>
                      {planAddOnTotal > 0 && (
                        <p className="text-xs text-gray-500">
                          Base: £{planPricing.monthly}/mo + Add-ons: £{Math.round(planAddOnTotal / 12)}/mo
                        </p>
                      )}
                      <p className="text-sm text-green-600 font-medium mt-1">
                        for {plan.key === '12months' ? '12' : plan.key === '24months' ? '24' : '36'} months interest free
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Pay Full Amount</span>
                      <span className="text-sm text-blue-600">
                        Save 5% (£{planPricing.save})
                      </span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      £{planTotalWithAddons} upfront
                    </div>
                    {planAddOnTotal > 0 && (
                      <div className="text-xs text-gray-500">
                        Base: £{planPricing.total} + Add-ons: £{planAddOnTotal}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Instead of £{planTotalWithAddons + planPricing.save} over {plan.key === '12months' ? '12' : plan.key === '24months' ? '24' : '36'} months
                    </div>
                  </div>

                    <Button 
                    className={`w-full ${plan.buttonColor} text-white font-bold py-3 text-lg mb-6`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentType(plan.key);
                      // Update the current pricing data to match this plan before proceeding
                      setTimeout(() => handleSelectPlan(), 50); // Small delay to ensure state update
                    }}
                    disabled={loading}
                  >
                    {loading && isSelected ? 'Processing...' : 'Buy Now'}
                  </Button>

                  <div>
                    <h4 className="font-semibold mb-3">What's Covered:</h4>
                    <div className="space-y-2">
                      {coverageFeatures.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Optional Add-ons */}
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold">Optional Add-ons</h4>
                      <Info className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      {addOnOptions.map((addon) => (
                        <div key={addon.name} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Checkbox
                            id={`${plan.key}-${addon.name}`}
                            checked={selectedAddOns[plan.key][addon.name] || false}
                            onCheckedChange={() => toggleAddOn(addon.name, plan.key)}
                          />
                          <label htmlFor={`${plan.key}-${addon.name}`} className="flex-1 cursor-pointer text-sm">
                            {addon.name}
                          </label>
                          <span className="text-sm font-medium">£{addon.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warranty Plan Details */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Warranty Plan Details</span>
                      </div>
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View PDF <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Bottom Bar */}
        {isFloatingBarVisible && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">Choose your plan:</span>
                  <div className="flex gap-2">
                    {[
                      { 
                        key: '12months' as const, 
                        label: '1 Year', 
                        price: (() => {
                          const prices = { 0: 46, 50: 44, 100: 38, 150: 36, 200: 34, 250: 32, 300: 31, 400: 29, 500: 27 };
                          const basePrice = prices[voluntaryExcess as keyof typeof prices] || 44;
                          const addOnTotal = calculateAddOnTotal('12months');
                          return basePrice + Math.round(addOnTotal / 12);
                        })(), 
                        borderColor: 'border-slate-800', 
                        titleColor: 'text-slate-800' 
                      },
                      { 
                        key: '24months' as const, 
                        label: '2 Years', 
                        price: (() => {
                          const prices = { 0: 42, 50: 40, 100: 35, 150: 32, 200: 30, 250: 29, 300: 27, 400: 26, 500: 24 };
                          const basePrice = prices[voluntaryExcess as keyof typeof prices] || 40;
                          const addOnTotal = calculateAddOnTotal('24months');
                          return basePrice + Math.round(addOnTotal / 24);
                        })(), 
                        borderColor: 'border-yellow-400', 
                        titleColor: 'text-yellow-600', 
                        popular: true 
                      },
                      { 
                        key: '36months' as const, 
                        label: '3 Years', 
                        price: (() => {
                          const prices = { 0: 37, 50: 36, 100: 31, 150: 29, 200: 27, 250: 26, 300: 25, 400: 24, 500: 22 };
                          const basePrice = prices[voluntaryExcess as keyof typeof prices] || 36;
                          const addOnTotal = calculateAddOnTotal('36months');
                          return basePrice + Math.round(addOnTotal / 36);
                        })(), 
                        borderColor: 'border-orange-600', 
                        titleColor: 'text-orange-600' 
                      }
                    ].map((plan) => (
                      <button
                        key={plan.key}
                        onClick={() => setPaymentType(plan.key)}
                        className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentType === plan.key
                            ? `${plan.borderColor} bg-gray-50 shadow-lg scale-105`
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-bold">POPULAR</span>
                          </div>
                        )}
                        <div className={`font-semibold text-sm ${paymentType === plan.key ? plan.titleColor : 'text-gray-700'}`}>
                          {plan.label}
                        </div>
                        <div className="text-xs text-gray-600">£{plan.price}/mo</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleSelectPlan}
                  disabled={loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold shadow-lg"
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PricingTable;