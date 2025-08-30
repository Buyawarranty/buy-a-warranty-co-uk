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
  const [selectedAddOns, setSelectedAddOns] = useState<{[addon: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
  const [reliabilityTier, setReliabilityTier] = useState<string | null>(null);
  const [reliabilityLoading, setReliabilityLoading] = useState(false);

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

  const fetchPdfUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('file_url')
        .eq('plan_type', 'Warranty')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPdfUrl(data.file_url);
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
      }
    } catch (error) {
      console.error('Error calculating reliability:', error);
    } finally {
      setReliabilityLoading(false);
    }
  };

  const getPricingData = () => {
    // Enhanced pricing structure with more excess options
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

  const calculateAddOnTotal = () => {
    return Object.entries(selectedAddOns)
      .filter(([_, selected]) => selected)
      .reduce((total, [addonName]) => {
        const addon = addOnOptions.find(a => a.name === addonName);
        return total + (addon?.price || 0);
      }, 0);
  };

  const toggleAddOn = (addonName: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addonName]: !prev[addonName]
    }));
  };

  const handleSelectPlan = async () => {
    setLoading(true);
    
    try {
      const pricing = getPricingData();
      const addOnTotal = calculateAddOnTotal();
      const totalPrice = pricing.total + addOnTotal;
      const monthlyPrice = pricing.monthly + Math.round(addOnTotal / 12);
      
      const pricingData = {
        totalPrice,
        monthlyPrice,
        voluntaryExcess,
        selectedAddOns
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

        {/* Reliability Score Display */}
        {reliabilityScore !== null && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Vehicle Reliability Score
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {reliabilityScore}
                  <span className="text-lg text-gray-500">/100</span>
                </div>
                {reliabilityTier && (
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-sm">
                    {reliabilityTier}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                This score reflects your vehicle's reliability based on MOT history and helps determine pricing.
              </p>
            </div>
          </div>
        )}

        {/* Voluntary Excess Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Voluntary Excess Amount</h2>
          <div className="flex justify-center gap-2 flex-wrap">
            {excessOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => setVoluntaryExcess(option.amount)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  voluntaryExcess === option.amount
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
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
              subtitle: '12 month warranty',
              bgColor: 'bg-slate-700',
              buttonColor: 'bg-slate-700 hover:bg-slate-800',
              textColor: 'text-white'
            },
            { 
              key: '24months' as const, 
              title: 'Gold', 
              subtitle: '24 month warranty',
              bgColor: 'bg-yellow-500',
              buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
              textColor: 'text-white',
              mostPopular: true
            },
            { 
              key: '36months' as const, 
              title: 'Platinum', 
              subtitle: '36 month warranty',
              bgColor: 'bg-orange-500',
              buttonColor: 'bg-orange-500 hover:bg-orange-600',
              textColor: 'text-white'
            }
          ].map((plan) => {
            const isSelected = paymentType === plan.key;
            
            // Calculate specific pricing for this plan period
            const planPricing = (() => {
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

            return (
              <div key={plan.key} className="relative">
                {plan.mostPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-yellow-500 text-white px-3 py-1 text-xs font-bold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <div className={`${plan.bgColor} ${plan.textColor} rounded-xl p-6 h-full ${isSelected ? 'ring-4 ring-blue-400' : ''} cursor-pointer transition-all duration-200 hover:shadow-xl`}
                     onClick={() => setPaymentType(plan.key)}>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                    <p className="text-sm opacity-90">{plan.subtitle}</p>
                    
                    <div className="mt-6">
                      <div className="text-3xl font-bold">
                        £{planPricing.monthly}/mo
                      </div>
                      <p className="text-sm text-green-300 font-medium mt-1">
                        for {plan.key === '12months' ? '12' : plan.key === '24months' ? '24' : '36'} months interest free
                      </p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Pay Full Amount</span>
                      <span className="text-sm text-green-300">
                        Save 5% (£{planPricing.save})
                      </span>
                    </div>
                    <div className="text-xl font-bold text-blue-200">
                      £{planPricing.total} upfront
                    </div>
                    <div className="text-xs opacity-80">
                      Instead of £{planPricing.total + planPricing.save} over {plan.key === '12months' ? '12' : plan.key === '24months' ? '24' : '36'} months
                    </div>
                  </div>

                  <Button 
                    className={`w-full ${plan.buttonColor} text-white font-bold py-3 text-lg mb-6`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentType(plan.key);
                      handleSelectPlan();
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
                          <Check className="h-4 w-4 text-green-300 flex-shrink-0" />
                          <span className="opacity-90">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Add-ons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Optional Add-ons</h3>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addOnOptions.map((addon) => (
              <div key={addon.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id={addon.name}
                  checked={selectedAddOns[addon.name] || false}
                  onCheckedChange={() => toggleAddOn(addon.name)}
                />
                <label htmlFor={addon.name} className="flex-1 cursor-pointer text-sm">
                  {addon.name}
                </label>
                <span className="text-sm font-medium">£{addon.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Plan Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Warranty Plan Details</span>
          </div>
          <div className="text-sm text-blue-600">
            Full breakdown of coverage
          </div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors mt-2"
            >
              View PDF <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingTable;