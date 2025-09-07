import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus, Infinity, Zap, Car, Cog, Settings, Droplets, Cpu, Snowflake, Search, Users, RotateCcw, MapPin, X, Shield, Hash, Calendar, Gauge, Fuel, Edit, HelpCircle, Gift, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import AddOnProtectionPackages from '@/components/AddOnProtectionPackages';

type VehicleType = 'car' | 'motorbike' | 'phev' | 'hybrid' | 'ev';

const normalizeVehicleType = (raw?: string): VehicleType => {
  const v = (raw ?? '').toLowerCase().trim();
  if (['car','saloon','hatchback','estate','suv'].includes(v)) return 'car';
  if (v.includes('motor') || v.includes('bike')) return 'motorbike';
  if (v === 'phev') return 'phev';
  if (v.includes('hybrid')) return 'hybrid';
  if (['ev','electric'].includes(v)) return 'ev';
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
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('24months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  const [selectedClaimLimit, setSelectedClaimLimit] = useState<number>(1250);
  
  // Add-ons state
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

  // Fetch reliability score when component loads
  useEffect(() => {
    if (vehicleData?.regNumber && vt === 'car') {
      fetchReliabilityScore();
    }
  }, [vehicleData?.regNumber, vehicleData?.mileage, vt]);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar when user scrolls past the initial pricing cards
      const scrollY = window.scrollY;
      setIsFloatingBarVisible(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Server-side filtering function
  async function fetchPlansFor(vt: VehicleType): Promise<Plan[]> {
    if (vt === 'car') {
      console.log('🚗 Fetching standard car plans: All plans for claim limits');
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .in('name', ['Basic', 'Gold', 'Platinum'])
        .order('monthly_price');
      
      if (error) {
        console.error('❌ Error fetching car plans:', error);
        throw error;
      }
      
      console.log('✅ Car plans fetched:', data?.length || 0);
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: Array.isArray(plan.add_ons) ? plan.add_ons.map(item => String(item)) : [],
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    } else {
      console.log(`🛵 Fetching special vehicle plans for: ${vt}`);
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .eq('is_active', true)
        .eq('vehicle_type', vt === 'ev' ? 'electric' : vt)
        .order('monthly_price');
      
      if (error) {
        console.error('❌ Error fetching special vehicle plans:', error);
        throw error;
      }
      
      console.log('✅ Special vehicle plans fetched:', data?.length || 0);
      return (data || []).map(plan => ({
        ...plan,
        coverage: Array.isArray(plan.coverage) ? plan.coverage.map(item => String(item)) : [],
        add_ons: [], // Special vehicle plans don't have add-ons
        two_monthly_price: plan.two_yearly_price || null,
        three_monthly_price: plan.three_yearly_price || null
      }));
    }
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

  // Get pricing data from database pricing matrix or fallback to hardcoded values
  const getPricingData = (excess: number, paymentPeriod: string) => {
    // Fallback pricing table if database is not available
    const fallbackPricingTable = {
      yearly: {
        0: { basic: { monthly: 31, total: 372, save: 0 }, gold: { monthly: 34, total: 408, save: 0 }, platinum: { monthly: 36, total: 437, save: 0 } },
        50: { basic: { monthly: 29, total: 348, save: 0 }, gold: { monthly: 31, total: 372, save: 0 }, platinum: { monthly: 32, total: 384, save: 0 } },
        100: { basic: { monthly: 25, total: 300, save: 0 }, gold: { monthly: 27, total: 324, save: 0 }, platinum: { monthly: 29, total: 348, save: 0 } },
        150: { basic: { monthly: 23, total: 276, save: 0 }, gold: { monthly: 26, total: 312, save: 0 }, platinum: { monthly: 27, total: 324, save: 0 } },
        200: { basic: { monthly: 20, total: 240, save: 0 }, gold: { monthly: 23, total: 276, save: 0 }, platinum: { monthly: 25, total: 300, save: 0 } }
      },
      two_yearly: {
        0: { basic: { monthly: 56, total: 670, save: 74 }, gold: { monthly: 61, total: 734, save: 82 }, platinum: { monthly: 65, total: 786, save: 87 } },
        50: { basic: { monthly: 52, total: 626, save: 70 }, gold: { monthly: 56, total: 670, save: 74 }, platinum: { monthly: 58, total: 691, save: 77 } },
        100: { basic: { monthly: 45, total: 540, save: 60 }, gold: { monthly: 49, total: 583, save: 65 }, platinum: { monthly: 52, total: 626, save: 70 } },
        150: { basic: { monthly: 41, total: 497, save: 55 }, gold: { monthly: 47, total: 562, save: 62 }, platinum: { monthly: 49, total: 583, save: 65 } },
        200: { basic: { monthly: 38, total: 456, save: 50 }, gold: { monthly: 44, total: 528, save: 58 }, platinum: { monthly: 46, total: 552, save: 61 } }
      },
      three_yearly: {
        0: { basic: { monthly: 82, total: 982, save: 134 }, gold: { monthly: 90, total: 1077, save: 147 }, platinum: { monthly: 96, total: 1153, save: 157 } },
        50: { basic: { monthly: 77, total: 919, save: 125 }, gold: { monthly: 82, total: 982, save: 134 }, platinum: { monthly: 84, total: 1014, save: 138 } },
        100: { basic: { monthly: 66, total: 792, save: 108 }, gold: { monthly: 71, total: 855, save: 117 }, platinum: { monthly: 77, total: 919, save: 125 } },
        150: { basic: { monthly: 61, total: 729, save: 99 }, gold: { monthly: 69, total: 824, save: 112 }, platinum: { monthly: 71, total: 855, save: 117 } },
        200: { basic: { monthly: 56, total: 672, save: 92 }, gold: { monthly: 66, total: 792, save: 108 }, platinum: { monthly: 69, total: 828, save: 113 } }
      }
    };
    
    const periodData = fallbackPricingTable[paymentPeriod as keyof typeof fallbackPricingTable] || fallbackPricingTable.yearly;
    return periodData[excess as keyof typeof periodData] || periodData[0];
  };

  const calculatePlanPrice = () => {
    // Get the correct plan based on selected claim limit
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) return 0;
    
    console.log('calculatePlanPrice:', {
      paymentType,
      selectedPlan: selectedPlan?.name,
      voluntaryExcess,
      selectedClaimLimit,
      pricingMatrix: selectedPlan?.pricing_matrix
    });
    
    // FIRST: Try to use database pricing matrix (this has the exact prices we want)
    if (selectedPlan.pricing_matrix && typeof selectedPlan.pricing_matrix === 'object') {
      const matrix = selectedPlan.pricing_matrix as any;
      // Map payment types to database keys correctly - align with migration keys
      const dbKey = paymentType === '12months' ? '12' : 
                    paymentType === '24months' ? '24' : 
                    paymentType === '36months' ? '36' : '12';
      
      const periodData = matrix[dbKey];
      console.log('Period data lookup:', { dbKey, periodData, voluntaryExcess: voluntaryExcess.toString() });
      
      if (periodData && periodData[voluntaryExcess.toString()]) {
        const priceData = periodData[voluntaryExcess.toString()];
        let fullPrice = priceData.price || 0;
        
        console.log('Found price in matrix:', { fullPrice, priceData });
        
        // Database pricing matrix stores the correct price for each period
        // No conversion needed since keys are '12', '24', '36' representing months
        return fullPrice;
      } else {
        console.log('No price found in matrix for:', { dbKey, voluntaryExcess: voluntaryExcess.toString() });
      }
    }
    
    // FALLBACK: Use reliability-based pricing if database pricing is not available
    if (vt === 'car' && reliabilityScore?.pricing) {
      const periodKey = paymentType === '12months' ? '12months' : 
                       paymentType === '24months' ? '24months' : 
                       paymentType === '36months' ? '36months' : '12months';
      
      let basePrice = reliabilityScore.pricing[periodKey] || 0;
      
      // Apply voluntary excess discount
      if (voluntaryExcess > 0) {
        const discountRate = voluntaryExcess === 50 ? 0.1 : 
                            voluntaryExcess === 100 ? 0.2 : 
                            voluntaryExcess === 150 ? 0.25 : 0;
        basePrice = Math.round(basePrice * (1 - discountRate));
      }
      
      return basePrice;
    }
    
    // Final fallback to hardcoded pricing
    const pricing = getPricingData(voluntaryExcess, paymentType);
    const planType = selectedPlan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    
    // Safety check: ensure planType exists in pricing object
    if (!pricing[planType]) {
      console.warn(`Plan type "${planType}" not found in pricing data, defaulting to basic`);
      return pricing.basic?.monthly || 0;
    }
    
    return pricing[planType].monthly || 0;
  };

  // Get the plan that matches the selected claim limit
  const getSelectedPlan = (): Plan | null => {
    if (selectedClaimLimit === 750) {
      return plans.find(p => p.name === 'Basic') || plans[0] || null;
    } else if (selectedClaimLimit === 1250) {
      return plans.find(p => p.name === 'Gold') || plans[0] || null;
    } else if (selectedClaimLimit === 2000) {
      return plans.find(p => p.name === 'Platinum') || plans[0] || null;
    }
    return plans.find(p => p.name === 'Platinum') || plans[0] || null; // Default to Platinum
  };

  const getPlanSavings = (plan: Plan) => {
    if (paymentType === '12months') return null;
    
    // Try to use database pricing matrix first, fallback to hardcoded
    if (plan.pricing_matrix && typeof plan.pricing_matrix === 'object') {
      const matrix = plan.pricing_matrix as any;
      // Map payment types to database keys
      const dbKey = paymentType === '24months' ? '24' : '36';
      const periodData = matrix[dbKey];
      if (periodData && periodData[voluntaryExcess.toString()]) {
        return periodData[voluntaryExcess.toString()].save || 0;
      }
    }
    
    // Fallback to hardcoded pricing
    const pricing = getPricingData(voluntaryExcess, paymentType);
    const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    
    // Safety check: ensure planType exists in pricing object
    if (!pricing[planType]) {
      console.warn(`Plan type "${planType}" not found in pricing data for savings, defaulting to basic`);
      return pricing.basic?.save || 0;
    }
    
    return pricing[planType].save || 0;
  };

  const calculateAddOnPrice = (planId: string) => {
    // Original add-on price calculation for plan-specific add-ons
    const selectedAddOnCount = Object.values(selectedAddOns[planId] || {}).filter(Boolean).length;
    const planAddOnPrice = selectedAddOnCount * 2; // £2 per add-on per month
    
    // Protection package add-on prices (convert monthly to yearly for total)
    let protectionPrice = 0;
    if (selectedProtectionAddOns.breakdown) protectionPrice += 5 * 12; // £5/mo = £60/year
    if (selectedProtectionAddOns.motRepair) protectionPrice += 6 * 12; // £6/mo = £72/year
    if (selectedProtectionAddOns.tyre) protectionPrice += 5 * 12; // £5/mo = £60/year
    if (selectedProtectionAddOns.wearTear) protectionPrice += 5 * 12; // £5/mo = £60/year
    if (selectedProtectionAddOns.european) protectionPrice += 3 * 12; // £3/mo = £36/year
    if (selectedProtectionAddOns.transfer) protectionPrice += 30; // £30 one-time
    
    return planAddOnPrice + protectionPrice;
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
      const basePrice = calculatePlanPrice();
      
      // Calculate add-on prices correctly
      const planAddOnCount = Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length;
      const planAddOnPrice = planAddOnCount * 2; // £2 per add-on per month
      
      // Protection add-ons: MOT and Wear&Tear are yearly (spread over 12 months), Transfer is one-time
      let recurringAddonTotal = 0; // Monthly add-ons (spread monthly)
      let oneTimeAddonTotal = 0;   // Transfer (added to first installment only)
      
      if (selectedProtectionAddOns.breakdown) recurringAddonTotal += 5 * 12; // £5/mo
      if (selectedProtectionAddOns.motRepair) recurringAddonTotal += 6 * 12; // £6/mo
      if (selectedProtectionAddOns.tyre) recurringAddonTotal += 5 * 12; // £5/mo
      if (selectedProtectionAddOns.wearTear) recurringAddonTotal += 5 * 12; // £5/mo
      if (selectedProtectionAddOns.european) recurringAddonTotal += 3 * 12; // £3/mo
      if (selectedProtectionAddOns.transfer) oneTimeAddonTotal += 30;
      
      // Calculate monthly amounts
      const monthlyBasePrice = Math.round(basePrice / 12 * 100) / 100; // Base warranty spread over 12 months
      const monthlyPlanAddons = planAddOnPrice; // Plan-specific addons (already monthly)
      const monthlyRecurringAddons = Math.round(recurringAddonTotal / 12 * 100) / 100; // MOT/Wear&Tear spread over 12 months
      
      // Standard monthly installment (installments 2-12, or all if no transfer)
      const standardMonthlyInstallment = monthlyBasePrice + monthlyPlanAddons + monthlyRecurringAddons;
      
      // First installment (includes one-time transfer fee if selected)
      const firstInstallment = standardMonthlyInstallment + oneTimeAddonTotal;
      
      // Total price calculation
      const totalPrice = basePrice + (planAddOnPrice * 12) + recurringAddonTotal + oneTimeAddonTotal;
      
      // Don't allow progression if vehicle is too old
      if (vehicleAgeError) {
        toast.error(vehicleAgeError);
        return;
      }
      
      console.log('Selected plan pricing data:', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        paymentType,
        basePrice,
        monthlyBasePrice,
        recurringAddonTotal,
        oneTimeAddonTotal,
        standardMonthlyInstallment,
        firstInstallment,
        totalPrice,
        voluntaryExcess,
        selectedAddOns: selectedAddOns[selectedPlan.id],
        protectionAddOns: selectedProtectionAddOns
      });
      
      // Call onPlanSelected with the calculated pricing data
      onPlanSelected?.(
        selectedPlan.id, 
        paymentType, 
        selectedPlan.name,
        {
          totalPrice,
          monthlyPrice: standardMonthlyInstallment, // Standard monthly amount
          voluntaryExcess,
          selectedAddOns: selectedAddOns[selectedPlan.id] || {},
          protectionAddOns: selectedProtectionAddOns,
          // Add installment breakdown for step 3
          installmentBreakdown: {
            firstInstallment: firstInstallment,
            standardInstallment: standardMonthlyInstallment,
            hasTransfer: oneTimeAddonTotal > 0,
            transferAmount: oneTimeAddonTotal
          }
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
            
            <TrustpilotHeader className="flex-1 justify-center" />
          </div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Vehicle Information */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                1
              </div>
              <h2 className="text-xl font-semibold text-foreground">🚗 Vehicle Information</h2>
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

        {/* Voluntary Excess */}
        <div className="section-header rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h2 className="text-xl font-semibold text-foreground">💰 Choose your excess amount</h2>
          </div>
          
          <div className="flex gap-3 flex-wrap justify-center">
            {[0, 50, 100, 150].map((amount) => (
              <button
                key={amount}
                onClick={() => toggleVoluntaryExcess(amount)}
                className={`px-6 py-4 rounded-lg transition-all duration-200 text-center relative min-w-[100px] ${
                  voluntaryExcess === amount
                    ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                    : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                }`}
              >
                <div className="text-xl font-bold text-black">£{amount}</div>
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
            <h2 className="text-xl font-semibold text-foreground">🛡️ Choose Your Claim Limit</h2>
          </div>
          
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AutoCare Essential */}
            <button
              onClick={() => setSelectedClaimLimit(750)}
              className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 750
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}
            >
              <div className="absolute top-4 right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full" onClick={(e) => e.stopPropagation()}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="w-80 p-4">
                    <div className="space-y-3">
                      <p className="text-sm text-foreground">
                        Designed for everyday motoring peace of mind, this plan covers the most common and affordable mechanical and electrical faults—not wear and tear or consumables.
                      </p>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Example Repairs Covered:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Starter motor failure</li>
                          <li>• Alternator replacement</li>
                          <li>• Electric window motor faults</li>
                          <li>• Central locking system issues</li>
                          <li>• Fuel pump malfunction</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">What if the repair costs more?</h4>
                        <p className="text-xs text-muted-foreground">
                          If your repair exceeds the £750 limit, you'll just pay the difference. You're still making significant savings—without the high cost of unlimited cover.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-black mb-2">£750</div>
              <h4 className="text-lg font-semibold text-foreground mb-1">AutoCare Essential</h4>
              <p className="text-sm text-muted-foreground mb-2">(10 claims per year)</p>
              <p className="text-sm font-medium text-foreground">Confidence for the everyday drive.</p>
            </button>
            
            {/* AutoCare Advantage */}
            <button
              onClick={() => setSelectedClaimLimit(1250)}
              className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 1250
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <div className="absolute top-4 right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full" onClick={(e) => e.stopPropagation()}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="w-80 p-4">
                    <div className="space-y-3">
                      <p className="text-sm text-foreground">
                        A comprehensive option that balances cost and coverage, ideal for drivers who want broader protection.
                      </p>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Example Repairs Covered:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Transmission control module faults</li>
                          <li>• Suspension arm or bush replacements</li>
                          <li>• Radiator or water pump failure</li>
                          <li>• ABS sensor or module issues</li>
                          <li>• Air conditioning compressor faults</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">What if the repair costs more?</h4>
                        <p className="text-xs text-muted-foreground">
                          If your repair exceeds the £1,250 limit, you'll only need to top up the difference—still saving significantly compared to paying out of pocket.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-black mb-2">£1,250</div>
              <h4 className="text-lg font-semibold text-foreground mb-1">AutoCare Advantage</h4>
              <p className="text-sm text-muted-foreground mb-2">(Unlimited claims)</p>
              <p className="text-sm font-medium text-foreground">Balanced protection for life's bigger bumps.</p>
            </button>
            
            {/* AutoCare Elite */}
            <button
              onClick={() => setSelectedClaimLimit(2000)}
              className={`p-6 rounded-lg transition-all duration-200 text-left relative ${
                selectedClaimLimit === 2000
                  ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                  : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
              }`}
            >
              <div className="absolute top-4 right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full" onClick={(e) => e.stopPropagation()}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="w-80 p-4">
                    <div className="space-y-3">
                      <p className="text-sm text-foreground">
                        Premium-level protection for high-value repairs, including major gearbox work.
                      </p>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Example Repairs Covered:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Engine control unit (ECU) failure (avg. £800-1,200)</li>
                          <li>• Complete gearbox replacement (from £1500 to 2000)</li>
                          <li>• Gearbox or clutch actuator replacement</li>
                          <li>• Turbocharger faults (avg. £1,000-1,800)</li>
                          <li>• Hybrid or electric drive system issues</li>
                          <li>• Advanced infotainment or navigation system faults</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">What if the repair costs more?</h4>
                        <p className="text-xs text-muted-foreground">
                          If the repair goes beyond the £2,000 limit, you'll just pay the extra. You still benefit from major savings—without the premium of unlimited cover.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-black mb-2">£2,000</div>
              <h4 className="text-lg font-semibold text-foreground mb-1">AutoCare Elite</h4>
              <p className="text-sm text-muted-foreground mb-2">(Unlimited claims)</p>
              <p className="text-sm font-medium text-foreground">Top-tier cover for total peace of mind.</p>
            </button>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Loading State */}
      {plansLoading && (
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-16">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-lg text-gray-600">Loading pricing plans...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {plansError && !plansLoading && (
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-16">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Pricing</h3>
              <p className="text-red-600 mb-4">{plansError}</p>
              <Button 
                onClick={() => {
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
                      setPlansError('Failed to load pricing plans. Please try again.');
                      toast.error('Failed to load pricing plans');
                    } finally {
                      if (alive) setPlansLoading(false);
                    }
                  })();
                }} 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Information & Plan Selection */}
      {!plansLoading && !plansError && !vehicleAgeError && displayPlans.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          


          {/* Payment Duration Selection */}
          <div className="section-header rounded-lg p-6 mt-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold text-foreground">📅 Choose Warranty Duration</h3>
              </div>
              
              {/* What's Included button in top right corner */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium text-gray-600">Complete Protection</span>
                <Accordion type="single" collapsible className="w-auto">
                  <AccordionItem value="whats-included" className="border-none">
                    <AccordionTrigger className="hover:no-underline pb-0 pt-0 [&>svg]:hidden">
                      <div className="border-2 border-orange-500 text-orange-500 rounded-lg px-3 py-2 bg-white hover:bg-orange-50 transition-colors duration-200 flex items-center gap-2 text-sm cursor-pointer" style={{ boxShadow: '0 0 10px rgba(249, 115, 22, 0.15)', filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.1))' }}>
                        <div className="w-4 h-4 border border-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                          i
                        </div>
                        <span className="font-medium">What's Included?</span>
                      </div>
                    </AccordionTrigger>
                  
                  <AccordionContent className="pb-0">
                    <div className="mt-4">
                      {/* Core Coverage Items */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-foreground mb-4">Comprehensive Coverage</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { item: 'Unlimited Claims', icon: Infinity },
                            { item: "'ALL' Mechanical & Electrical Components", icon: Zap },
                            { item: 'Petrol/Diesel Car Coverage', icon: Car },
                            { item: 'Engine, Gearbox, Clutch, Turbo & Drivetrain', icon: Cog },
                            { item: 'Suspension, Steering & Braking Systems', icon: Settings },
                            { item: 'Fuel, Cooling & Emissions Systems', icon: Droplets },
                            { item: 'ECUs, Sensors & Driver Assistance Tech', icon: Cpu },
                            { item: 'Air Conditioning, Airbags & Multimedia Systems', icon: Snowflake },
                            { item: 'Diagnostics & Fault-Finding', icon: Search },
                            { item: 'Labour Costs', icon: Users },
                            { item: 'Recovery Claim-back', icon: RotateCcw }
                          ].map(({ item, icon: Icon }, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                                <Icon className="h-3.5 w-3.5 text-success-foreground" />
                              </div>
                              <span className="text-foreground font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Benefits */}
                      <div className="bg-white rounded-lg p-4 mb-6 shadow-lg shadow-black/10">
                        <h4 className="font-semibold text-foreground mb-3">Additional Benefits</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <Infinity className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-foreground">Claim as many times as needed</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <span className="text-foreground">Approved garages or choose your own</span>
                          </div>
                        </div>
                      </div>

                      {/* What's Not Included */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <X className="h-4 w-4" />
                          What's not included:
                        </h4>
                        <div className="space-y-2">
                          {[
                            'Items related to routine servicing, such as tyres, brake pads and discs',
                            'Pre-existing faults or issues',
                            'Vehicles used for hire & reward (e.g. Taxis, Couriers, rentals etc.)'
                          ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-4 h-4 mt-0.5 flex items-center justify-center flex-shrink-0">
                                <X className="h-3 w-3 text-red-500" />
                              </div>
                              <span className="text-red-700 text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Mobile Close Button */}
                      <div className="md:hidden mt-6 pt-4 border-t border-border">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // This will close the accordion by triggering it
                            const accordionTrigger = document.querySelector('[data-state="open"] button[data-radix-collection-item]') as HTMLElement;
                            accordionTrigger?.click();
                          }}
                        >
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Close Coverage Details
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              </div>
            </div>
            
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1 Year Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const oneYearPrice = (() => {
                  // Calculate 1-year price specifically
                  const selectedPlan = getSelectedPlan();
                  if (!selectedPlan) return { total: 348, monthly: 29 };
                  
                  let totalPrice = 348; // fallback
                  if (selectedPlan.pricing_matrix) {
                    const matrix = selectedPlan.pricing_matrix as any;
                    const periodData = matrix['12'];
                    if (periodData && periodData[voluntaryExcess.toString()]) {
                      totalPrice = periodData[voluntaryExcess.toString()].price || 348;
                    }
                  }
                  
                  return { total: totalPrice, monthly: Math.round(totalPrice / 12) };
                })();
                
                 return (
                   <div 
                     onClick={() => setPaymentType('12months')}
                       className={`rounded-lg p-6 transition-all duration-200 cursor-pointer relative ${
                         paymentType === '12months'
                           ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                           : 'bg-white shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                       }`}>
                      <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <h3 className="text-2xl font-bold text-foreground mb-1">1 Year</h3>
                         <p className="text-gray-600">Comprehensive coverage</p>
                         
                          {/* Bullet points with ticks */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Drive now, pay later</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">12 interest-free payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Complete coverage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Claim payouts in 90 minutes 🕒</span>
                            </div>
                          </div>
                       </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-foreground">£{oneYearPrice.total}</div>
                          <div className="text-lg text-gray-500">or £{oneYearPrice.monthly}/mo</div>
                        </div>
                     </div>
                       <button
                         className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mt-6 ${
                           paymentType === '12months'
                             ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                             : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                         }`}
                      >
                        {paymentType === '12months' ? 'Selected' : 'Select'}
                      </button>
                   </div>
                 );
              })()}

              {/* 2 Years Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const twoYearPrice = (() => {
                  // Calculate 2-year price specifically
                  const selectedPlan = getSelectedPlan();
                  if (!selectedPlan) return { total: 786, monthly: 65, save: 87 };
                  
                  let totalPrice = 786; // fallback
                  let savings = 87; // fallback
                  if (selectedPlan.pricing_matrix) {
                    const matrix = selectedPlan.pricing_matrix as any;
                    const periodData = matrix['24'];
                    if (periodData && periodData[voluntaryExcess.toString()]) {
                      totalPrice = periodData[voluntaryExcess.toString()].price || 786;
                      savings = periodData[voluntaryExcess.toString()].save || 87;
                    }
                  }
                  
                  const monthlyEquivalent = Math.round(totalPrice / 12);
                  return { total: totalPrice, monthly: monthlyEquivalent, save: savings };
                })();
                
                 return (
                   <div 
                     onClick={() => setPaymentType('24months')}
                       className={`rounded-lg p-6 transition-all duration-200 relative cursor-pointer ${
                         paymentType === '24months'
                           ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                           : 'bg-white shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                       }`}>
                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                       <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                         Save £{twoYearPrice.save}
                       </div>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <h3 className="text-2xl font-bold text-foreground mb-1">2 Years</h3>
                         <p className="text-gray-600">Comprehensive coverage</p>
                         
                          {/* Bullet points with ticks */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Drive now, pay later</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">12 interest-free payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Complete coverage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Claim payouts in 90 minutes 🕒</span>
                            </div>
                          </div>
                       </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-foreground">£{twoYearPrice.total}</div>
                          <div className="text-lg text-gray-500">or £{twoYearPrice.monthly}/mo</div>
                        </div>
                     </div>
                       <button
                         className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mt-6 ${
                           paymentType === '24months'
                             ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                             : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                         }`}
                      >
                        {paymentType === '24months' ? 'Selected' : 'Select'}
                      </button>
                   </div>
                 );
              })()}

              {/* 3 Years Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const threeYearPrice = (() => {
                  // Calculate 3-year price specifically
                  const selectedPlan = getSelectedPlan();
                  if (!selectedPlan) return { total: 1153, monthly: 96, save: 157 };
                  
                  let totalPrice = 1153; // fallback
                  let savings = 157; // fallback
                  if (selectedPlan.pricing_matrix) {
                    const matrix = selectedPlan.pricing_matrix as any;
                    const periodData = matrix['36'];
                    if (periodData && periodData[voluntaryExcess.toString()]) {
                      totalPrice = periodData[voluntaryExcess.toString()].price || 1153;
                      savings = periodData[voluntaryExcess.toString()].save || 157;
                    }
                  }
                  
                  const monthlyEquivalent = Math.round(totalPrice / 12);
                  return { total: totalPrice, monthly: monthlyEquivalent, save: savings };
                })();
                
                 return (
                   <div 
                     onClick={() => setPaymentType('36months')}
                       className={`rounded-lg p-6 transition-all duration-200 relative cursor-pointer ${
                         paymentType === '36months'
                           ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30'
                           : 'bg-white shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                       }`}>
                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                       <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                         Save £{threeYearPrice.save}
                       </div>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <h3 className="text-2xl font-bold text-foreground mb-1">3 Years</h3>
                         <p className="text-gray-600">Comprehensive coverage</p>
                         
                          {/* Bullet points with ticks */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Drive now, pay later</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">12 interest-free payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Complete coverage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-black flex-shrink-0" />
                              <span className="text-sm text-gray-600">Claim payouts in 90 minutes 🕒</span>
                            </div>
                          </div>
                       </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-foreground">£{threeYearPrice.total}</div>
                          <div className="text-lg text-gray-500">or £{threeYearPrice.monthly}/mo</div>
                        </div>
                     </div>
                       <button
                         className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 mt-6 ${
                           paymentType === '36months'
                             ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                             : 'neutral-container shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                         }`}
                      >
                        {paymentType === '36months' ? 'Selected' : 'Select'}
                      </button>
                   </div>
                 );
              })()}
            </div>
            
            {/* Add-On Protection Packages Section */}
            <AddOnProtectionPackages 
              selectedAddOns={selectedProtectionAddOns}
              onAddOnChange={(addOnKey, selected) => 
                setSelectedProtectionAddOns(prev => ({ ...prev, [addOnKey]: selected }))
              }
            />
            
            {/* Pricing Summary and CTA */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mt-8">
              {/* Prominent Pricing Display */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-lg">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-2">
                    {/* Current Price Display */}
                    <div className="text-3xl font-bold text-orange-600">
                      £{(() => {
                        const selectedPlan = getSelectedPlan();
                        if (!selectedPlan) return calculatePlanPrice();
                        const basePrice = calculatePlanPrice();
                        
                        // Calculate add-on prices correctly
                        const planAddOnCount = Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length;
                        const planAddOnPrice = planAddOnCount * 2 * 12; // £2 per add-on per month * 12 months
                        
                        // Protection addon prices: monthly add-ons converted to yearly + one-time
                        let protectionPrice = 0;
                        if (selectedProtectionAddOns.breakdown) protectionPrice += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.motRepair) protectionPrice += 6 * 12; // £6/mo = £72/year
                        if (selectedProtectionAddOns.tyre) protectionPrice += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.wearTear) protectionPrice += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.european) protectionPrice += 3 * 12; // £3/mo = £36/year
                        if (selectedProtectionAddOns.transfer) protectionPrice += 30; // £30 one-time
                        
                        return basePrice + planAddOnPrice + protectionPrice;
                      })()}
                      <span className="text-sm font-normal text-gray-600 ml-2">total</span>
                    </div>
                    
                    {/* Monthly Instalments */}
                    <div className="border-t border-orange-200 pt-2">
                      {(() => {
                        const selectedPlan = getSelectedPlan();
                        if (!selectedPlan) return null;
                        
                        const basePrice = calculatePlanPrice();
                        const planAddOnCount = Object.values(selectedAddOns[selectedPlan.id] || {}).filter(Boolean).length;
                        const planAddOnPrice = planAddOnCount * 2; // £2 per add-on per month
                        
                        // Protection add-ons: Monthly add-ons are yearly (spread over 12 months), Transfer is one-time
                        let recurringAddonTotal = 0;
                        let hasTransfer = false;
                        
                        if (selectedProtectionAddOns.breakdown) recurringAddonTotal += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.motRepair) recurringAddonTotal += 6 * 12; // £6/mo = £72/year
                        if (selectedProtectionAddOns.tyre) recurringAddonTotal += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.wearTear) recurringAddonTotal += 5 * 12; // £5/mo = £60/year
                        if (selectedProtectionAddOns.european) recurringAddonTotal += 3 * 12; // £3/mo = £36/year
                        if (selectedProtectionAddOns.transfer) hasTransfer = true;
                        
                        // Calculate monthly amounts
                        const monthlyBasePrice = Math.round(basePrice / 12 * 100) / 100;
                        const monthlyRecurringAddons = Math.round(recurringAddonTotal / 12 * 100) / 100;
                        const standardMonthlyInstallment = monthlyBasePrice + planAddOnPrice + monthlyRecurringAddons;
                        const firstInstallment = hasTransfer ? standardMonthlyInstallment + 30 : standardMonthlyInstallment;
                        
                        if (hasTransfer && firstInstallment !== standardMonthlyInstallment) {
                          return (
                            <>
                              <div className="text-xl font-semibold text-gray-800">
                                <div>1st payment: £{Math.round(firstInstallment * 100) / 100}</div>
                                <div>Payments 2-12: £{Math.round(standardMonthlyInstallment * 100) / 100} each</div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Interest-free payments • No hidden fees</p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <div className="text-xl font-semibold text-gray-800">
                                £{Math.round(standardMonthlyInstallment * 100) / 100} <span className="text-sm font-normal text-gray-600">x 12 monthly instalments</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Interest-free payments • No hidden fees</p>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Animated CTA Button on the right */}
                  <div className="animate-[bounce_4s_ease-in-out_infinite]">
                    <Button 
                      size="lg"
                      onClick={() => {
                        // Use the selected plan based on claim limit
                        handleSelectPlan();
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group min-w-[180px]"
                    >
                      Confirm & Pay
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No plans message */}
      {!plansLoading && !plansError && displayPlans.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-16">
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No plans available</h3>
            <p className="text-gray-600">No pricing plans found for this vehicle type.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingTable;