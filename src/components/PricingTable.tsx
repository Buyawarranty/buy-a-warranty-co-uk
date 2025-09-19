import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ProtectedButton } from '@/components/ui/protected-button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus, Infinity, Zap, Car, Cog, Settings, Droplets, Cpu, Snowflake, Search, Users, RotateCcw, MapPin, X, Shield, Hash, Calendar, Gauge, Fuel, Edit, HelpCircle, Gift, ArrowRight, DollarSign, ShieldCheck, PartyPopper, CheckCircle, Crown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  // Only treat as motorbike if explicitly a motorbike/motorcycle, not if it just contains 'motor'
  if (['motorbike', 'motorcycle', 'moped', 'scooter'].includes(v) || v === 'bike') return 'motorbike';
  // Treat hybrid, phev, and electric vehicles the same as regular cars
  if (v === 'phev' || v.includes('hybrid') || ['ev','electric'].includes(v)) return 'car';
  return 'car'; // safe default
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

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  
  // Vehicle validation
  const vehicleValidation = useMemo(() => {
    return validateVehicleEligibility(vehicleData);
  }, [vehicleData]);
  
  const vehiclePriceAdjustment = useMemo(() => {
    const warrantyYears = paymentType === '12months' ? 1 : 
                         paymentType === '24months' ? 2 : 3;
    
    // Use ORIGINAL vehicleData for price adjustments to preserve motorbike detection
    let adjustment = calculateVehiclePriceAdjustment(vehicleData as any, warrantyYears);

    console.log('🚗 Vehicle Price Adjustment Calculation:', {
      vehicleData,
      originalVehicleType: vehicleData?.vehicleType,
      warrantyYears,
      paymentType,
      adjustment
    });
    return adjustment;
  }, [vehicleData, paymentType]);

  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  const [selectedClaimLimit, setSelectedClaimLimit] = useState<number>(1250);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Add-ons state
  const [selectedProtectionAddOns, setSelectedProtectionAddOns] = useState<{[key: string]: boolean}>({
    breakdown: false,
    motRepair: false,
    tyre: false,
    wearTear: false,
    european: false,
    transfer: false
  });
  
  // Benefits expansion state
  const [expandedBenefits, setExpandedBenefits] = useState<Record<string, boolean>>({});
  
  // Claim limit dialog state
  const [claimLimitDialogOpen, setClaimLimitDialogOpen] = useState<{[key: number]: boolean}>({
    750: false,
    1250: false,
    2000: false
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
    setPlans([]); // clear immediately so no leakage
    setPlansLoading(true);
    setPlansError(null);
    
    (async () => {
      try {
        const rows = await fetchPlansFor(vt);
        if (!alive) return;
        console.log(`🔍 Fetched ${rows.length} plans for ${vt}:`, rows);
        setPlans(rows);
      } catch (e: any) {
        if (!alive) return;
        console.error('💥 Error fetching plans:', e);
        setPlansError('Failed to load pricing plans. Please try again.');
        toast.error('Failed to load pricing plans');
      } finally {
        if (alive) setPlansLoading(false);
      }
    })();
    
    return () => { alive = false; };
  }, [vt]); // ONLY depends on normalized vt

  useEffect(() => {
    fetchPdfUrls();
  }, []);

  // Set selectedPlan when plans are loaded
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlan(plans[0]);
    }
  }, [plans, selectedPlan]);

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
      
      // Show floating bar when user scrolls past the initial pricing cards
      setIsFloatingBarVisible(scrollY > 400);
      
      // Reshow summary if dismissed and user scrolls to bottom
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

  // Server-side filtering function - now gets correct plan based on actual vehicle type
  async function fetchPlansFor(vt: VehicleType): Promise<Plan[]> {
    // Determine the correct vehicle type for the database query
    let dbVehicleType: string;
    
    // Map the normalized vehicle type to the actual vehicle characteristics
    const actualVehicleType = vehicleData?.vehicleType?.toLowerCase() || '';
    const vehicleMake = vehicleData?.make?.toLowerCase() || '';
    const vehicleModel = vehicleData?.model?.toLowerCase() || '';
    
    console.log('🔍 Vehicle Type Mapping:', {
      normalizedVt: vt,
      actualVehicleType,
      vehicleMake,
      vehicleModel,
      vehicleData
    });
    
    // Determine correct plan type based on actual vehicle characteristics
    // For motorbikes, use car plans but apply 50% discount via calculatePlanPrice()
    if (actualVehicleType.includes('motorbike') || actualVehicleType.includes('motorcycle') || actualVehicleType === 'bike') {
      dbVehicleType = 'car'; // Use car plans, discount applied in calculatePlanPrice()
    } else if (actualVehicleType.includes('van') || vehicleModel?.includes('transit') || vehicleModel?.includes('sprinter') || vehicleModel?.includes('crafter')) {
      dbVehicleType = 'van';
    } else if (actualVehicleType.includes('suv')) {
      dbVehicleType = 'suv';
    } else if (actualVehicleType.includes('electric') || actualVehicleType === 'ev') {
      dbVehicleType = 'electric';
    } else if (actualVehicleType.includes('hybrid') || actualVehicleType === 'phev') {
      dbVehicleType = 'hybrid';
    } else {
      // Default to car for cars, saloons, hatchbacks, estates, etc.
      dbVehicleType = 'car';
    }
    
    console.log(`🚗 Fetching plans for vehicle type: ${dbVehicleType}`);
    
    const { data, error } = await supabase
      .from('special_vehicle_plans')
      .select('*')
      .eq('is_active', true)
      .eq('vehicle_type', dbVehicleType)
      .order('monthly_price');
    
    if (error) {
      console.error('❌ Error fetching vehicle plans:', error);
      throw error;
    }
    
    console.log('✅ Vehicle plans fetched:', data?.length || 0, 'for type:', dbVehicleType);
    return (data || []).map(plan => ({
      ...plan,
      coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
      add_ons: [], // Plans don't have add-ons in this structure
      two_monthly_price: plan.two_yearly_price || null,
      three_monthly_price: plan.three_yearly_price || null
    }));
  }

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

  const fetchReliabilityScore = async () => {
    if (!vehicleData?.regNumber) return;
    
    setReliabilityLoading(true);
    try {
      console.log('Fetching reliability score for:', vehicleData.regNumber);
      
      const mileageNumber = vehicleData.mileage ? 
        parseInt(vehicleData.mileage.replace(/,/g, '')) : undefined;
      
      const { data, error } = await supabase.functions.invoke('calculate-reliability-score', {
        body: { 
          registration: vehicleData.regNumber,
          mileage: mileageNumber
        }
      });

      if (error) {
        console.error('Reliability score error:', error);
        throw error;
      }

      if (data?.success && data?.data) {
        console.log('Reliability score result:', data.data);
        setReliabilityScore(data.data);
      }
    } catch (error) {
      console.error('Error fetching reliability score:', error);
      // Don't show error to user, just continue with normal pricing
    } finally {
      setReliabilityLoading(false);
    }
  };

  // Get pricing data using your exact pricing structure
  const getPricingData = (excess: number, claimLimit: number, paymentPeriod: string) => {
    // Your exact pricing structure
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
    console.log('💰 calculatePlanPrice Debug:', {
      paymentType,
      voluntaryExcess,
      selectedClaimLimit,
      vehicleData,
      vehiclePriceAdjustment
    });
    
    // Use your exact pricing structure
    const basePrice = getPricingData(voluntaryExcess, selectedClaimLimit, paymentType);
    
    console.log('Found price in exact table:', { basePrice, voluntaryExcess, selectedClaimLimit, paymentType });
    
    // Apply vehicle adjustments (SUV/van, Range Rover, motorbike discount, etc.) to the base price
    const adjustedPrice = applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
    
    console.log('🏍️ Motorbike/Vehicle adjustment applied:', { 
      basePrice, 
      adjustedPrice, 
      adjustment: vehiclePriceAdjustment,
      vehicleType: vehicleData?.vehicleType,
      isMotorbike: vehiclePriceAdjustment.adjustmentType === 'motorbike_discount',
      discountApplied: basePrice !== adjustedPrice
    });
    
    return adjustedPrice;
  };

  // Get the plan that matches the selected claim limit
  const getSelectedPlan = (): Plan | null => {
    // Single Premium plan drives all claim limits; just return the first active plan
    return plans[0] || null;
  };

  const calculateAdjustedPriceForDisplay = (basePrice: number) => {
    return applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
  };

  const getMonthlyDisplayPrice = (totalPrice: number) => {
    const durationMonths = paymentType === '12months' ? 12 : 
                          paymentType === '24months' ? 24 : 
                          paymentType === '36months' ? 36 : 12;
    return Math.round(totalPrice / durationMonths);
  };

  const getPlanSavings = (plan: Plan) => {
    if (paymentType === '12months') return null;
    
    // Calculate savings compared to 12-month pricing
    const twelveMonthPrice = getPricingData(voluntaryExcess, selectedClaimLimit, '12months');
    const currentPrice = calculatePlanPrice();
    const monthlyEquivalent = currentPrice / (paymentType === '24months' ? 24 : 36);
    const monthlyTwelve = twelveMonthPrice / 12;
    
    const savings = Math.round((monthlyTwelve - monthlyEquivalent) * (paymentType === '24months' ? 24 : 36));
    return savings > 0 ? savings : 0;
  };

  const calculateAddOnPrice = (planId: string) => {
    // Original add-on price calculation for plan-specific add-ons
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    const planAddOnPrice = selectedAddOnCount * 2; // £2 per add-on per month
    
    // Get duration for calculations
    const durationMonths = paymentType === '12months' ? 12 : 
                          paymentType === '24months' ? 24 : 
                          paymentType === '36months' ? 36 : 12;
    
    // Protection package add-on prices (convert monthly to selected duration)
    let protectionPrice = 0;
    if (selectedProtectionAddOns.breakdown) protectionPrice += 5 * durationMonths; // £5/mo
    if (selectedProtectionAddOns.motRepair) protectionPrice += 6 * durationMonths; // £6/mo
    if (selectedProtectionAddOns.tyre) protectionPrice += 5 * durationMonths; // £5/mo
    if (selectedProtectionAddOns.wearAndTear) {
      // Use tiered pricing for wear and tear
      const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                               paymentType === '24months' ? 10.99 : 8.99;
      protectionPrice += wearAndTearPrice * durationMonths;
    }
    if (selectedProtectionAddOns.motFee) protectionPrice += 3 * durationMonths; // £3/mo
    if (selectedProtectionAddOns.lostKey) protectionPrice += 3 * durationMonths; // £3/mo
    if (selectedProtectionAddOns.consequential) protectionPrice += 5 * durationMonths; // £5/mo
    if (selectedProtectionAddOns.european) protectionPrice += 3 * durationMonths; // £3/mo
    if (selectedProtectionAddOns.transfer) protectionPrice += 30; // £30 one-time
    
    return (planAddOnPrice * durationMonths) + protectionPrice;
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

  const handleSelectPlan = async () => {
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) return;
    
    // Set loading state for this plan
    setLoading(prev => ({ ...prev, [selectedPlan.id]: true }));
    
    try {
      // Always use 12 months for initial plan calculation (step 3 -> step 4)
      const initialPaymentType = '12months';
      const durationMonths = 12;
      
      // Get base price for 1 year using the pricing matrix
      const basePrice = getPricingData(voluntaryExcess, selectedClaimLimit, initialPaymentType);
      
      // Calculate add-on prices for 1 year
      const planAddOnCount = Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length;
      const planAddOnPrice = planAddOnCount * 2; // £2 per add-on per month
      
      // Protection add-ons: Calculate for 1 year duration
      let recurringAddonTotal = 0; // Monthly add-ons (calculated for 1 year)  
      let oneTimeAddonTotal = 0;   // Transfer (one-time fee)
      
      if (selectedProtectionAddOns.breakdown) recurringAddonTotal += 6 * durationMonths; // £6/mo
      if (selectedProtectionAddOns.rental) recurringAddonTotal += 4 * durationMonths; // £4/mo
      if (selectedProtectionAddOns.tyre) recurringAddonTotal += 5 * durationMonths; // £5/mo
      if (selectedProtectionAddOns.wearAndTear) {
        const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                 paymentType === '24months' ? 10.99 : 8.99;
        recurringAddonTotal += wearAndTearPrice * durationMonths;
      }
      if (selectedProtectionAddOns.european) recurringAddonTotal += 3 * durationMonths; // £3/mo
      if (selectedProtectionAddOns.motRepair) recurringAddonTotal += 4 * durationMonths; // £4/mo
      if (selectedProtectionAddOns.motFee) recurringAddonTotal += 3 * durationMonths; // £3/mo
      if (selectedProtectionAddOns.lostKey) recurringAddonTotal += 3 * durationMonths; // £3/mo
      if (selectedProtectionAddOns.consequential) recurringAddonTotal += 5 * durationMonths; // £5/mo
      if (selectedProtectionAddOns.transfer) oneTimeAddonTotal += 30;
      
      // Calculate total price for 1 year with vehicle adjustments applied
      const adjustedBasePrice = applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
      const totalPrice = adjustedBasePrice + (planAddOnPrice * durationMonths) + recurringAddonTotal + oneTimeAddonTotal;
      
      // Don't allow progression if vehicle is too old
      if (vehicleAgeError) {
        toast.error(vehicleAgeError);
        return;
      }
      
      console.log('Selected plan pricing data for 1 year:', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        paymentType: initialPaymentType,
        basePrice,
        adjustedBasePrice,
        recurringAddonTotal,
        oneTimeAddonTotal,
        totalPrice,
        voluntaryExcess,
        selectedClaimLimit,
        selectedAddOns: selectedAddOns[selectedPlan.id],
        protectionAddOns: selectedProtectionAddOns
      });
      
      // Call onPlanSelected with the 1-year pricing data and selected options
      onPlanSelected?.(
        selectedPlan.id, 
        initialPaymentType, 
        selectedPlan.name,
        {
          totalPrice, // 1-year total price
          monthlyPrice: Math.round(totalPrice / 12), // 1-year monthly price
          voluntaryExcess,
          selectedAddOns: selectedAddOns[selectedPlan.id] || {},
          protectionAddOns: selectedProtectionAddOns,
          claimLimit: selectedClaimLimit
        }
      );
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [selectedPlan.id]: false }));
    }
  };

  const ensureCarOnly = () => plans;
  const displayPlans = ensureCarOnly();

  // Check for vehicle exclusions first
  if (!vehicleValidation.isValid) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Vehicle Not Eligible</h2>
            <p className="text-red-600 mb-6">{vehicleValidation.errorMessage}</p>
            <Button onClick={onBack} variant="outline" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (vehicleAgeError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Vehicle Age Restriction</h2>
            <p className="text-red-600 mb-6">{vehicleAgeError}</p>
            <Button onClick={onBack} variant="outline" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={onBack}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Trustpilot positioned outside grey box */}
        <div className="flex justify-end">
          <TrustpilotHeader className="h-8 sm:h-10" />
        </div>
        
        {/* Vehicle Information */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                1
              </div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </h2>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
              Change vehicle
            </Button>
          </div>
           
            {vehicleData && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
               <div className="flex items-center gap-2">
                 <Hash className="h-5 w-5 text-primary" />
                 <div>
                   <span className="text-muted-foreground block">Registration</span>
                   <span className="font-semibold text-foreground">{vehicleData.regNumber}</span>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Car className="h-5 w-5 text-primary" />
                 <div>
                   <span className="text-muted-foreground block">Vehicle</span>
                   <span className="font-semibold text-foreground">
                     {vehicleData.make} {vehicleData.model || 'Vehicle'}
                   </span>
                 </div>
               </div>
               {vehicleData.fuelType && (
                 <div className="flex items-center gap-2">
                   <Fuel className="h-5 w-5 text-primary" />
                   <div>
                     <span className="text-muted-foreground block">Fuel Type</span>
                     <span className="font-semibold text-foreground">{vehicleData.fuelType}</span>
                   </div>
                 </div>
               )}
               {vehicleData.year && (
                 <div className="flex items-center gap-2">
                   <Calendar className="h-5 w-5 text-primary" />
                   <div>
                     <span className="text-muted-foreground block">Year</span>
                     <span className="font-semibold text-foreground">{vehicleData.year}</span>
                   </div>
                 </div>
               )}
               <div className="flex items-center gap-2">
                 <Gauge className="h-5 w-5 text-primary" />
                 <div>
                   <span className="text-muted-foreground block">Mileage</span>
                   <span className="font-semibold text-foreground">{parseInt(vehicleData.mileage).toLocaleString()} miles</span>
                 </div>
                 </div>
                </div>
                
                {/* Warranty Eligibility - under a line */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-green-700 font-medium">Warranty cover available for your vehicle</span>
                  </div>
                </div>
              </>
             )}
        </div>

        {/* Choose Your Excess Amount */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Choose Your Excess Amount
            </h2>
          </div>
          
          <div className="flex gap-1.5 flex-wrap justify-start ml-11">
            {[0, 50, 100, 150].map((amount) => (
              <button
                key={amount}
                onClick={() => toggleVoluntaryExcess(amount)}
                className={`px-2.5 py-2 rounded-lg transition-all duration-200 text-center relative min-w-[50px] text-sm ${
                  voluntaryExcess === amount
                    ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                    : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                }`}
              >
                <div className="text-base font-bold text-black">£{amount}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Claim Limit Selection */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
              3
            </div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Choose Your Claim Limit
            </h2>
          </div>
          
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AutoCare Essential */}
            <div className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 750
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}>
              <button
                onClick={() => setSelectedClaimLimit(750)}
                className="w-full text-left"
              >
                <h4 className="text-xl font-bold text-foreground mb-2">AutoCare Essential</h4>
                <div className="text-2xl font-bold text-black mb-2">£750 per claim</div>
                <p className="text-sm font-medium text-foreground mb-4">Confidence for the everyday drive.</p>
              </button>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="essential-details" className="border-none">
                  <AccordionTrigger className="text-sm text-primary hover:text-primary/80 py-2 px-0 hover:no-underline">
                    <span className="flex items-center gap-2">
                      Read more
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs £750 or less:</p>
                          <p className="text-muted-foreground">You pay nothing – we cover the full cost of parts and labour.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs more than £750:</p>
                          <p className="text-muted-foreground">You simply pay the difference. For example, if the repair is £950, we cover £750 and you pay just £200.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Excess</span> is based on the option you choose – and there are no hidden fees. Just straightforward cover that helps you manage unexpected repair bills.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Nationwide</span> support and fast claims processing to get you back on the road quickly.</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* AutoCare Advantage */}
            <div className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 1250
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}>
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <button
                onClick={() => setSelectedClaimLimit(1250)}
                className="w-full text-left"
              >
                <h4 className="text-xl font-bold text-foreground mb-2">AutoCare Advantage</h4>
                <div className="text-2xl font-bold text-black mb-2">£1,250 per claim</div>
                <p className="text-sm font-medium text-foreground mb-4">Balanced protection for life's bigger bumps.</p>
              </button>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advantage-details" className="border-none">
                  <AccordionTrigger className="text-sm text-primary hover:text-primary/80 py-2 px-0 hover:no-underline">
                    <span className="flex items-center gap-2">
                      Read more
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs £1,250 or less:</p>
                          <p className="text-muted-foreground">You pay nothing – we cover the full cost of parts and labour.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs more than £1,250:</p>
                          <p className="text-muted-foreground">You simply pay the difference. For example, if the repair is £1,400, we cover £1,250 and you pay just £150.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Excess</span> is based on the option you choose – and there are no hidden fees. Just straightforward cover that helps you manage unexpected repair bills.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Nationwide</span> support and fast claims processing to get you back on the road quickly.</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* AutoCare Elite */}
            <div className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 2000
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}>
              <button
                onClick={() => setSelectedClaimLimit(2000)}
                className="w-full text-left"
              >
                <h4 className="text-xl font-bold text-foreground mb-2">AutoCare Elite</h4>
                <div className="text-2xl font-bold text-black mb-2">£2,000 per claim</div>
                <p className="text-sm font-medium text-foreground mb-4">Top-tier cover for total peace of mind.</p>
              </button>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="elite-details" className="border-none">
                  <AccordionTrigger className="text-sm text-primary hover:text-primary/80 py-2 px-0 hover:no-underline">
                    <span className="flex items-center gap-2">
                      Read more
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs £2,000 or less:</p>
                          <p className="text-muted-foreground">You pay nothing – we cover the full cost of parts and labour.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">If your repair costs more than £2,000:</p>
                          <p className="text-muted-foreground">You simply pay the difference. For example, if the repair is £2,200, we cover £2,000 and you pay just £200.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Excess</span> is based on the option you choose – and there are no hidden fees. Just straightforward cover that helps you manage unexpected repair bills.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground"><span className="font-semibold">Nationwide</span> support and fast claims processing to get you back on the road quickly.</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            </div>
        </div>

        {/* What's Covered Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-lg">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between mb-8 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    What's Covered?
                  </h2>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="mb-8">
                <p className="text-gray-600 text-base leading-relaxed">
                  Click on each vehicle type to see the complete list of covered components
                </p>
              </div>
              
              <div className="space-y-6">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Petrol & Diesel (Combustion Engine) Vehicles</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div className="space-y-3">
                      <div className="font-medium text-gray-800 mb-2">Engine & Powertrain Coverage:</div>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Engine & Internal Components (pistons, valves, camshafts, timing chains, seals, gaskets)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Gearbox / Transmission Systems (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Drivetrain & Clutch Assemblies (flywheel, driveshafts, differentials)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Turbocharger & Supercharger Units</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Fuel Delivery Systems (tanks, pumps, injectors, fuel rails, fuel control electronics)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div className="font-medium text-gray-800 mb-2">Systems & Electronics:</div>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Braking Systems (ABS, calipers, cylinders, master cylinders)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Suspension & Steering Systems (shocks, struts, steering racks, power steering)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Air Conditioning & Climate Control Systems</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Electrical Components & Charging Systems (alternators, starter motors, wiring)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Electronic Control Units (ECUs) & Sensors (engine management, ABS, emissions)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => document.getElementById('additional-information')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      Need more details? <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Hybrid & PHEV Vehicles</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-600 mb-4 italic">All petrol/diesel engine parts and labour plus:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Hybrid Drive Motors & ECUs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Hybrid Battery Failure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Power Control Units, Inverters & DC-DC Converters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Regenerative Braking Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>High-Voltage Cables & Connectors</span>
                      </li>
                    </ul>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Cooling Systems for Hybrid Components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Charging Ports & On-Board Charging Modules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Hybrid Transmission Components</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => document.getElementById('additional-information')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      Need more details? <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Electric vehicles (EVs)</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>EV Drive Motors & Reduction Gear</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>EV Transmission & Reduction Gearbox Assemblies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>High-Voltage Battery Failure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Power Control Units & Inverters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>On-Board Charger (OBC) & Charging Ports</span>
                      </li>
                    </ul>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>DC-DC Converters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Thermal Management Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>High-Voltage Cables & Connectors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>EV-Specific Control Electronics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Regenerative Braking System Components</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => document.getElementById('additional-information')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      Need more details? <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Motorcycles (Petrol, Hybrid, EV)</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Engine / Motor & Drivetrain Components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Gearbox / Transmission Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>ECUs, Sensors & Control Modules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Electrical Systems & Wiring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>High-Voltage Battery Failure (Hybrid & EV)</span>
                      </li>
                    </ul>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Suspension & Steering Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Braking Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Cooling & Thermal Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Lighting & Ignition Systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Instrumentation & Rider Controls</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => document.getElementById('additional-information')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      Need more details? <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Choose Warranty Duration */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
              4
            </div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Choose Your Warranty Duration and Price
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                id: '12months',
                title: '✅ 1-Year Cover',
                subtitle: '',
                description: 'Flexible protection for short-term cover',
                features: [
                  'All mechanical & electrical parts covered – no surprises, just solid protection',
                  'Up to 10 claims per policy – plenty of cover when you need it',
                  'Labour costs included – we\'ve got the work sorted',
                  'Fault diagnostics – we\'ll help find the problem fast',
                  'Consequential damage cover – if one part fails and causes another to break, you\'re still covered',
                  'Fast claims process – no drama, just quick resolutions',
                  '14-day money-back guarantee – change your mind? No problem',
                  'Optional extras available – tailor your cover to suit your needs'
                ],
                isPopular: false
              },
              {
                id: '24months',
                title: '⭐️ 2-Year Cover — Save £100 today',
                subtitle: 'Most Popular',
                description: 'Balanced Protection and Value',
                features: [
                  'All mechanical & electrical parts covered – no surprises, just solid protection',
                  'Unlimited claims per policy – plenty of cover when you need it',
                  'Labour costs included – we\'ve got the work sorted',
                  'Fault diagnostics – we\'ll help find the problem fast',
                  'Consequential damage cover – if one part fails and causes another to break, you\'re still covered',
                  'Fast claims process – no drama, just quick resolutions',
                  'MOT test fee – your MOT test fee is covered by us every time your vehicle is due for its MOT',
                  '24/7 Vehicle recovery – we\'ll reimburse the cost of roadside assistance through our breakdown recovery service, so you\'re never left stranded',
                  '14-day money-back guarantee – change your mind? No problem',
                  'Optional extras available – tailor your cover to suit your needs'
                ],
                isPopular: true
              },
              {
                id: '36months',
                title: '🏆 3-Year Cover — Save 20%',
                subtitle: 'Best Value',
                description: 'Extended cover for long-term peace of mind',
                features: [
                  'All mechanical & electrical parts covered – no surprises, just solid protection',
                  'Unlimited claims per policy – plenty of cover when you need it',
                  'Labour costs included – we\'ve got the work sorted',
                  'Fault diagnostics – we\'ll help find the problem fast',
                  'Consequential damage cover – if one part fails and causes another to break, you\'re still covered',
                  'Fast claims process – no drama, just quick resolutions',
                  'MOT test fee – your MOT test fee is covered by us every time your vehicle is due for its MOT',
                  '24/7 Vehicle recovery – we\'ll reimburse the cost of roadside assistance through our breakdown recovery service, so you\'re never left stranded',
                  'Vehicle rental cover – stay on the move even if your vehicle is undergoing repairs',
                  'Free transfer of warranty – a transferable warranty boosts buyer confidence, making your vehicle more attractive and potentially increasing its resale value',
                  '14-day money-back guarantee – change your mind? No problem',
                  'Optional extras available – tailor your cover to suit your needs'
                ],
                isPopular: false
              }
            ].map((option) => {
              const basePrice = getPricingData(voluntaryExcess, selectedClaimLimit, option.id);
              const adjustedPrice = applyPriceAdjustment(basePrice, vehiclePriceAdjustment);
              const durationMonths = option.id === '12months' ? 12 : option.id === '24months' ? 24 : 36;
              
              // Calculate add-on costs for this duration
              const selectedPlan = getSelectedPlan();
              const planAddOnCount = selectedPlan ? Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length : 0;
              const planAddOnPrice = planAddOnCount * 2 * durationMonths;
              
              let protectionAddOnPrice = 0;
              if (selectedProtectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths;
              if (selectedProtectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths;
              if (selectedProtectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths;
              if (selectedProtectionAddOns.wearAndTear) {
                const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                         paymentType === '24months' ? 10.99 : 8.99;
                protectionAddOnPrice += wearAndTearPrice * durationMonths;
              }
              if (selectedProtectionAddOns.european) protectionAddOnPrice += 3 * durationMonths;
              if (selectedProtectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths;
              if (selectedProtectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths;
              if (selectedProtectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths;
              if (selectedProtectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths;
              if (selectedProtectionAddOns.transfer) protectionAddOnPrice += 30;
              
              const totalPrice = adjustedPrice + planAddOnPrice + protectionAddOnPrice;
              const monthlyPrice = Math.round(totalPrice / 12); // Always use 12 months for monthly calculation
              
              return (
                <div
                  key={option.id}
                  onClick={() => setPaymentType(option.id as '12months' | '24months' | '36months')}
                   className={`relative p-4 sm:p-6 rounded-lg transition-all duration-200 text-left w-full cursor-pointer ${
                     paymentType === option.id 
                       ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                       : 'bg-white border border-gray-200 shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                   }`}
                 >
                   {/* Save Percentage Ribbon */}
                   {(option.id === '24months' || option.id === '36months') && (
                     <div className="absolute top-2 right-2 bg-gradient-to-br from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                       {option.id === '24months' ? 'Save £100 today' : 'Save £200 Today'}
                     </div>
                   )}

                  {/* Badge Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {option.id === '12months' && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        STARTER
                      </span>
                    )}
                    {option.isPopular && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    )}
                    {option.id === '36months' && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        BEST VALUE
                      </span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <div className="mb-4">
                    <h4 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                      {option.title.split(' — ')[0]}
                    </h4>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {(expandedBenefits[option.id] ? option.features : option.features.slice(0, 4)).map((feature, index) => (
                      <div key={index} className="flex items-start text-xs text-gray-600">
                        <Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {option.features.length > 4 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedBenefits(prev => ({
                            ...prev,
                            [option.id]: !prev[option.id]
                          }));
                        }}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors mt-2"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expandedBenefits[option.id] ? 'rotate-180' : ''}`} />
                        {expandedBenefits[option.id] 
                          ? 'Show less' 
                          : `+${option.features.length - 4} more benefits`
                        }
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    {option.id === '12months' && (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          Protect your vehicle for just £{monthlyPrice}/month
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✔</span>
                            <span>Total cost: £{totalPrice}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✔</span>
                            <span>12 easy, interest-free payments</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✔</span>
                            <span>Affordable peace of mind for the year ahead</span>
                          </div>
                        </div>
                      </>
                    )}
                    {option.id === '24months' && (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          🛡️ 2-year protection for only £{totalPrice} – Save £100 Today
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-blue-500">💡</span>
                            <span>12 easy interest-free payments</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✔</span>
                            <span>Nothing to pay in year 2 – full cover, no payments</span>
                          </div>
                        </div>
                      </>
                    )}
                    {option.id === '36months' && (
                      <>
                        <div className="text-lg font-bold text-gray-900">
                          🛡️ 3-year protection for only £{totalPrice} – Save £200
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-blue-500">💡</span>
                            <span>12 easy interest-free payments</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold">✔</span>
                            <span>Nothing to pay in year 2 & 3 – full cover, no payments</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              🔍 Do we actually pay out claims?
            </h3>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              It's a fair question - and the answer is yes. We genuinely value our customers, and when something goes wrong, we don't look for loopholes. We look for reasons to say yes.
            </p>
            <p className="text-base text-muted-foreground font-medium">
              With easy-to-follow terms, we're committed to giving you reliable protection and peace of mind.
            </p>
          </div>
        </div>

        {/* Add-On Protection Packages */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
              5
            </div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Add-On Protection Packages
            </h3>
          </div>
          <div className="text-center mb-8">
            <p className="text-muted-foreground">Enhance your warranty with optional protection covers</p>
          </div>
          <AddOnProtectionPackages 
            selectedAddOns={selectedProtectionAddOns}
            paymentType={paymentType}
            onAddOnChange={(addOnKey, selected) => 
              setSelectedProtectionAddOns(prev => ({ ...prev, [addOnKey]: selected }))
            }
          />
        </div>

        {/* Additional Information Section */}
        <div id="additional-information" className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              📄 Additional Information
            </h3>
            <p className="text-muted-foreground">
              Discover everything the Platinum Plan offers and any limitations - click below for complete details and feel confident in your cover.
            </p>
          </div>
          
          <div className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Terms and Conditions</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Please refer to the complete Terms and Conditions document for full coverage details, exclusions, and limitations. 
                    This document contains important information about your warranty coverage, claims procedures, and your rights and obligations.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors">
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                <span>Platinum Plan Details</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 pl-7">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    The Platinum Plan provides comprehensive coverage for your vehicle's mechanical and electrical components. 
                    Key features include:
                  </p>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Unlimited claims throughout the warranty period</li>
                    <li>• All labour costs included</li>
                    <li>• Fast fault diagnostics</li>
                    <li>• Consequential damage protection</li>
                    <li>• 24/7 breakdown recovery service</li>
                    <li>• MOT test fee coverage</li>
                    <li>• 14-day money-back guarantee</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

      </div>

      {/* Continue Button */}
      {!plansLoading && !plansError && !vehicleAgeError && displayPlans.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex justify-end mt-8">
            <div className="flex flex-col items-end space-y-2">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total warranty cost</div>
                <div className="text-xl font-bold text-foreground">
                  £{(() => {
                    if (!selectedPlan) return '0';
                    
                    // Use calculatePlanPrice() which applies vehicle adjustments (including 50% motorbike discount)
                    const adjustedPrice = calculatePlanPrice();
                    
                    // Add plan add-ons
                    const durationMonths = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
                    let planAddOnPrice = 0;
                    const planAddOns = selectedAddOns[selectedPlan.id] || {};
                    if (planAddOns.tyre) planAddOnPrice += 5 * durationMonths;
                    if (planAddOns.wearAndTear) {
                      const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                               paymentType === '24months' ? 10.99 : 8.99;
                      planAddOnPrice += wearAndTearPrice * durationMonths;
                    }
                    if (planAddOns.european) planAddOnPrice += 3 * durationMonths;
                    if (planAddOns.breakdown) planAddOnPrice += 6 * durationMonths;
                    if (planAddOns.rental) planAddOnPrice += 4 * durationMonths;
                    if (planAddOns.transfer) planAddOnPrice += 30;
                    
                    // Add protection add-ons
                    let protectionAddOnPrice = 0;
                    if (selectedProtectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths;
                    if (selectedProtectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths;
                    if (selectedProtectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths;
                    if (selectedProtectionAddOns.wearAndTear) {
                      const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                               paymentType === '24months' ? 10.99 : 8.99;
                      protectionAddOnPrice += wearAndTearPrice * durationMonths;
                    }
                    if (selectedProtectionAddOns.european) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths;
                    if (selectedProtectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths;
                    if (selectedProtectionAddOns.transfer) protectionAddOnPrice += 30;
                    
                    const totalPrice = adjustedPrice + planAddOnPrice + protectionAddOnPrice;
                    
                    return totalPrice;
                  })()}
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    • £{(() => {
                      if (!selectedPlan) return '0';
                      
                      // Use calculatePlanPrice() which applies vehicle adjustments (including 50% motorbike discount)
                      const adjustedPrice = calculatePlanPrice();
                      
                      // Add plan add-ons
                      const durationMonths = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
                      let planAddOnPrice = 0;
                      const planAddOns = selectedAddOns[selectedPlan.id] || {};
                      if (planAddOns.tyre) planAddOnPrice += 5 * durationMonths;
                      if (planAddOns.wearAndTear) {
                        const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                                 paymentType === '24months' ? 10.99 : 8.99;
                        planAddOnPrice += wearAndTearPrice * durationMonths;
                      }
                      if (planAddOns.european) planAddOnPrice += 3 * durationMonths;
                      if (planAddOns.breakdown) planAddOnPrice += 6 * durationMonths;
                      if (planAddOns.rental) planAddOnPrice += 4 * durationMonths;
                      if (planAddOns.transfer) planAddOnPrice += 30;
                      
                      // Add protection add-ons
                      let protectionAddOnPrice = 0;
                      if (selectedProtectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths;
                      if (selectedProtectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths;
                      if (selectedProtectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths;
                      if (selectedProtectionAddOns.wearAndTear) {
                        const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                                 paymentType === '24months' ? 10.99 : 8.99;
                        protectionAddOnPrice += wearAndTearPrice * durationMonths;
                      }
                      if (selectedProtectionAddOns.european) protectionAddOnPrice += 3 * durationMonths;
                      if (selectedProtectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths;
                      if (selectedProtectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths;
                      if (selectedProtectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths;
                      if (selectedProtectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths;
                      if (selectedProtectionAddOns.transfer) protectionAddOnPrice += 30;
                      
                      const totalPrice = adjustedPrice + planAddOnPrice + protectionAddOnPrice;
                      return Math.round(totalPrice / 12); // Always use 12 months for monthly calculation
                    })()} /month
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSelectPlan}
                size="lg"
                className="text-lg font-semibold px-12 py-3"
              >
                Continue to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Total Bar */}
      {!plansLoading && !plansError && !vehicleAgeError && displayPlans.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Total warranty cost</div>
              <div className="text-xl font-bold text-foreground">
                £{(() => {
                  if (!selectedPlan) return '0';
                  
                  // Use calculatePlanPrice() which applies vehicle adjustments (including 50% motorbike discount)
                  const adjustedPrice = calculatePlanPrice();
                  
                  // Add plan add-ons
                  const durationMonths = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
                  let planAddOnPrice = 0;
                  const planAddOns = selectedAddOns[selectedPlan.id] || {};
                  if (planAddOns.tyre) planAddOnPrice += 5 * durationMonths;
                  if (planAddOns.wearAndTear) {
                    const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                             paymentType === '24months' ? 10.99 : 8.99;
                    planAddOnPrice += wearAndTearPrice * durationMonths;
                  }
                  if (planAddOns.european) planAddOnPrice += 3 * durationMonths;
                  if (planAddOns.breakdown) planAddOnPrice += 6 * durationMonths;
                  if (planAddOns.rental) planAddOnPrice += 4 * durationMonths;
                  if (planAddOns.transfer) planAddOnPrice += 30;
                  
                  // Add protection add-ons
                  let protectionAddOnPrice = 0;
                  if (selectedProtectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths;
                  if (selectedProtectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths;
                  if (selectedProtectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths;
                  if (selectedProtectionAddOns.wearAndTear) {
                    const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                             paymentType === '24months' ? 10.99 : 8.99;
                    protectionAddOnPrice += wearAndTearPrice * durationMonths;
                  }
                  if (selectedProtectionAddOns.european) protectionAddOnPrice += 3 * durationMonths;
                  if (selectedProtectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths;
                  if (selectedProtectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths;
                  if (selectedProtectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths;
                  if (selectedProtectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths;
                  if (selectedProtectionAddOns.transfer) protectionAddOnPrice += 30;
                  
                  const totalPrice = adjustedPrice + planAddOnPrice + protectionAddOnPrice;
                  
                  return totalPrice;
                })()}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  • £{(() => {
                    if (!selectedPlan) return '0';
                    
                    // Use calculatePlanPrice() which applies vehicle adjustments (including 50% motorbike discount)
                    const adjustedPrice = calculatePlanPrice();
                    
                    // Add plan add-ons
                    const durationMonths = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
                    let planAddOnPrice = 0;
                    const planAddOns = selectedAddOns[selectedPlan.id] || {};
                    if (planAddOns.tyre) planAddOnPrice += 5 * durationMonths;
                    if (planAddOns.wearAndTear) {
                      const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                               paymentType === '24months' ? 10.99 : 8.99;
                      planAddOnPrice += wearAndTearPrice * durationMonths;
                    }
                    if (planAddOns.european) planAddOnPrice += 3 * durationMonths;
                    if (planAddOns.breakdown) planAddOnPrice += 6 * durationMonths;
                    if (planAddOns.rental) planAddOnPrice += 4 * durationMonths;
                    if (planAddOns.transfer) planAddOnPrice += 30;
                    
                    // Add protection add-ons
                    let protectionAddOnPrice = 0;
                    if (selectedProtectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths;
                    if (selectedProtectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths;
                    if (selectedProtectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths;
                    if (selectedProtectionAddOns.wearAndTear) {
                      const wearAndTearPrice = paymentType === '12months' ? 12.99 : 
                                               paymentType === '24months' ? 10.99 : 8.99;
                      protectionAddOnPrice += wearAndTearPrice * durationMonths;
                    }
                    if (selectedProtectionAddOns.european) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths;
                    if (selectedProtectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths;
                    if (selectedProtectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths;
                    if (selectedProtectionAddOns.transfer) protectionAddOnPrice += 30;
                    
                    const totalPrice = adjustedPrice + planAddOnPrice + protectionAddOnPrice;
                    return Math.round(totalPrice / 12); // Always use 12 months for monthly calculation
                  })()} /month
                </span>
              </div>
            </div>
            <Button
              onClick={handleSelectPlan}
              size="lg"
              className="text-lg font-semibold px-8 py-3 bg-primary hover:bg-primary/90"
            >
              Continue to Pay
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingTable;