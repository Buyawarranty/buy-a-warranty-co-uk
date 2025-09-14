import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ProtectedButton } from '@/components/ui/protected-button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus, Infinity, Zap, Car, Cog, Settings, Droplets, Cpu, Snowflake, Search, Users, RotateCcw, MapPin, X, Shield, Hash, Calendar, Gauge, Fuel, Edit, HelpCircle, Gift, ArrowRight, DollarSign, ShieldCheck, PartyPopper, CheckCircle, Crown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import AddOnProtectionPackages from '@/components/AddOnProtectionPackages';
import { validateVehicleEligibility, calculateVehiclePriceAdjustment, applyPriceAdjustment } from '@/lib/vehicleValidation';

type VehicleType = 'car' | 'motorbike' | 'phev' | 'hybrid' | 'ev';

const normalizeVehicleType = (raw?: string): VehicleType => {
  const v = (raw ?? '').toLowerCase().trim();
  if (['car','saloon','hatchback','estate','suv','van','truck','lorry','bus','coach'].includes(v)) return 'car';
  if (['motorbike', 'motorcycle', 'moped', 'scooter'].includes(v) || v === 'bike') return 'motorbike';
  if (v === 'phev' || v.includes('hybrid') || ['ev','electric'].includes(v)) return 'car';
  return 'car';
};

interface Plan {
  id: string;
  name: string;
  monthly_price: number;
  two_monthly_price: number | null;
  three_monthly_price: number | null;
  coverage: string[];
  add_ons: string[];
  is_active: boolean;
  pricing_matrix?: any;
  vehicle_type?: string;
}

interface UnifiedWarrantyStepsProps {
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
  onPlanSelected?: (planId: string, paymentType: string, planName?: string, pricingData?: {
    totalPrice: number, 
    monthlyPrice: number, 
    voluntaryExcess: number, 
    selectedAddOns: {[addon: string]: boolean}, 
    protectionAddOns?: {[key: string]: boolean},
    claimLimit?: number,
    installmentBreakdown?: {
      firstInstallment: number,
      standardInstallment: number,
      hasTransfer: boolean,
      transferAmount: number
    }
  }) => void;
}

const UnifiedWarrantySteps: React.FC<UnifiedWarrantyStepsProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('24months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedClaimLimit, setSelectedClaimLimit] = useState<number>(1250);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Protection add-ons state
  const [selectedProtectionAddOns, setSelectedProtectionAddOns] = useState<{[key: string]: boolean}>({
    breakdown: false,
    motRepair: false,
    tyre: false,
    wearTear: false,
    european: false,
    transfer: false
  });
  
  // Reliability score state
  const [reliabilityScore, setReliabilityScore] = useState<{
    score: number;
    tier: number;
    tierLabel: string;
    pricing: { [key: string]: number };
  } | null>(null);
  const [reliabilityLoading, setReliabilityLoading] = useState(false);

  // Normalize vehicle type once
  const vt = useMemo(() => normalizeVehicleType(vehicleData?.vehicleType), [vehicleData?.vehicleType]);
  
  // Vehicle validation
  const vehicleValidation = useMemo(() => {
    return validateVehicleEligibility(vehicleData);
  }, [vehicleData]);
  
  const vehiclePriceAdjustment = useMemo(() => {
    const warrantyYears = paymentType === '12months' ? 1 : 
                         paymentType === '24months' ? 2 : 3;
    
    let adjustment = calculateVehiclePriceAdjustment(vehicleData as any, warrantyYears);
    return adjustment;
  }, [vehicleData, paymentType]);

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
    let alive = true;
    setPlans([]);
    setPlansLoading(true);
    setPlansError(null);
    
    (async () => {
      try {
        const rows = await fetchPlansFor(vt);
        if (!alive) return;
        setPlans(rows);
      } catch (e: any) {
        if (!alive) return;
        console.error('Error fetching plans:', e);
        setPlansError('Failed to load pricing plans. Please try again.');
        toast.error('Failed to load pricing plans');
      } finally {
        if (alive) setPlansLoading(false);
      }
    })();
    
    return () => { alive = false; };
  }, [vt]);

  useEffect(() => {
    fetchPdfUrls();
  }, []);

  // Fetch reliability score when component loads
  useEffect(() => {
    if (vehicleData?.regNumber && vt === 'car') {
      fetchReliabilityScore();
    }
  }, [vehicleData?.regNumber, vehicleData?.mileage, vt]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const isNearBottom = scrollY + windowHeight >= documentHeight - 200;
      
      setIsFloatingBarVisible(scrollY > 400);
      
      if (summaryDismissed && isNearBottom && scrollY > lastScrollY) {
        setSummaryDismissed(false);
      }
      
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [summaryDismissed, lastScrollY]);

  // Reset summary dismissed state when user changes options
  useEffect(() => {
    setSummaryDismissed(false);
  }, [selectedClaimLimit, paymentType, voluntaryExcess, selectedProtectionAddOns]);

  // Server-side filtering function
  async function fetchPlansFor(vt: VehicleType): Promise<Plan[]> {
    if (vt === 'car') {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price');
      
      if (error) throw error;
      
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: Array.isArray(plan.add_ons) ? plan.add_ons.map(item => String(item)) : [],
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    } else {
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .eq('is_active', true)
        .eq('vehicle_type', vt === 'ev' ? 'electric' : vt)
        .order('monthly_price');
      
      if (error) throw error;
      
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: [],
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    }
  }

  const fetchPdfUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('plan_type, file_url, document_name')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const urlMap: {[planName: string]: string} = {};
        data.forEach(doc => {
          if (!urlMap[doc.plan_type]) {
            urlMap[doc.plan_type] = doc.file_url;
          }
        });
        setPdfUrls(urlMap);
      }
    } catch (error) {
      console.error('Error fetching PDF URLs:', error);
    }
  };

  const fetchReliabilityScore = async () => {
    if (!vehicleData?.regNumber) return;
    
    setReliabilityLoading(true);
    try {
      const mileageNumber = vehicleData.mileage ? 
        parseInt(vehicleData.mileage.replace(/,/g, '')) : undefined;
      
      const { data, error } = await supabase.functions.invoke('calculate-reliability-score', {
        body: { 
          registration: vehicleData.regNumber,
          mileage: mileageNumber
        }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setReliabilityScore(data.data);
      }
    } catch (error) {
      console.error('Error fetching reliability score:', error);
    } finally {
      setReliabilityLoading(false);
    }
  };

  // Get pricing data using unified pricing structure
  const getPricingData = (excess: number, claimLimit: number, paymentPeriod: string) => {
    // Check if this is a special vehicle type
    if (vt === 'motorbike' || vehicleData?.vehicleType === 'EV' || vehicleData?.vehicleType === 'PHEV') {
      // Special vehicle pricing (slightly higher due to specialized parts)
      const specialPricingTable = {
        '12months': {
          0: { 750: 520, 1250: 550, 2000: 640 },
          50: { 750: 490, 1250: 510, 2000: 600 },
          100: { 750: 440, 1250: 470, 2000: 560 },
          150: { 750: 420, 1250: 440, 2000: 530 }
        },
        '24months': {
          0: { 750: 990, 1250: 1030, 2000: 1120 },
          50: { 750: 920, 1250: 970, 2000: 1050 },
          100: { 750: 830, 1250: 880, 2000: 970 },
          150: { 750: 790, 1250: 830, 2000: 920 }
        },
        '36months': {
          0: { 750: 1440, 1250: 1490, 2000: 1590 },
          50: { 750: 1340, 1250: 1390, 2000: 1490 },
          100: { 750: 1190, 1250: 1270, 2000: 1370 },
          150: { 750: 1140, 1250: 1190, 2000: 1290 }
        }
      };
      const periodData = specialPricingTable[paymentPeriod as keyof typeof specialPricingTable] || specialPricingTable['12months'];
      const excessData = periodData[excess as keyof typeof periodData] || periodData[0];
      return excessData[claimLimit as keyof typeof excessData] || excessData[1250];
    }

    // Standard car pricing
    const pricingTable = {
      '12months': {
        0: { 750: 467, 1250: 497, 2000: 587 },
        50: { 750: 437, 1250: 457, 2000: 547 },
        100: { 750: 387, 1250: 417, 2000: 507 },
        150: { 750: 367, 1250: 387, 2000: 477 }
      },
      '24months': {
        0: { 750: 897, 1250: 937, 2000: 1027 },
        50: { 750: 827, 1250: 877, 2000: 957 },
        100: { 750: 737, 1250: 787, 2000: 877 },
        150: { 750: 697, 1250: 737, 2000: 827 }
      },
      '36months': {
        0: { 750: 1347, 1250: 1397, 2000: 1497 },
        50: { 750: 1247, 1250: 1297, 2000: 1397 },
        100: { 750: 1097, 1250: 1177, 2000: 1277 },
        150: { 750: 1047, 1250: 1097, 2000: 1197 }
      }
    };
    
    const periodData = pricingTable[paymentPeriod as keyof typeof pricingTable] || pricingTable['12months'];
    const excessData = periodData[excess as keyof typeof periodData] || periodData[0];
    return excessData[claimLimit as keyof typeof excessData] || excessData[1250];
  };

  const calculatePlanPrice = () => {
    const basePrice = getPricingData(voluntaryExcess, selectedClaimLimit, paymentType);
    const adjustedPrice = applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
    return adjustedPrice;
  };

  const getSelectedPlan = (): Plan | null => {
    return plans[0] || null;
  };

  const calculateAdjustedPriceForDisplay = (basePrice: number) => {
    return applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
  };

  const getPlanSavings = () => {
    if (paymentType === '12months') return null;
    
    const twelveMonthPrice = getPricingData(voluntaryExcess, selectedClaimLimit, '12months');
    const currentPrice = calculatePlanPrice();
    const monthlyEquivalent = currentPrice / (paymentType === '24months' ? 24 : 36);
    const monthlyTwelve = twelveMonthPrice / 12;
    
    const savings = Math.round((monthlyTwelve - monthlyEquivalent) * (paymentType === '24months' ? 24 : 36));
    return savings > 0 ? savings : 0;
  };

  const calculateAddOnPrice = (planId: string) => {
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    const planAddOnPrice = selectedAddOnCount * 2;
    
    const durationMonths = paymentType === '12months' ? 12 : 
                          paymentType === '24months' ? 24 : 
                          paymentType === '36months' ? 36 : 12;
    
    let protectionPrice = 0;
    if (selectedProtectionAddOns.breakdown) protectionPrice += 5 * durationMonths;
    if (selectedProtectionAddOns.motRepair) protectionPrice += 6 * durationMonths;
    if (selectedProtectionAddOns.tyre) protectionPrice += 5 * durationMonths;
    if (selectedProtectionAddOns.wearTear) protectionPrice += 5 * durationMonths;
    if (selectedProtectionAddOns.european) protectionPrice += 3 * durationMonths;
    if (selectedProtectionAddOns.transfer) protectionPrice += 30;
    
    return (planAddOnPrice * durationMonths) + protectionPrice;
  };

  const getVehicleTypeTitle = () => {
    switch (vehicleData.vehicleType) {
      case 'EV': return 'Electric Vehicle';
      case 'PHEV': return 'PHEV / Hybrid';
      case 'MOTORBIKE': return 'Motorbikes';
      default: return vehicleData.vehicleType || 'Vehicle';
    }
  };

  const handleSelectPlan = async () => {
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) return;
    
    setLoading(prev => ({ ...prev, [selectedPlan.id]: true }));
    
    try {
      const basePrice = calculatePlanPrice();
      
      const planAddOnCount = Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length;
      const planAddOnPrice = planAddOnCount * 2;
      
      const durationMonths = paymentType === '12months' ? 12 : 
                            paymentType === '24months' ? 24 : 
                            paymentType === '36months' ? 36 : 12;
      
      let recurringAddonTotal = 0;
      let oneTimeAddonTotal = 0;
      
      if (selectedProtectionAddOns.breakdown) recurringAddonTotal += 5;
      if (selectedProtectionAddOns.motRepair) recurringAddonTotal += 6;
      if (selectedProtectionAddOns.tyre) recurringAddonTotal += 5;
      if (selectedProtectionAddOns.wearTear) recurringAddonTotal += 5;
      if (selectedProtectionAddOns.european) recurringAddonTotal += 3;
      if (selectedProtectionAddOns.transfer) oneTimeAddonTotal += 30;
      
      const totalRecurringAddons = (planAddOnPrice + recurringAddonTotal) * durationMonths;
      const totalPrice = basePrice + totalRecurringAddons + oneTimeAddonTotal;
      const monthlyPrice = Math.round(totalPrice / durationMonths);
      
      const installmentBreakdown = {
        firstInstallment: Math.round(totalPrice / durationMonths) + oneTimeAddonTotal,
        standardInstallment: Math.round(totalPrice / durationMonths),
        hasTransfer: selectedProtectionAddOns.transfer,
        transferAmount: oneTimeAddonTotal
      };

      const pricingData = {
        totalPrice,
        monthlyPrice,
        voluntaryExcess,
        selectedAddOns: selectedAddOns[selectedPlan.id] || {},
        protectionAddOns: selectedProtectionAddOns,
        claimLimit: selectedClaimLimit,
        installmentBreakdown
      };
      
      const planName = selectedClaimLimit === 750 ? `${getVehicleTypeTitle()} Essential` :
                      selectedClaimLimit === 1250 ? `${getVehicleTypeTitle()} Advantage` :
                      `${getVehicleTypeTitle()} Elite`;
      
      if (onPlanSelected) {
        onPlanSelected(selectedPlan.id, paymentType, planName, pricingData);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Error selecting plan. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [selectedPlan?.id || '']: false }));
    }
  };

  if (plansLoading) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="text-center">Loading warranty plans...</div>
      </div>
    );
  }

  if (vehicleAgeError) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Eligible</h2>
            <p className="text-gray-600">{vehicleAgeError}</p>
          </div>
          <Button onClick={onBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (plansError || plans.length === 0) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="mb-4">{plansError || 'No warranty plans available for this vehicle type.'}</p>
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
        {/* Header */}
        <div className="mb-4 sm:mb-8 px-4 sm:px-8 pt-4 sm:pt-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <TrustpilotHeader />
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-10 px-4 sm:px-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">
            Your Warranty Quote
          </h1>
        </div>

        {/* Step 1: Vehicle Information */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Vehicle Information
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">REG</div>
                <div className="font-bold text-lg">{vehicleData.regNumber}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">PREMIUM LEAD</div>
                <div className="font-bold text-lg">{vehicleData.fuelType || 'PETROL'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">FUEL TYPE</div>
                <div className="font-bold text-lg">{vehicleData.fuelType || 'PETROL'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">MAKE</div>
                <div className="font-bold text-lg">{vehicleData.make || 'FORD'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">MILEAGE</div>
                <div className="font-bold text-lg">{parseInt(vehicleData.mileage).toLocaleString()} MILES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Your Excess Amount */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Your Excess Amount
              </h2>
            </div>
            
            <div className="flex justify-center gap-3">
              {[0, 50, 100, 150].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setVoluntaryExcess(amount)}
                  className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 min-w-[80px] ${
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

        {/* Step 3: Choose Your Claim Limit */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Your Claim Limit
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Essential Plan - £750 */}
              <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedClaimLimit === 750 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
              onClick={() => setSelectedClaimLimit(750)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-black">£750 cover</div>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  AdoCare Essential
                </div>
                <div className="text-orange-600 font-semibold mb-2">
                  10 claims per year
                </div>
                <div className="text-gray-600">
                  Confidence for the everyday drive.
                </div>
              </div>

              {/* Advantage Plan - £1,250 */}
              <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 relative ${
                selectedClaimLimit === 1250 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
              onClick={() => setSelectedClaimLimit(1250)}>
                <div className="absolute -top-2 right-4">
                  <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-black">£1,250 cover</div>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  AdoCare Advantage
                </div>
                <div className="text-green-600 font-semibold mb-2">
                  Unlimited claims
                </div>
                <div className="text-gray-600">
                  Premium support for every journey.
                </div>
              </div>

              {/* Elite Plan - £2,000 */}
              <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedClaimLimit === 2000 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
              onClick={() => setSelectedClaimLimit(2000)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-black">£2,000 cover</div>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  AdoCare Elite
                </div>
                <div className="text-green-600 font-semibold mb-2">
                  Unlimited claims
                </div>
                <div className="text-gray-600">
                  Top-tier cover for all road adventures.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Choose Warranty Duration and Price */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Warranty Duration and Price
              </h2>
            </div>

            {/* Payment Period Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-2xl p-1 shadow-lg border border-gray-200 inline-flex">
                <button
                  onClick={() => setPaymentType('12months')}
                  className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                    paymentType === '12months' 
                      ? 'bg-[#1a365d] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  12 Months
                </button>
                <div className="relative">
                  <button
                    onClick={() => setPaymentType('24months')}
                    className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                      paymentType === '24months' 
                        ? 'bg-[#1a365d] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    24 Months
                  </button>
                  {paymentType !== '24months' && (
                    <div className="absolute -top-3 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-3">
                      MOST POPULAR
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setPaymentType('36months')}
                    className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                      paymentType === '36months' 
                        ? 'bg-[#1a365d] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    36 Months
                  </button>
                  {paymentType !== '36months' && getPlanSavings() && (
                    <div className="absolute -top-3 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-3">
                      Save £{getPlanSavings()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1 Year */}
              <div className={`border-2 rounded-xl p-6 ${
                paymentType === '12months' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-gray-900 mb-2">1 Year</div>
                  <div className="text-sm text-gray-600 mb-2">Comprehensive Protection:</div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Same day claim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>All mechanical breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Choose your own garage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Claim whenever you want</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Save £0! VS 36 month</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">
                    £{getPricingData(voluntaryExcess, selectedClaimLimit, '12months')} cover
                  </div>
                  <div className="text-lg text-gray-600">
                    £{Math.round(getPricingData(voluntaryExcess, selectedClaimLimit, '12months') / 12)}/month
                  </div>
                </div>
              </div>

              {/* 2 Years */}
              <div className={`border-2 rounded-xl p-6 ${
                paymentType === '24months' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-gray-900 mb-2">2 Years</div>
                  <div className="text-sm text-gray-600 mb-2">Comprehensive Protection + Enhanced:</div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Same day claim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>All mechanical breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Choose your own garage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Claim whenever you want</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Save £0! VS 36 month</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">
                    £{calculatePlanPrice()} cover
                  </div>
                  <div className="text-lg text-gray-600">
                    £{Math.round(calculatePlanPrice() / 24)}/month
                  </div>
                </div>
              </div>

              {/* 3 Years */}
              <div className={`border-2 rounded-xl p-6 ${
                paymentType === '36months' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="text-center mb-4">
                  <div className="text-xl font-bold text-gray-900 mb-2">3 Years</div>
                  <div className="text-sm text-gray-600 mb-2">Comprehensive Protection + Max Savings:</div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Same day claim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>All mechanical breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Choose your own garage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Claim whenever you want</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Save £{getPlanSavings() || 54}! VS annual</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">
                    £{getPricingData(voluntaryExcess, selectedClaimLimit, '36months')} cover
                  </div>
                  <div className="text-lg text-gray-600">
                    £{Math.round(getPricingData(voluntaryExcess, selectedClaimLimit, '36months') / 36)}/month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Add-On Protection Packages */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold text-lg">
                5
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Add-On Protection Packages
              </h2>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              Enhance your warranty with optional protection covers.
            </p>

            <AddOnProtectionPackages 
              selectedAddOns={selectedProtectionAddOns}
              onAddOnChange={(addOnKey: string, selected: boolean) => {
                setSelectedProtectionAddOns(prev => ({
                  ...prev,
                  [addOnKey]: selected
                }));
              }}
              paymentType={paymentType}
            />
          </div>
        </div>

        {/* Continue Button */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">
                £{calculatePlanPrice() + calculateAddOnPrice(plans[0]?.id || '')} Total
              </div>
              <div className="text-lg text-gray-600 mb-6">
                £{Math.round((calculatePlanPrice() + calculateAddOnPrice(plans[0]?.id || '')) / (paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36))}/month installments
              </div>
              
              <ProtectedButton
                onClick={handleSelectPlan}
                disabled={loading[plans[0]?.id || ''] || !plans[0]}
                className="w-full max-w-md mx-auto bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg transition-all duration-200"
                actionType="plan_selection"
                sessionId={vehicleData.regNumber}
              >
                {loading[plans[0]?.id || ''] ? 'Processing...' : 'Continue to Payment'}
              </ProtectedButton>
            </div>
          </div>
        </div>

        {/* Floating Summary Bar */}
        {isFloatingBarVisible && !summaryDismissed && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSummaryDismissed(true)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                  <div className="font-bold text-lg">
                    {selectedClaimLimit === 750 ? 'Essential' : selectedClaimLimit === 1250 ? 'Advantage' : 'Elite'} - £{calculatePlanPrice() + calculateAddOnPrice(plans[0]?.id || '')}
                  </div>
                  <div className="text-sm text-gray-600">
                    £{Math.round((calculatePlanPrice() + calculateAddOnPrice(plans[0]?.id || '')) / (paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36))}/month • {paymentType === '12months' ? '12' : paymentType === '24months' ? '24' : '36'} months • £{voluntaryExcess} excess
                  </div>
                </div>
              </div>
              <ProtectedButton
                onClick={handleSelectPlan}
                disabled={loading[plans[0]?.id || ''] || !plans[0]}
                className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-3 px-6 rounded-xl"
                actionType="plan_selection"
                sessionId={vehicleData.regNumber}
              >
                {loading[plans[0]?.id || ''] ? 'Processing...' : 'Continue to Payment'}
              </ProtectedButton>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default UnifiedWarrantySteps;