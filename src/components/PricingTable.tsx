import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus } from 'lucide-react';
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
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
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
      // Map payment types to database keys correctly
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
          const dbKey = paymentType === '12months' ? 'yearly' : 
                        paymentType === '24months' ? '24' : 
                        paymentType === '36months' ? '36' : 'yearly';
          
          const periodData = matrix[dbKey];
          if (periodData && periodData[voluntaryExcess.toString()]) {
            const priceData = periodData[voluntaryExcess.toString()];
            totalPrice = priceData.total || 0;
            
            // Add add-on costs
            const warrantyMonths = paymentType === '12months' ? 12 : 
                                  paymentType === '24months' ? 24 : 
                                  paymentType === '36months' ? 36 : 12;
            const addOnTotalCost = addOnPrice * warrantyMonths;
            totalPrice += addOnTotalCost;
          }
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
        selectedAddOns: selectedAddOns[plan.id]
      });
      
      // Call onPlanSelected with the calculated pricing data
      onPlanSelected?.(
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
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [plan.id]: false }));
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
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Vehicle Information</h2>
          </div>
          
          {vehicleData && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Registration</span>
                <span className="font-semibold text-gray-900">{vehicleData.regNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Vehicle</span>
                <span className="font-semibold text-gray-900">
                  {vehicleData.make} {vehicleData.model || 'Vehicle'}
                </span>
              </div>
              {vehicleData.fuelType && (
                <div>
                  <span className="text-gray-500 block">Fuel Type</span>
                  <span className="font-semibold text-gray-900">{vehicleData.fuelType}</span>
                </div>
              )}
              {vehicleData.year && (
                <div>
                  <span className="text-gray-500 block">Year</span>
                  <span className="font-semibold text-gray-900">{vehicleData.year}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block">Mileage</span>
                <span className="font-semibold text-gray-900">{parseInt(vehicleData.mileage).toLocaleString()} miles</span>
              </div>
            </div>
          )}
        </div>

        {/* Voluntary Excess */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Voluntary Excess Amount</h2>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {[0, 50, 100, 150].map((amount) => (
              <button
                key={amount}
                onClick={() => toggleVoluntaryExcess(amount)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  voluntaryExcess === amount
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                £{amount}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Limit Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Choose Your Claim Limit</h2>
          </div>
          
          <p className="text-gray-600 mb-6">All plans include <strong>unlimited</strong> number of claims</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedClaimLimit(750)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedClaimLimit === 750
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">Essential Cover</h4>
              <div className="text-lg font-bold text-gray-900 mb-1">£750 Claim Limit</div>
              <p className="text-sm text-gray-600">Perfect for smaller repairs and peace of mind.</p>
            </button>
            
            <button
              onClick={() => setSelectedClaimLimit(1250)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left relative ${
                selectedClaimLimit === 1250
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-bold">
                MOST POPULAR
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Plus Cover</h4>
              <div className="text-lg font-bold text-gray-900 mb-1">£1,250 Claim Limit</div>
              <p className="text-sm text-gray-600">Ideal for comprehensive protection on major repairs.</p>
            </button>
            
            <button
              onClick={() => setSelectedClaimLimit(2000)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedClaimLimit === 2000
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">Premium Cover</h4>
              <div className="text-lg font-bold text-gray-900 mb-1">£2,000 Claim Limit</div>
              <p className="text-sm text-gray-600">Maximum protection for high-value repairs.</p>
            </button>
          </div>
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
          
          {/* What's Covered Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <h2 className="text-xl font-semibold text-gray-900">What's Covered?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Engine',
                'Manual Gearbox', 
                'Automatic Transmission',
                'Torque Converter',
                'Overdrive',
                'Differential',
                'Electrics',
                'Casings',
                'Recover Claim-back'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPlans.map((plan) => {
              const basePrice = calculatePlanPrice(plan);
              const addOnPrice = calculateAddOnPrice(plan.id);
              const displayPrice = basePrice + addOnPrice;
              const isLoading = loading[plan.id];
              const savings = getPlanSavings(plan);
              
              return (
                <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {paymentType === '12months' ? '12 month warranty' :
                       paymentType === '24months' ? '24 month warranty' :
                       paymentType === '36months' ? '36 month warranty' :
                       '12 month warranty'}
                    </p>
                     
                    {/* Pay Full Amount Option */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Pay Full Amount</span>
                        <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          Save 5% (£{Math.round((displayPrice * 12) * 0.05)})
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        £{Math.round((displayPrice * 12) * 0.95)}
                      </div>
                    </div>

                    {/* Monthly Payment Option */}
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {paymentType === '12months' ? (
                          <>£{displayPrice}/mo</>
                        ) : (
                          <>£{displayPrice}<span className="text-lg">/12 payments</span></>
                        )}
                      </div>
                      <div className="text-green-600 font-medium">
                        {paymentType === '12months' ? 'for 12 months interest free' : 'paid over 12 months interest free'}
                      </div>
                    </div>
                    
                    {savings && paymentType !== '12months' && (
                     <div className="text-green-600 font-bold text-lg mb-6">
                       You Save £{savings}
                      </div>
                    )}
                     
                    {/* Action Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg"
                    >
                      {isLoading ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Duration Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Choose Warranty Duration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1 Year Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const oneYearPrice = (() => {
                  const pricing = getPricingData(voluntaryExcess, 'yearly');
                  const totalPrice = pricing.platinum?.total || 437;
                  const monthlyEquivalent = Math.round(totalPrice / 12);
                  return { total: totalPrice, monthly: monthlyEquivalent };
                })();
                
                return (
                  <div className={`border-2 rounded-lg p-6 transition-all duration-200 ${
                    paymentType === '12months'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">1 Year</h3>
                      
                      {/* Pay Full Amount Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">Pay Full Amount</span>
                          <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Save 5% (£{Math.round(oneYearPrice.total * 0.05)})
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          £{Math.round(oneYearPrice.total * 0.95)}
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-2">£{oneYearPrice.monthly}/mo</div>
                      <p className="text-green-600 text-sm font-medium mb-4">for 12 months interest free</p>
                      <button
                        onClick={() => setPaymentType('12months')}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                          paymentType === '12months'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {paymentType === '12months' ? 'Selected' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 2 Years Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const twoYearPrice = (() => {
                  const pricing = getPricingData(voluntaryExcess, 'two_yearly');
                  const totalPrice = pricing.platinum?.total || 786;
                  const monthlyEquivalent = Math.round(totalPrice / 12);
                  const savings = pricing.platinum?.save || 87;
                  return { total: totalPrice, monthly: monthlyEquivalent, save: savings };
                })();
                
                return (
                  <div className={`border-2 rounded-lg p-6 transition-all duration-200 relative ${
                    paymentType === '24months'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                        Save £{twoYearPrice.save}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">2 Years</h3>
                      
                      {/* Pay Full Amount Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">Pay Full Amount</span>
                          <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Save 5% (£{Math.round(twoYearPrice.total * 0.05)})
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          £{Math.round(twoYearPrice.total * 0.95)}
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-2">£{twoYearPrice.monthly}/mo</div>
                      <p className="text-green-600 text-sm font-medium mb-4">for 12 months interest free</p>
                      <button
                        onClick={() => setPaymentType('24months')}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                          paymentType === '24months'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {paymentType === '24months' ? 'Selected' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3 Years Option */}
              {(() => {
                const platinumPlan = displayPlans.find(p => p.name === 'Platinum');
                if (!platinumPlan) return null;
                
                const threeYearPrice = (() => {
                  const pricing = getPricingData(voluntaryExcess, 'three_yearly');
                  const totalPrice = pricing.platinum?.total || 1153;
                  const monthlyEquivalent = Math.round(totalPrice / 12);
                  const savings = pricing.platinum?.save || 157;
                  return { total: totalPrice, monthly: monthlyEquivalent, save: savings };
                })();
                
                return (
                  <div className={`border-2 rounded-lg p-6 transition-all duration-200 relative ${
                    paymentType === '36months'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                        Save £{threeYearPrice.save}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">3 Years</h3>
                      
                      {/* Pay Full Amount Card */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">Pay Full Amount</span>
                          <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Save 5% (£{Math.round(threeYearPrice.total * 0.05)})
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          £{Math.round(threeYearPrice.total * 0.95)}
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-2">£{threeYearPrice.monthly}/mo</div>
                      <p className="text-green-600 text-sm font-medium mb-4">for 12 months interest free</p>
                      <button
                        onClick={() => setPaymentType('36months')}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                          paymentType === '36months'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {paymentType === '36months' ? 'Selected' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                );
              })()}
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

      {/* Floating Action Bar */}
      {isFloatingBarVisible && displayPlans.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
               {displayPlans.map((plan) => {
                 const basePrice = calculatePlanPrice(plan);
                 const addOnPrice = calculateAddOnPrice(plan.id);
                 const monthlyPrice = basePrice + addOnPrice;
                 const isLoading = loading[plan.id];
                 const savings = getPlanSavings(plan);
                
                return (
                  <div key={plan.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900">
                        {plan.name}
                      </h4>
                        <div className="flex items-baseline gap-1">
                          {paymentType === '12months' ? (
                            <>
                              <span className="text-2xl font-bold">£{monthlyPrice}</span>
                              <span className="text-sm text-gray-600">/mo</span>
                            </>
                          ) : (
                            <>
                              <span className="text-2xl font-bold">£{monthlyPrice}</span>
                              <span className="text-sm text-gray-600">/12 payments</span>
                            </>
                          )}
                        </div>
                      {savings && paymentType !== '12months' && (
                        <div className="text-green-600 font-semibold text-sm">
                          Save £{savings}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading}
                      size="sm"
                      className="ml-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg"
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