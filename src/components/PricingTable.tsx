import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus, Infinity, Zap, Car, Cog, Settings, Droplets, Cpu, Snowflake, Search, Users, RotateCcw, MapPin, X, Shield, Hash, Calendar, Gauge, Fuel, Edit, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';

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
  onPlanSelected?: (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => void;
}

const PricingTable: React.FC<PricingTableProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(0);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  const [selectedClaimLimit, setSelectedClaimLimit] = useState<number>(2000);
  
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
      console.log('🚗 Fetching standard car plans: Platinum only');
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .in('name', ['Platinum'])
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
    // Updated fallback pricing table to match new structure
    const fallbackPricingTable = {
      yearly: {
        0: { basic: { monthly: 39, total: 467, save: 0 }, gold: { monthly: 39, total: 467, save: 0 }, platinum: { monthly: 39, total: 467, save: 0 } },
        50: { basic: { monthly: 36, total: 437, save: 0 }, gold: { monthly: 36, total: 437, save: 0 }, platinum: { monthly: 36, total: 437, save: 0 } },
        100: { basic: { monthly: 32, total: 387, save: 0 }, gold: { monthly: 32, total: 387, save: 0 }, platinum: { monthly: 32, total: 387, save: 0 } },
        150: { basic: { monthly: 31, total: 367, save: 0 }, gold: { monthly: 31, total: 367, save: 0 }, platinum: { monthly: 31, total: 367, save: 0 } }
      },
      two_yearly: {
        0: { basic: { monthly: 75, total: 897, save: 37 }, gold: { monthly: 75, total: 897, save: 37 }, platinum: { monthly: 75, total: 897, save: 37 } },
        50: { basic: { monthly: 69, total: 827, save: 47 }, gold: { monthly: 69, total: 827, save: 47 }, platinum: { monthly: 69, total: 827, save: 47 } },
        100: { basic: { monthly: 61, total: 737, save: 37 }, gold: { monthly: 61, total: 737, save: 37 }, platinum: { monthly: 61, total: 737, save: 37 } },
        150: { basic: { monthly: 58, total: 697, save: 53 }, gold: { monthly: 58, total: 697, save: 53 }, platinum: { monthly: 58, total: 697, save: 53 } }
      },
      three_yearly: {
        0: { basic: { monthly: 112, total: 1347, save: 54 }, gold: { monthly: 112, total: 1347, save: 54 }, platinum: { monthly: 112, total: 1347, save: 54 } },
        50: { basic: { monthly: 104, total: 1247, save: 64 }, gold: { monthly: 104, total: 1247, save: 64 }, platinum: { monthly: 104, total: 1247, save: 64 } },
        100: { basic: { monthly: 91, total: 1097, save: 67 }, gold: { monthly: 91, total: 1097, save: 67 }, platinum: { monthly: 91, total: 1097, save: 67 } },
        150: { basic: { monthly: 87, total: 1047, save: 70 }, gold: { monthly: 87, total: 1047, save: 70 }, platinum: { monthly: 87, total: 1047, save: 70 } }
      }
    };
    
    const periodData = fallbackPricingTable[paymentPeriod as keyof typeof fallbackPricingTable] || fallbackPricingTable.yearly;
    return periodData[excess as keyof typeof periodData] || periodData[0];
  };

  const calculatePlanPrice = (plan: Plan) => {
    // Use reliability-based pricing if available (only for cars)
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
      
      // Convert to monthly payment for display purposes
      if (paymentType === '12months') {
        return Math.round(basePrice / 12); // Monthly payment amount
      } else if (paymentType === '24months') {
        return Math.round(basePrice / 12); // 12 monthly payments for 24 month coverage
      } else if (paymentType === '36months') {
        return Math.round(basePrice / 12); // 12 monthly payments for 36 month coverage  
      }
      
      return Math.round(basePrice / 12);
    }
    
    // Try to use database pricing matrix first, fallback to hardcoded
    if (plan.pricing_matrix && typeof plan.pricing_matrix === 'object') {
      const matrix = plan.pricing_matrix as any;
      
      // Handle new pricing structure with voluntary excess and claim limits
      if (matrix.pricing) {
        const excessData = matrix.pricing[voluntaryExcess.toString()];
        if (excessData) {
          const claimLimitData = excessData[selectedClaimLimit.toString()];
          if (claimLimitData) {
            // Map payment types to database keys
            const durationKey = paymentType === '12months' ? '1_year' : 
                               paymentType === '24months' ? '2_years' : 
                               paymentType === '36months' ? '3_years' : '1_year';
            
            const totalPrice = claimLimitData[durationKey];
            if (totalPrice) {
              // Convert total price to monthly display price
              return Math.round(totalPrice / 12);
            }
          }
        }
      }
      
      // Fallback to old structure if new structure not found
      const dbKey = paymentType === '12months' ? 'monthly' : 
                    paymentType === '24months' ? '24' : 
                    paymentType === '36months' ? '36' : 'yearly';
      
      const periodData = matrix[dbKey];
      if (periodData && periodData[voluntaryExcess.toString()]) {
        const priceData = periodData[voluntaryExcess.toString()];
        let fullPrice = priceData.price || 0;
        
        // For database pricing matrix, check if it's already monthly or needs conversion
        if (paymentType === '12months' && dbKey === 'monthly') {
          // Already monthly price
          return fullPrice;
        } else if (paymentType === '12months' && dbKey === 'yearly') {
          // Convert yearly to monthly
          return Math.round(fullPrice / 12);
        } else if (paymentType === '24months') {
          // 24 month plans return the full 24-month price (not divided)
          return fullPrice;
        } else if (paymentType === '36months') {
          // 36 month plans return the full 36-month price (not divided)
          return fullPrice;
        }
        
        return fullPrice;
      }
    }
    
    // Fallback to hardcoded pricing
    const pricing = getPricingData(voluntaryExcess, paymentType);
    const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
    
    // Safety check: ensure planType exists in pricing object
    if (!pricing[planType]) {
      console.warn(`Plan type "${planType}" not found in pricing data, defaulting to basic`);
      return pricing.basic?.monthly || 0;
    }
    
    return pricing[planType].monthly || 0;
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
    // Set loading state for this plan
    setLoading(prev => ({ ...prev, [plan.id]: true }));
    
    try {
      const basePrice = calculatePlanPrice(plan);
      const addOnPrice = calculateAddOnPrice(plan.id);
      const monthlyTotal = basePrice + addOnPrice;
      
      // Calculate the actual total price based on payment period (warranty duration)
      let totalPrice = monthlyTotal;
      
      // Use reliability-based pricing for total if available (only for cars)
      if (vt === 'car' && reliabilityScore?.pricing) {
        const periodKey = paymentType === '12months' ? '12months' : 
                         paymentType === '24months' ? '24months' : 
                         paymentType === '36months' ? '36months' : '12months';
        
        let baseTotalPrice = reliabilityScore.pricing[periodKey] || 0;
        
        // Apply voluntary excess discount
        if (voluntaryExcess > 0) {
          const discountRate = voluntaryExcess === 50 ? 0.1 : 
                              voluntaryExcess === 100 ? 0.2 : 
                              voluntaryExcess === 150 ? 0.25 : 0;
          baseTotalPrice = Math.round(baseTotalPrice * (1 - discountRate));
        }
        
        // Add add-on costs (£2 per addon per month for warranty duration)
        const warrantyMonths = paymentType === '12months' ? 12 : 
                              paymentType === '24months' ? 24 : 
                              paymentType === '36months' ? 36 : 12;
        const addOnTotalCost = addOnPrice * warrantyMonths;
        
        totalPrice = baseTotalPrice + addOnTotalCost;
      } else {
        // For non-car vehicles or when reliability scoring is not available
        // Use database pricing matrix or fallback pricing
        if (plan.pricing_matrix && typeof plan.pricing_matrix === 'object') {
          const matrix = plan.pricing_matrix as any;
          
          // Handle new pricing structure first
          if (matrix.pricing) {
            const excessData = matrix.pricing[voluntaryExcess.toString()];
            if (excessData) {
              const claimLimitData = excessData[selectedClaimLimit.toString()];
              if (claimLimitData) {
                const durationKey = paymentType === '12months' ? '1_year' : 
                                   paymentType === '24months' ? '2_years' : 
                                   paymentType === '36months' ? '3_years' : '1_year';
                
                totalPrice = claimLimitData[durationKey] || 0;
              } else {
                totalPrice = 0;
              }
            } else {
              totalPrice = 0;
            }
          } else {
            // Fallback to old structure
            const dbKey = paymentType === '12months' ? 'yearly' : 
                          paymentType === '24months' ? '24' : 
                          paymentType === '36months' ? '36' : 'yearly';
            
            const periodData = matrix[dbKey];
            if (periodData && periodData[voluntaryExcess.toString()]) {
              const priceData = periodData[voluntaryExcess.toString()];
              totalPrice = priceData.total || 0;
            } else {
              totalPrice = 0;
            }
          }
          
          // Add add-on costs
          const warrantyMonths = paymentType === '12months' ? 12 : 
                                paymentType === '24months' ? 24 : 
                                paymentType === '36months' ? 36 : 12;
          const addOnTotalCost = addOnPrice * warrantyMonths;
          totalPrice += addOnTotalCost;
        } else {
          // Fallback calculation
          const pricing = getPricingData(voluntaryExcess, paymentType);
          const planType = plan.name.toLowerCase() as 'basic' | 'gold' | 'platinum';
          
          if (pricing[planType]) {
            totalPrice = pricing[planType].total || 0;
            
            // Add add-on costs
            const warrantyMonths = paymentType === '12months' ? 12 : 
                                  paymentType === '24months' ? 24 : 
                                  paymentType === '36months' ? 36 : 12;
            const addOnTotalCost = addOnPrice * warrantyMonths;
            totalPrice += addOnTotalCost;
          }
        }
      }
      
      // Don't allow progression if vehicle is too old
      if (vehicleAgeError) {
        toast.error(vehicleAgeError);
        return;
      }
      
      console.log('Selected plan pricing data:', {
        planId: plan.id,
        planName: plan.name,
        paymentType,
        basePrice,
        addOnPrice,
        monthlyTotal,
        totalPrice,
        voluntaryExcess,
        selectedAddOns: selectedAddOns[plan.id] || {}
      });

      if (onPlanSelected) {
        onPlanSelected(
          plan.id,
          paymentType,
          plan.name,
          {
            totalPrice,
            monthlyPrice: monthlyTotal,
            voluntaryExcess,
            selectedAddOns: selectedAddOns[plan.id] || {}
          }
        );
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan. Please try again.');
    } finally {
      // Clear loading state for this plan
      setLoading(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const ensureCarOnly = () => plans;
  const displayPlans = ensureCarOnly();

  if (vehicleAgeError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-6">
            <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Vehicle Too Old</h2>
            <p className="text-muted-foreground mb-6">{vehicleAgeError}</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (plansLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (plansError || displayPlans.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{plansError || 'No plans available for your vehicle type.'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Floating Summary Bar */}
      {isFloatingBarVisible && selectedPlan && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b z-50 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">{selectedPlan.name}</span>
              <span className="text-muted-foreground">
                £{calculatePlanPrice(selectedPlan) + calculateAddOnPrice(selectedPlan.id)}/month
              </span>
              <span className="text-sm text-muted-foreground">
                £{voluntaryExcess} excess • {paymentType === '12months' ? '1' : paymentType === '24months' ? '2' : '3'} year{paymentType !== '12months' ? 's' : ''}
              </span>
            </div>
            <Button
              onClick={() => handleSelectPlan(selectedPlan)}
              disabled={loading[selectedPlan.id]}
              className="bg-primary hover:bg-primary/90"
            >
              {loading[selectedPlan.id] ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to vehicle details
        </button>
        
        <TrustpilotHeader />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select the perfect warranty for your {vehicleData.make} {vehicleData.model}</p>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step <= 3 ? 'bg-muted-foreground text-white' : 'bg-muted text-muted-foreground'}
              `}>
                {step}
              </div>
              {step < 5 && (
                <div className={`
                  w-8 h-0.5 
                  ${step < 3 ? 'bg-muted-foreground' : 'bg-muted'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-muted/50 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Registration:</span>
            <span className="font-medium ml-2">{vehicleData.regNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Make/Model:</span>
            <span className="font-medium ml-2">{vehicleData.make} {vehicleData.model}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Year:</span>
            <span className="font-medium ml-2">{vehicleData.year}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mileage:</span>
            <span className="font-medium ml-2">{vehicleData.mileage}</span>
          </div>
        </div>
      </div>

      {/* Reliability Score Display */}
      {reliabilityLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-blue-700 font-medium">Calculating your vehicle's reliability score...</span>
          </div>
        </div>
      )}

      {reliabilityScore && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Vehicle Reliability Score</h3>
                <p className="text-sm text-green-700">
                  Your {vehicleData.make} {vehicleData.model} has a reliability score of {reliabilityScore.score}/100 - {reliabilityScore.tierLabel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{reliabilityScore.score}</div>
              <div className="text-sm text-green-700">out of 100</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Period Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose Warranty Duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: '12months' as const, label: '1 Year', popular: false },
            { key: '24months' as const, label: '2 Years', popular: true },
            { key: '36months' as const, label: '3 Years', popular: false }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setPaymentType(period.key)}
              className={`
                relative p-4 rounded-lg border-2 transition-colors
                ${paymentType === period.key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
                }
              `}
            >
              {period.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <div className="font-semibold text-foreground">{period.label}</div>
                <div className="text-sm text-muted-foreground">Warranty Coverage</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Voluntary Excess Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose Your Voluntary Excess</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Higher excess means lower monthly payments. This is the amount you pay towards each claim.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 50, 100, 150].map(amount => (
            <button
              key={amount}
              onClick={() => toggleVoluntaryExcess(amount)}
              className={`
                p-3 rounded-lg border-2 transition-colors text-center
                ${voluntaryExcess === amount 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
                }
              `}
            >
              <div className="font-semibold text-foreground">£{amount}</div>
              <div className="text-xs text-muted-foreground">per claim</div>
            </button>
          ))}
        </div>
      </div>

      {/* Claim Limit Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Choose Your Claim Limit</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Maximum amount covered per claim. Higher limits provide more comprehensive coverage.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[750, 1250, 2000].map(limit => (
            <button
              key={limit}
              onClick={() => setSelectedClaimLimit(limit)}
              className={`
                p-4 rounded-lg border-2 transition-colors text-center
                ${selectedClaimLimit === limit 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
                }
              `}
            >
              <div className="font-semibold text-foreground">£{limit.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">per claim</div>
              {limit === 2000 && (
                <div className="text-xs text-green-600 font-medium mt-1">Recommended</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Display */}
      <div className="space-y-6">
        {displayPlans.map(plan => {
          const monthlyPrice = calculatePlanPrice(plan);
          const addOnPrice = calculateAddOnPrice(plan.id);
          const totalMonthlyPrice = monthlyPrice + addOnPrice;
          const savings = getPlanSavings(plan);
          const pdfUrl = pdfUrls[plan.name];
          
          return (
            <div
              key={plan.id}
              className={`
                rounded-xl border-2 p-6 transition-all duration-200 cursor-pointer hover:shadow-lg
                ${selectedPlan?.id === plan.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-muted hover:border-primary/50 bg-card'
                }
              `}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Plan Info */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">Comprehensive Coverage</p>
                    </div>
                  </div>
                  
                  {/* Pricing Display */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">£{totalMonthlyPrice}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    {savings && savings > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Save £{savings}
                        </Badge>
                        <span className="text-sm text-muted-foreground">vs monthly plan</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      {paymentType === '12months' 
                        ? '12 monthly payments' 
                        : paymentType === '24months'
                        ? '12 monthly payments for 2-year coverage'
                        : '12 monthly payments for 3-year coverage'
                      }
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      £{voluntaryExcess} excess • £{selectedClaimLimit.toLocaleString()} claim limit
                    </div>
                    
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-4 w-4" />
                        View Terms & Conditions
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="md:col-span-1">
                  <h4 className="font-semibold mb-3 text-foreground">What's Covered</h4>
                  <div className="space-y-2">
                    {plan.coverage.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                    {plan.coverage.length > 6 && (
                      <div className="text-sm text-primary cursor-pointer hover:underline">
                        +{plan.coverage.length - 6} more items covered
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Column */}
                <div className="md:col-span-1 flex flex-col justify-between">
                  {/* Add-ons for cars only */}
                  {vt === 'car' && plan.add_ons && plan.add_ons.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">Optional Add-ons</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAddOnInfo(plan.id);
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {showAddOnInfo[plan.id] && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-700">
                            Add-ons provide additional coverage beyond the standard plan. Each add-on costs £2/month.
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {plan.add_ons.map((addon, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${plan.id}-addon-${index}`}
                              checked={selectedAddOns[plan.id]?.[addon] || false}
                              onCheckedChange={() => {
                                toggleAddOn(plan.id, addon);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`${plan.id}-addon-${index}`}
                              className="text-sm text-muted-foreground cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAddOn(plan.id, addon);
                              }}
                            >
                              {addon} (+£2/month)
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {addOnPrice > 0 && (
                        <div className="mt-2 text-sm text-primary font-medium">
                          Add-ons: +£{addOnPrice}/month
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan);
                    }}
                    disabled={loading[plan.id]}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {loading[plan.id] ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Select This Plan'
                    )}
                  </Button>

                  {selectedPlan?.id === plan.id && (
                    <div className="mt-2 text-center">
                      <span className="text-sm text-primary font-medium">Selected Plan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-12 bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-foreground">Important Information</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium mb-2 text-foreground">Coverage Period</h4>
            <p>Your warranty covers you for the selected duration from the start date. All prices shown include VAT.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-foreground">Claims Process</h4>
            <p>24/7 claims helpline available. Approved repairs at our network of trusted garages nationwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;