import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Star, Shield, Wrench, Zap, Clock, Phone, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateVehiclePricing, getPricingDisplay, isVehicleEligible, VehiclePricingData, PricingTier } from '@/lib/dynamicPricingUtils';

interface VehicleData {
  registration: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  bodyType?: string;
  engineCapacity?: number;
  mileage?: string;
}

interface DynamicPricingTableProps {
  vehicleData: VehicleData;
  onBack: () => void;
  onPlanSelected: (planData: any) => void;
}

export default function DynamicPricingTable({ vehicleData, onBack, onPlanSelected }: DynamicPricingTableProps) {
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('12months');
  const [paymentMethod, setPaymentMethod] = useState<'monthly' | 'full'>('monthly');
  const [enhanced, setEnhanced] = useState(false);
  const [motHistory, setMotHistory] = useState<any[]>([]);
  const [pricing, setPricing] = useState<PricingTier | null>(null);
  const [eligible, setEligible] = useState(true);

  // Prepare vehicle data for pricing calculation
  const vehiclePricingData: VehiclePricingData = useMemo(() => ({
    make: vehicleData.make || '',
    model: vehicleData.model || '',
    year: vehicleData.year || new Date().getFullYear(),
    fuelType: vehicleData.fuelType || '',
    bodyType: vehicleData.bodyType,
    engineCapacity: vehicleData.engineCapacity,
    motHistory: motHistory,
    isVan: false, // Will be determined by utility function
    isPremiumBrand: false, // Will be determined by utility function
    isEV: vehicleData.fuelType?.toLowerCase().includes('electric'),
    isPHEV: vehicleData.fuelType?.toLowerCase().includes('hybrid')
  }), [vehicleData, motHistory]);

  useEffect(() => {
    const fetchMotHistory = async () => {
      if (!vehicleData.registration) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mot_history')
          .select('*')
          .eq('registration', vehicleData.registration.toUpperCase())
          .single();

        if (data && !error) {
          setMotHistory(Array.isArray(data.mot_tests) ? data.mot_tests : []);
        }
      } catch (error) {
        console.error('Error fetching MOT history:', error);
      }

      setLoading(false);
    };

    fetchMotHistory();
  }, [vehicleData.registration]);

  useEffect(() => {
    // Calculate pricing when vehicle data or MOT history changes
    const calculatedPricing = calculateVehiclePricing(vehiclePricingData);
    const isEligible = isVehicleEligible(vehiclePricingData);
    
    setPricing(calculatedPricing);
    setEligible(isEligible);
  }, [vehiclePricingData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculating Your Quote</h2>
          <p className="text-gray-600">Getting the best pricing for your vehicle...</p>
        </div>
      </div>
    );
  }

  if (!eligible || !pricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mb-6 text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicle Details
          </Button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <Shield className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Coverage Not Available</h2>
              <p className="text-xl text-gray-600 mb-6">
                Unfortunately, we're unable to provide warranty coverage for this vehicle. 
                This may be due to the vehicle's age, make/model restrictions, or other eligibility criteria.
              </p>
            </div>
            <Button 
              onClick={onBack} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg font-semibold"
            >
              Try Another Vehicle
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayPricing = getPricingDisplay(pricing, enhanced);
  const currentPrice = paymentType === '12months' ? displayPricing.monthly1Year :
                      paymentType === '24months' ? displayPricing.monthly2Year :
                      displayPricing.monthly3Year;
  
  const fullPrice = paymentType === '12months' ? displayPricing.full1Year :
                    paymentType === '24months' ? displayPricing.full2Year :
                    displayPricing.full3Year;

  const savings = paymentType === '24months' ? displayPricing.savings2Year :
                  paymentType === '36months' ? displayPricing.savings3Year : 0;

  const handleSelectPlan = () => {
    const selectedPricing = {
      monthlyPrice: paymentMethod === 'monthly' ? currentPrice : Math.ceil(fullPrice / (parseInt(paymentType.replace('months', '')))),
      totalPrice: paymentMethod === 'full' ? fullPrice : currentPrice * parseInt(paymentType.replace('months', '')),
      paymentType,
      paymentMethod,
      enhanced,
      savings: paymentMethod === 'full' ? Math.ceil(currentPrice * parseInt(paymentType.replace('months', '')) * 0.1) : savings
    };

    onPlanSelected({
      planType: enhanced ? 'Enhanced Warranty' : 'Standard Warranty',
      pricing: selectedPricing,
      coverage: enhanced ? getEnhancedCoverage() : getStandardCoverage()
    });
  };

  const getStandardCoverage = () => [
    'Engine and transmission',
    'Cooling and heating systems',
    'Fuel system components',
    'Electrical systems',
    'Steering and suspension',
    'Braking system',
    '24/7 roadside assistance',
    'Nationwide garage network'
  ];

  const getEnhancedCoverage = () => [
    ...getStandardCoverage(),
    'Air conditioning system',
    'Turbo and supercharger',
    'Hybrid system components',
    'Advanced driver assistance',
    'Infotainment systems',
    'Premium roadside assistance',
    'Courtesy car provision'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orange Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Confirm Your Vehicle
          </h1>
          <p className="text-orange-100 text-lg">
            Please verify these details are correct
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-6 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vehicle Details
        </Button>

        {/* Vehicle Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              1
            </div>
            <span className="text-gray-600 font-medium">Based on your vehicle</span>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{vehicleData.registration}</h2>
            <h3 className="text-xl text-gray-700 mb-1">{vehicleData.make} {vehicleData.model}</h3>
            <p className="text-gray-600">{vehicleData.year} • {vehicleData.fuelType}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Car className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Fuel Type</p>
              <p className="font-semibold text-gray-800">{vehicleData.fuelType}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Year</p>
              <p className="font-semibold text-gray-800">{vehicleData.year}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Mileage</p>
              <p className="font-semibold text-gray-800">{vehicleData.mileage || 'N/A'}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-green-600">Eligible</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Eligible for warranty coverage</span>
          </div>
        </div>

        {/* Warranty Selection Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              2
            </div>
            <span className="text-gray-800 font-semibold text-lg">Select your cover</span>
            <div className="ml-auto">
              <span className="text-orange-500 text-sm font-medium">What's Covered</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            {enhanced ? 'Enhanced' : 'Standard'} Car Warranty
          </h3>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">Choose your warranty duration</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: '12months', label: '1 Year', price: displayPricing.monthly1Year * 12, monthly: displayPricing.monthly1Year, savings: 0 },
                { key: '24months', label: '2 Years', price: displayPricing.monthly2Year * 24, monthly: displayPricing.monthly2Year, savings: displayPricing.savings2Year },
                { key: '36months', label: '3 Years', price: displayPricing.monthly3Year * 36, monthly: displayPricing.monthly3Year, savings: displayPricing.savings3Year }
              ].map((option) => (
                <div
                  key={option.key}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    paymentType === option.key 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentType(option.key as typeof paymentType)}
                >
                  {option.savings > 0 && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                        Save £{option.savings}
                      </Badge>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="font-bold text-gray-800 mb-2">{option.label}</h4>
                    <div className="text-2xl font-bold text-gray-800 mb-1">£{Math.round(option.price)}</div>
                    <p className="text-sm text-gray-600">Comprehensive</p>
                    <p className="text-xs text-gray-500">£{option.monthly}/month</p>
                    {paymentType === option.key && (
                      <Button className="mt-3 w-full bg-orange-500 hover:bg-orange-600">
                        Selected
                      </Button>
                    )}
                    {paymentType !== option.key && (
                      <Button variant="outline" className="mt-3 w-full">
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Cover Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">Enhanced Cover</h4>
                <p className="text-sm text-gray-600">Increase your claim limit from £3,000 to £6,000</p>
                <span className="text-blue-600 text-sm">+£0 total</span>
              </div>
              <Button
                variant={enhanced ? "default" : "outline"}
                onClick={() => setEnhanced(!enhanced)}
                className={enhanced ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {enhanced ? "Added" : "Add"}
              </Button>
            </div>
          </div>

          {/* Summary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500">Claim Limit:</p>
              <p className="font-semibold">£{enhanced ? '6,000' : '3,000'}</p>
            </div>
            <div>
              <p className="text-gray-500">Vehicle Age:</p>
              <p className="font-semibold">{new Date().getFullYear() - vehicleData.year} years old</p>
            </div>
            <div>
              <p className="text-gray-500">Pay in full:</p>
              <p className="font-semibold text-green-600">£{Math.round(fullPrice)} (10% off)</p>
            </div>
            <div>
              <p className="text-gray-500">Monthly:</p>
              <p className="font-semibold">£{currentPrice}/mo</p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              3
            </div>
            <span className="text-gray-800 font-semibold text-lg">Choose how to pay</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay in Full */}
            <div className={`border-2 rounded-lg p-6 ${paymentMethod === 'full' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Pay in Full</h4>
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">POPULAR</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">One-time payment with credit card</p>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">£{fullPrice}</div>
                <p className="text-sm text-gray-600">Total today</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Instant coverage activation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>10% upfront discount applied</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Secure payment via Stripe</span>
                </div>
              </div>

              <Button 
                className={`w-full py-3 text-lg font-semibold ${
                  paymentMethod === 'full' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setPaymentMethod('full');
                  handleSelectPlan();
                }}
              >
                Pay £{fullPrice} Now →
              </Button>
            </div>

            {/* Spread the Cost */}
            <div className={`border-2 rounded-lg p-6 ${paymentMethod === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Spread the Cost</h4>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">0% APR</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">0% APR financing available</p>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">£{currentPrice}</div>
                <p className="text-sm text-gray-600">Monthly payment</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>0% APR on vehicle products</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Flexible payment terms ({paymentType.replace('months', ' months')})</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Instant decision</span>
                </div>
              </div>

              <Button 
                className={`w-full py-3 text-lg font-semibold ${
                  paymentMethod === 'monthly' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setPaymentMethod('monthly');
                  handleSelectPlan();
                }}
              >
                Apply for Finance →
              </Button>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              ← Choose Different Vehicle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}