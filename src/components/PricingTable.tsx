
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, X, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'twoYear' | 'threeYear'>('monthly');
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {[addon: string]: boolean}}>({
    basic: {},
    gold: {},
    platinum: {}
  });

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

  const getCurrentPricing = () => pricingData[contributionAmount];

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

  const handleSelectPlan = (planId: string) => {
    console.log('Selected plan:', planId, 'for vehicle:', vehicleData.regNumber);
  };

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

  const handleNextToPlans = () => {
    setWizardStep(2);
  };

  const handleBackToContribution = () => {
    setWizardStep(1);
  };

  return (
    <div className="min-h-screen bg-[#e8f4fb] w-full">
      {/* Back Button */}
      <div className="mb-8 px-8 pt-8">
        <Button 
          variant="outline" 
          onClick={wizardStep === 1 ? onBack : handleBackToContribution}
          className="flex items-center gap-2 hover:bg-white text-lg px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          {wizardStep === 1 ? 'Back to Contact Details' : 'Back to Contribution'}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-10 px-8">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              wizardStep === 1 ? 'bg-[#224380] text-white' : wizardStep === 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {wizardStep === 2 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className={`ml-2 text-sm font-medium ${wizardStep === 1 ? 'text-[#224380]' : wizardStep === 2 ? 'text-green-600' : 'text-gray-500'}`}>
              Choose Contribution
            </span>
          </div>
          
          {/* Connector Line */}
          <div className={`w-16 h-1 rounded ${wizardStep === 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              wizardStep === 2 ? 'bg-[#224380] text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${wizardStep === 2 ? 'text-[#224380]' : 'text-gray-500'}`}>
              Choose Plan
            </span>
          </div>
        </div>
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

      {wizardStep === 1 ? (
        /* Step 1: Contribution Selection */
        <div className="max-w-4xl mx-auto px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Choose Your Contribution</h2>
            <p className="text-lg text-gray-600">Choose your excess contribution – affects your monthly premium</p>
          </div>

          {/* Contribution Amount Selector */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex flex-wrap justify-center gap-6">
              {[0, 50, 100, 150, 200].map((amount) => (
                <Button
                  key={amount}
                  variant={contributionAmount === amount ? "default" : "outline"}
                  onClick={() => setContributionAmount(amount)}
                  className={`px-12 py-6 text-2xl font-bold ${
                    contributionAmount === amount 
                      ? 'bg-[#224380] hover:bg-[#1a3460]' 
                      : 'border-[#224380] text-[#224380] hover:bg-[#f0f8ff]'
                  }`}
                >
                  £{amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Period Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setPaymentType('monthly')}
                  className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
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
                    className={`w-full px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
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
                    className={`w-full px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
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
                    className={`w-full px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
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

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleNextToPlans}
              className="bg-[#224380] hover:bg-[#1a3460] text-white font-bold py-4 px-12 text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              Continue to Plans
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Step 2: Plan Selection */
        <div className="w-full px-8 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">Selected contribution: £{contributionAmount} • {getPaymentLabel()}</p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {plans.map((plan) => {
                const pricing = getCurrentPricing();
                const planPricing = pricing[plan.id as keyof PricingData];
                const basePrice = planPricing[paymentType];
                const addOnPrice = calculateAddOnPrice(plan.id);
                const totalPrice = basePrice + addOnPrice;
                
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
                        className="w-full mt-6 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        style={{ backgroundColor: plan.color }}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        Select {plan.name}
                      </Button>
                    </div>

                    {/* Features Section */}
                    <div className="p-6">
                      <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">What's Covered:</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
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
      )}

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
  );
};

export default PricingTable;
