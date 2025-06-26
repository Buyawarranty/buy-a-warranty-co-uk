
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, X, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PricingData {
  basic: { monthly: number; yearly: number; twoYear: number; threeYear: number; };
  gold: { monthly: number; yearly: number; twoYear: number; threeYear: number; };
  platinum: { monthly: number; yearly: number; twoYear: number; threeYear: number; };
}

interface PricingTableProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email?: string;
    phone?: string;
  };
  onBack: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'twoYear' | 'threeYear'>('monthly');
  const [contributionAmounts, setContributionAmounts] = useState<{[key: string]: number}>({
    basic: 0,
    gold: 0,
    platinum: 0
  });
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {[addon: string]: boolean}}>({
    basic: {},
    gold: {},
    platinum: {}
  });
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  // Pricing data based on your Excel sheet with extended options
  const pricingData: Record<number, PricingData> = {
    0: {
      basic: { monthly: 31, yearly: 381, twoYear: 725, threeYear: 1050 },
      gold: { monthly: 34, yearly: 409, twoYear: 777, threeYear: 1125 },
      platinum: { monthly: 36, yearly: 437, twoYear: 831, threeYear: 1200 }
    },
    50: {
      basic: { monthly: 29, yearly: 350, twoYear: 665, threeYear: 965 },
      gold: { monthly: 31, yearly: 377, twoYear: 717, threeYear: 1035 },
      platinum: { monthly: 32, yearly: 396, twoYear: 752, threeYear: 1088 }
    },
    100: {
      basic: { monthly: 25, yearly: 308, twoYear: 586, threeYear: 846 },
      gold: { monthly: 27, yearly: 336, twoYear: 638, threeYear: 921 },
      platinum: { monthly: 29, yearly: 354, twoYear: 672, threeYear: 969 }
    },
    150: {
      basic: { monthly: 23, yearly: 287, twoYear: 546, threeYear: 787 },
      gold: { monthly: 26, yearly: 315, twoYear: 598, threeYear: 862 },
      platinum: { monthly: 27, yearly: 333, twoYear: 632, threeYear: 910 }
    },
    200: {
      basic: { monthly: 23, yearly: 287, twoYear: 546, threeYear: 787 },
      gold: { monthly: 26, yearly: 315, twoYear: 598, threeYear: 862 },
      platinum: { monthly: 27, yearly: 333, twoYear: 632, threeYear: 910 }
    }
  };

  const getPlanPricing = (planId: string) => {
    const contributionAmount = contributionAmounts[planId];
    return pricingData[contributionAmount];
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId]).filter(Boolean).length;
    if (paymentType === 'monthly') {
      return Math.round((25 * selectedAddOnCount) / 12 * 100) / 100;
    } else if (paymentType === 'yearly') {
      return 25 * selectedAddOnCount;
    } else if (paymentType === 'twoYear') {
      return 50 * selectedAddOnCount;
    } else {
      return 75 * selectedAddOnCount;
    }
  };

  const toggleAddOn = (planId: string, addon: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [addon]: !prev[planId][addon]
      }
    }));
  };

  const setContributionAmount = (planId: string, amount: number) => {
    setContributionAmounts(prev => ({
      ...prev,
      [planId]: amount
    }));
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      color: '#0e3e87',
      features: [
        'Mechanical Breakdown Protection',
        'Labour up to £35 p/hr',
        '10 Claims per year',
        'Engine',
        'Manual Gearbox',
        'Automatic Transmission',
        'Torque Convertor',
        'Overdrive',
        'Differential',
        'Electrics',
        'Casings',
        'Recovery'
      ],
      addOns: ['Power Hood', 'ECU', 'Air Conditioning', 'Turbo']
    },
    {
      id: 'gold',
      name: 'Gold',
      color: '#f59e0b',
      popular: true,
      features: [
        'Mechanical & Electrical Breakdown Warranty',
        'Labour up to £75 p/hr',
        'Halfords MOT test',
        'Unlimited Claims',
        'Engine',
        'Manual Gearbox',
        'Automatic Transmission',
        'Overdrive',
        'Clutch',
        'Differential',
        'Torque Convertor',
        'Cooling System',
        'Fuel System',
        'Electricals',
        'Braking System',
        'Propshaft',
        'Casings',
        'Vehicle Hire',
        'Recovery',
        'European Cover'
      ],
      addOns: ['Power Hood', 'ECU', 'Air Conditioning', 'Turbo']
    },
    {
      id: 'platinum',
      name: 'Platinum',
      color: '#dc4f20',
      features: [
        'Mechanical & Electrical Breakdown',
        'Labour up to £100 p/hr',
        'Halfords MOT test',
        'Unlimited Claims',
        'Engine',
        'Turbo Unit',
        'Manual Gearbox',
        'Automatic Transmission',
        'Clutch',
        'Differential',
        'Drive Shafts',
        'Brakes',
        'Steering',
        'Suspension',
        'Bearings',
        'Cooling System',
        'Ventilation',
        'ECU',
        'Electrics',
        'Fuel System',
        'Air Conditioning',
        'Locks',
        'Seals',
        'Casings',
        'Vehicle Hire',
        'Vehicle Recovery',
        'European Cover'
      ],
      addOns: ['Power Hood']
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to purchase a warranty plan');
      // Redirect to auth page with return URL
      navigate('/auth?returnTo=' + encodeURIComponent(`/?plan=${planId}&payment=${paymentType}`));
      return;
    }

    setLoading(prev => ({ ...prev, [planId]: true }));
    
    try {
      console.log('Creating checkout session for:', planId, paymentType);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          paymentType
        }
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        toast.error('Failed to create checkout session');
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        toast.error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  // Create a comprehensive list of all possible features
  const allPossibleFeatures = [
    'Mechanical Breakdown Protection',
    'Mechanical & Electrical Breakdown Warranty',
    'Labour up to £35 p/hr',
    'Labour up to £75 p/hr',
    'Labour up to £100 p/hr',
    '10 Claims per year',
    'Halfords MOT test',
    'Unlimited Claims',
    'Engine',
    'Turbo Unit',
    'Manual Gearbox',
    'Automatic Transmission',
    'Torque Convertor',
    'Torque Converter',
    'Overdrive',
    'Clutch',
    'Differential',
    'Drive Shafts',
    'Brakes',
    'Steering',
    'Suspension',
    'Bearings',
    'Cooling System',
    'Ventilation',
    'E.C.U.',
    'Electrics',
    'Electricals',
    'Electricals (Extended)',
    'Fuel System',
    'Air Conditioning',
    'Braking System',
    'Propshaft',
    'Locks',
    'Seals',
    'Casings',
    'Vehicle Hire',
    'Recovery',
    'Vehicle Recovery',
    'European Cover'
  ];

  const getPaymentLabel = () => {
    switch (paymentType) {
      case 'monthly': return 'per month';
      case 'yearly': return 'per year';
      case 'twoYear': return 'for 2 years';
      case 'threeYear': return 'for 3 years';
      default: return 'per month';
    }
  };

  const getSavingsPercentage = () => {
    switch (paymentType) {
      case 'yearly': return '10%';
      case 'twoYear': return '15%';
      case 'threeYear': return '20%';
      default: return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-[#e8f4fb] w-full">
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

        {/* Header */}
        <div className="text-center mb-10 px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Warranty Quote
          </h1>
          
          {/* Vehicle Registration Plate Display */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-[520px] mx-auto flex items-center bg-[#ffdb00] text-gray-900 font-bold text-[28px] px-[25px] py-[18px] rounded-[6px] shadow-sm leading-tight border-2 border-black">
              <img 
                src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                alt="GB Flag" 
                className="w-[35px] h-[25px] mr-[15px] object-cover rounded-[2px]"
              />
              <div className="flex-1 text-center font-bold font-sans tracking-normal">
                {vehicleData.regNumber || 'H12 FXL'}
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8">
            Mileage: {parseInt(vehicleData.mileage).toLocaleString()} miles
          </p>
        </div>

        {/* Payment Period Toggle Group - Unified Box */}
        <div className="flex justify-center mb-12 px-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setPaymentType('monthly')}
                className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
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
                  className={`w-full px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                    paymentType === 'yearly' 
                      ? 'bg-[#1a365d] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Annual
                </button>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  10% OFF
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setPaymentType('twoYear')}
                  className={`w-full px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                    paymentType === 'twoYear' 
                      ? 'bg-[#1a365d] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  2 Years
                </button>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  15% OFF
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setPaymentType('threeYear')}
                  className={`w-full px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                    paymentType === 'threeYear' 
                      ? 'bg-[#1a365d] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  3 Years
                </button>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  20% OFF
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="w-full px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {plans.map((plan) => {
                const pricing = getPlanPricing(plan.id);
                const planPricing = pricing[plan.id as keyof PricingData];
                const basePrice = planPricing[paymentType];
                const addOnPrice = calculateAddOnPrice(plan.id);
                const totalPrice = basePrice + addOnPrice;
                const isLoading = loading[plan.id];
                
                return (
                  <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden relative border-2 ${plan.popular ? 'border-orange-400 shadow-xl' : 'border-gray-200'}`}>
                    {plan.popular && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          MOST POPULAR
                        </div>
                      </div>
                    )}
                    
                    {/* Plan Header */}
                    <div className="p-8 text-center bg-gray-50 border-b">
                      <h3 className="text-2xl font-bold mb-4" style={{ color: plan.color }}>
                        {plan.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">£</span>
                        <span className="text-5xl font-bold text-gray-900">{totalPrice}</span>
                        <div className="text-gray-600 text-lg">{getPaymentLabel()}</div>
                      </div>
                      {getSavingsPercentage() && (
                        <div className="text-green-600 font-semibold text-sm">
                          {getSavingsPercentage()} Saving
                        </div>
                      )}
                      <Button 
                        className="w-full mt-6 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                        style={{ backgroundColor: plan.color }}
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : `Select ${plan.name}`}
                      </Button>
                      {!user && (
                        <p className="text-xs text-gray-500 mt-2">
                          You'll be prompted to sign in
                        </p>
                      )}
                    </div>

                    {/* Features Section */}
                    <div className="p-6">
                      <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">What's Covered:</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {/* All plans now show only their specified features with ticks */}
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Voluntary Excess Section */}
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="font-bold text-gray-800">Voluntary Excess</h4>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">This is the amount you agree to pay toward a repair. A higher excess usually means a lower monthly cost.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[0, 50, 100, 150, 200].map((amount) => (
                            <Button
                              key={amount}
                              variant={contributionAmounts[plan.id] === amount ? "default" : "outline"}
                              onClick={() => setContributionAmount(plan.id, amount)}
                              className={`px-3 py-2 text-sm font-bold ${
                                contributionAmounts[plan.id] === amount 
                                  ? 'bg-[#224380] hover:bg-[#1a3460]' 
                                  : 'border-[#224380] text-[#224380] hover:bg-[#f0f8ff]'
                              }`}
                            >
                              £{amount}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons Section */}
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-semibold text-gray-700 mb-3 text-xs">Additional Components (Optional Add-ons - £25.00 per item p/year)</h4>
                        <div className="space-y-3">
                          {plan.addOns.map((addon, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedAddOns[plan.id][addon] || false}
                                onCheckedChange={() => toggleAddOn(plan.id, addon)}
                              />
                              <span className="text-sm text-gray-700">{addon}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-gray-500 px-8 pb-12">
          <div className="flex items-center justify-center gap-8 mb-4 text-base flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Approved by financial authorities</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>UK-based customer support</span>
            </div>
          </div>
          <p className="text-base">All prices include VAT. Terms and conditions apply.</p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PricingTable;
