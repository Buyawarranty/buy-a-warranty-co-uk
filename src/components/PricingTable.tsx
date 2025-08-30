import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VehicleReliabilityScore } from './VehicleReliabilityScore';
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
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[planId: string]: {[addon: string]: boolean}}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [reliabilityPricing, setReliabilityPricing] = useState<{ "12M": number; "24M": number; "36M": number } | null>(null);
  const [useReliabilityPricing, setUseReliabilityPricing] = useState(false);
  const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
  const [reliabilityTier, setReliabilityTier] = useState<string | null>(null);
  const [reliabilityLoading, setReliabilityLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'1year' | '2year' | '3year'>('1year');

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

  // Auto-calculate reliability score when component loads with registration
  useEffect(() => {
    if (vehicleData?.regNumber && !vehicleAgeError) {
      calculateReliabilityScore();
    }
  }, [vehicleData?.regNumber]);

  useEffect(() => {
    fetchPdfUrls();
  }, []);

  const fetchPdfUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('plan_type, file_url')
        .in('plan_type', ['basic', 'gold', 'platinum']);

      if (error) throw error;

      const urls: {[key: string]: string} = {};
      data?.forEach(doc => {
        if (doc.plan_type && doc.file_url) {
          urls[doc.plan_type.toLowerCase()] = doc.file_url;
        }
      });
      setPdfUrls(urls);
    } catch (error) {
      console.error('Error fetching PDF URLs:', error);
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
        setUseReliabilityPricing(true);
      } else {
        console.log('No reliability data available:', data?.error);
        // Don't show error to user, just use standard pricing
      }
    } catch (error) {
      console.error('Error calculating reliability:', error);
      // Don't show error to user, just use standard pricing
    } finally {
      setReliabilityLoading(false);
    }
  };

  const calculatePlanPrice = () => {
    if (useReliabilityPricing && reliabilityPricing) {
      const periodKey = paymentType === '12months' ? '12M' : 
                       paymentType === '24months' ? '24M' : 
                       paymentType === '36months' ? '36M' : '12M';
      
      const basePriceTotal = reliabilityPricing[periodKey as keyof typeof reliabilityPricing];
      
      // Apply voluntary excess discount
      let adjustedPrice = basePriceTotal;
      if (voluntaryExcess === 250) {
        adjustedPrice = basePriceTotal * 0.95; // 5% discount for £250 excess
      } else if (voluntaryExcess === 500) {
        adjustedPrice = basePriceTotal * 0.9; // 10% discount for £500 excess
      }
      
      const monthlyPrice = adjustedPrice / (paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36);
      return Math.round(monthlyPrice);
    }
    
    // Fallback pricing if no reliability data - use Tier 5 pricing as default
    const fallbackPricing = {
      '12months': 559,
      '24months': 1009, 
      '36months': 1349
    };
    
    let basePriceTotal = fallbackPricing[paymentType];
    
    // Apply voluntary excess discount
    if (voluntaryExcess === 250) {
      basePriceTotal = basePriceTotal * 0.95;
    } else if (voluntaryExcess === 500) {
      basePriceTotal = basePriceTotal * 0.9;
    }
    
    const months = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
    return Math.round(basePriceTotal / months);
  };

  const getAddOnPrice = (addon: string) => {
    // Standard add-on pricing
    const addOnPrices: {[key: string]: number} = {
      'Key Cover': 8,
      'Breakdown Cover': 12,
      'MOT Cover': 5
    };
    return addOnPrices[addon] || 5;
  };

  const calculateAddOnPrice = () => {
    const selectedAddOnsList = selectedAddOns['single-plan'] || {};
    return Object.entries(selectedAddOnsList)
      .filter(([_, selected]) => selected)
      .reduce((total, [addon]) => total + getAddOnPrice(addon), 0);
  };

  const toggleAddOn = (addon: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      'single-plan': {
        ...prev['single-plan'],
        [addon]: !prev['single-plan']?.[addon]
      }
    }));
  };

  const toggleVoluntaryExcess = (amount: number) => {
    setVoluntaryExcess(amount);
  };

  const toggleAddOnInfo = () => {
    setShowAddOnInfo(prev => ({
      ...prev,
      'single-plan': !prev['single-plan']
    }));
  };

  const handleSelectPlan = () => {
    setLoading(prev => ({ ...prev, 'single-plan': true }));
    
    setTimeout(() => {
      if (onPlanSelected) {
        const monthlyPrice = calculatePlanPrice();
        const addOnPrice = calculateAddOnPrice();
        const totalMonthlyPrice = monthlyPrice + addOnPrice;
        const months = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
        const totalPrice = totalMonthlyPrice * months;
        
        onPlanSelected(
          'single-plan', 
          paymentType, 
          'Vehicle Warranty', 
          {
            totalPrice,
            monthlyPrice: totalMonthlyPrice,
            voluntaryExcess,
            selectedAddOns: selectedAddOns['single-plan'] || {}
          }
        );
      }
      setLoading(prev => ({ ...prev, 'single-plan': false }));
    }, 1000);
  };

  return (
    <div className="bg-[#e8f4fb] w-full min-h-screen">
      {/* Header with Back Button */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 sm:px-8">
        <div className="flex justify-start items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </Button>
        </div>
      </div>

      {/* Trustpilot Header */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-center">
        <TrustpilotHeader />
      </div>

      {/* Header with Vehicle Details */}
      <div className="text-center mb-8 sm:mb-10 px-4 sm:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Your Warranty Quote
        </h1>
        
        {/* Vehicle Registration Display */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-xl sm:text-2xl md:text-3xl px-4 sm:px-6 py-3 sm:py-4 rounded-[6px] shadow-sm leading-tight border-2 border-black">
            <img 
              src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
              alt="GB Flag" 
              className="w-[25px] h-[18px] sm:w-[30px] sm:h-[22px] md:w-[35px] md:h-[25px] mr-3 sm:mr-4 object-cover rounded-[2px]"
            />
            <div className="font-bold font-sans tracking-normal">
              {vehicleData.regNumber || 'REG NUM'}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        {vehicleData.make && (
          <div className="mb-6 max-w-2xl mx-auto px-2">
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-700">
              <span className="font-semibold text-gray-900 text-center sm:text-left">
                {vehicleData.make} {vehicleData.model || 'Vehicle'}
              </span>
              {vehicleData.fuelType && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Fuel:</strong> {vehicleData.fuelType}
                </span>
              )}
              {vehicleData.year && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Year:</strong> {vehicleData.year}
                </span>
              )}
              {vehicleData.transmission && (
                <span className="text-gray-600 text-center sm:text-left">
                  <strong>Transmission:</strong> {vehicleData.transmission}
                </span>
              )}
              <span className="text-gray-600 text-center sm:text-left">
                <strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles
              </span>
            </div>
          </div>
        )}

        {/* Vehicle Age Error */}
        {vehicleAgeError && (
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-red-800 mb-2">Vehicle Not Eligible</h3>
              <p className="text-red-700 text-lg mb-4">{vehicleAgeError}</p>
              <p className="text-red-600 text-sm">
                Please contact us if you believe this is an error.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Reliability Score Display */}
      {!vehicleAgeError && vehicleData.regNumber && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          {reliabilityLoading ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Calculating vehicle reliability score...
              </div>
            </div>
          ) : reliabilityScore !== null && reliabilityTier ? (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-primary mb-1">
                Reliability Score: {reliabilityScore}/100
              </div>
              <div className="text-sm text-primary/80">
                {reliabilityTier} • Pricing adjusted based on vehicle reliability
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Main pricing section */}
      {!vehicleAgeError && (
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          {/* Payment Type Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => setPaymentType('12months')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  paymentType === '12months'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                12 Months
              </button>
              <button
                onClick={() => setPaymentType('24months')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  paymentType === '24months'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                24 Months
                <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>
              </button>
              <button
                onClick={() => setPaymentType('36months')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  paymentType === '36months'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                36 Months
                <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">Save More</Badge>
              </button>
            </div>
          </div>

          {/* Voluntary Excess Selection */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-center">Select Your Voluntary Excess</h3>
              <div className="flex justify-center gap-4">
                {[50, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => toggleVoluntaryExcess(amount)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      voluntaryExcess === amount
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="font-semibold">£{amount}</div>
                    <div className="text-xs opacity-80">
                      {amount === 250 ? 'Save 5%' : amount === 500 ? 'Save 10%' : 'Standard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Single Plan */}
          <div className="flex justify-center">
            <div className="relative bg-white rounded-2xl shadow-lg border-2 border-primary scale-105 max-w-md w-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Warranty</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    £{(calculatePlanPrice() + calculateAddOnPrice())}
                    <span className="text-base text-gray-500 font-normal">/month</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Total: £{(calculatePlanPrice() + calculateAddOnPrice()) * (paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36)} 
                    ({paymentType === '12months' ? '12' : paymentType === '24months' ? '24' : '36'} months)
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Voluntary Excess: £{voluntaryExcess}
                  </div>
                </div>

                {/* Coverage List */}
                <div className="space-y-3 mb-8">
                  {[
                    'Engine and transmission coverage',
                    'Electrical system protection', 
                    'Cooling and heating systems',
                    'Steering and suspension',
                    'Braking system coverage',
                    'Fuel system protection',
                    '24/7 breakdown assistance',
                    'UK-wide coverage'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Add-ons Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Optional Add-ons</h4>
                    <button
                      onClick={() => toggleAddOnInfo()}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {['Key Cover', 'Breakdown Cover', 'MOT Cover'].map((addon) => (
                      <label key={addon} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          checked={selectedAddOns['single-plan']?.[addon] || false}
                          onCheckedChange={() => toggleAddOn(addon)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                          {addon}
                        </span>
                        <span className="text-sm font-medium text-primary">
                          +£{getAddOnPrice(addon)}/month
                        </span>
                      </label>
                    ))}
                  </div>

                  {showAddOnInfo['single-plan'] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <strong>Add-on Benefits:</strong>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Key Cover:</strong> Lost or stolen key replacement</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Breakdown Cover:</strong> 24/7 roadside assistance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>MOT Cover:</strong> MOT failure repair coverage</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <Button
                  onClick={handleSelectPlan}
                  disabled={loading['single-plan']}
                  className="w-full py-4 text-lg font-semibold rounded-xl transition-all bg-primary hover:bg-primary/90 text-white shadow-lg"
                >
                  {loading['single-plan'] ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Buy Plan - £{calculatePlanPrice() + calculateAddOnPrice()}/month
                    </>
                  )}
                </Button>

                {/* PDF Link */}
                {pdfUrls['gold'] && (
                  <div className="mt-4 text-center">
                    <a
                      href={pdfUrls['gold']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Plan Details (PDF)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingTable;