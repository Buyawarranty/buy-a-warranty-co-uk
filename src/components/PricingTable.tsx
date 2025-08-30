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
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
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

  const getDurationPrice = (duration: '1year' | '2year' | '3year') => {
    if (useReliabilityPricing && reliabilityPricing) {
      const periodKey = duration === '1year' ? '12M' : 
                       duration === '2year' ? '24M' : 
                       duration === '3year' ? '36M' : '12M';
      
      let basePriceTotal = reliabilityPricing[periodKey as keyof typeof reliabilityPricing];
      
      // Apply voluntary excess discount
      if (voluntaryExcess === 250) {
        basePriceTotal = basePriceTotal * 0.95; // 5% discount for £250 excess
      } else if (voluntaryExcess === 500) {
        basePriceTotal = basePriceTotal * 0.9; // 10% discount for £500 excess
      }
      
      return Math.round(basePriceTotal);
    }
    
    // Fallback pricing if no reliability data
    const basePrices = {
      '1year': 559, // Tier 5 default
      '2year': 1009,
      '3year': 1349
    };
    
    let price = basePrices[duration];
    
    // Apply voluntary excess discount
    if (voluntaryExcess === 250) {
      price = price * 0.95;
    } else if (voluntaryExcess === 500) {
      price = price * 0.9;
    }
    
    return Math.round(price);
  };

  const handleSelectDuration = (duration: '1year' | '2year' | '3year') => {
    setSelectedDuration(duration);
    setLoading(prev => ({ ...prev, [duration]: true }));
    
    setTimeout(() => {
      if (onPlanSelected) {
        const totalPrice = getDurationPrice(duration);
        const months = duration === '1year' ? 12 : duration === '2year' ? 24 : 36;
        const monthlyPrice = Math.round(totalPrice / months);
        
        onPlanSelected(
          'single-plan', 
          duration, 
          'Vehicle Warranty', 
          {
            totalPrice,
            monthlyPrice,
            voluntaryExcess,
            selectedAddOns: {}
          }
        );
      }
      setLoading(prev => ({ ...prev, [duration]: false }));
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
        <>
          {/* Voluntary Excess Selection */}
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Select Your Voluntary Excess</h3>
              <div className="flex justify-center gap-4">
                {[50, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setVoluntaryExcess(amount)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all ${
                      voluntaryExcess === amount
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="text-lg font-semibold">£{amount}</div>
                    <div className="text-sm opacity-80">
                      {amount === 250 ? '5% discount' : amount === 500 ? '10% discount' : 'Standard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Single Plan with Duration Options */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Warranty Plan</h2>
                <p className="text-gray-600">Comprehensive coverage for your vehicle</p>
              </div>

              {/* Duration Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {(['1year', '2year', '3year'] as const).map((duration) => {
                  const price = getDurationPrice(duration);
                  const months = duration === '1year' ? 12 : duration === '2year' ? 24 : 36;
                  const monthlyPrice = Math.round(price / months);
                  const isSelected = selectedDuration === duration;
                  
                  return (
                    <div
                      key={duration}
                      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedDuration(duration)}
                    >
                      {duration === '2year' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-primary text-white px-3 py-1 text-sm font-semibold rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {duration === '1year' ? '1 Year' : duration === '2year' ? '2 Years' : '3 Years'}
                        </h3>
                        <div className="text-3xl font-bold text-primary mb-1">
                          £{price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          £{monthlyPrice} per month
                        </div>
                        {duration === '3year' && (
                          <div className="text-sm text-green-600 font-semibold mt-2">
                            Best Value - Save more!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coverage Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="font-semibold mb-4 text-center">What's Covered</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Engine and transmission coverage',
                    'Electrical system protection',
                    'Cooling and heating systems',
                    'Steering and suspension',
                    'Braking system coverage',
                    'Fuel system protection',
                    '24/7 breakdown assistance',
                    'UK-wide coverage'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Now Button */}
              <div className="text-center">
                <Button
                  onClick={() => handleSelectDuration(selectedDuration)}
                  className="bg-primary hover:bg-primary/90 text-white px-12 py-4 text-lg font-semibold rounded-lg"
                  disabled={loading[selectedDuration]}
                >
                  {loading[selectedDuration] ? (
                    <>Processing...</>
                  ) : (
                    <>Buy {selectedDuration === '1year' ? '1 Year' : selectedDuration === '2year' ? '2 Year' : '3 Year'} Plan - £{getDurationPrice(selectedDuration).toLocaleString()}</>
                  )}
                </Button>
                
                <div className="mt-4 text-sm text-gray-600">
                  <div>Voluntary Excess: £{voluntaryExcess}</div>
                  {voluntaryExcess > 50 && (
                    <div className="text-green-600">
                      {voluntaryExcess === 250 ? '5%' : '10%'} discount applied
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingTable;