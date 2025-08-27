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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-6 text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vehicle Details
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Choose Your Warranty Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Personalized pricing based on your vehicle's details and history
          </p>
        </div>

        {/* Vehicle Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{vehicleData.make} {vehicleData.model}</h3>
                <p className="text-gray-600">
                  {vehicleData.year} • {vehicleData.fuelType} • {vehicleData.registration}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm font-semibold">
              ✓ Warranty Available
            </Badge>
          </div>
        </div>

        {/* Payment Period Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Warranty Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: '12months', label: '1 Year', monthly: displayPricing.monthly1Year, savings: 0, popular: false },
              { key: '24months', label: '2 Years', monthly: displayPricing.monthly2Year, savings: displayPricing.savings2Year, popular: true },
              { key: '36months', label: '3 Years', monthly: displayPricing.monthly3Year, savings: displayPricing.savings3Year, popular: false }
            ].map((option) => (
              <div
                key={option.key}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  paymentType === option.key 
                    ? 'ring-4 ring-blue-500 ring-opacity-50' 
                    : ''
                }`}
                onClick={() => setPaymentType(option.key as typeof paymentType)}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-bold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className={`bg-white border-2 rounded-xl p-6 text-center h-full ${
                  paymentType === option.key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="text-xl font-bold text-gray-800 mb-2">{option.label}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">£{option.monthly}</div>
                  <div className="text-gray-600 mb-4">per month</div>
                  {option.savings > 0 && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Save £{option.savings}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Level Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Coverage Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                !enhanced 
                  ? 'ring-4 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
              onClick={() => setEnhanced(false)}
            >
              <div className={`bg-white border-2 rounded-xl p-6 h-full ${
                !enhanced 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Standard Warranty</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive coverage for essential components
                </p>
                <ul className="space-y-2 mb-4">
                  {getStandardCoverage().slice(0, 4).map((item, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                  <li className="text-gray-500 text-sm ml-6">+ 4 more benefits...</li>
                </ul>
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                enhanced 
                  ? 'ring-4 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
              onClick={() => setEnhanced(true)}
            >
              <div className={`bg-white border-2 rounded-xl p-6 h-full relative ${
                enhanced 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-bold">
                    Premium
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Enhanced Warranty</h3>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Premium coverage with additional benefits
                </p>
                <ul className="space-y-2 mb-4">
                  {getEnhancedCoverage().slice(0, 4).map((item, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                  <li className="text-gray-500 text-sm ml-6">+ 7 more premium benefits...</li>
                </ul>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-semibold text-center">
                  +£{Math.ceil(79 * parseInt(paymentType.replace('months', '')) / 12)} per month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How Would You Like to Pay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                paymentMethod === 'monthly' 
                  ? 'ring-4 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
              onClick={() => setPaymentMethod('monthly')}
            >
              <div className={`bg-white border-2 rounded-xl p-6 text-center h-full ${
                paymentMethod === 'monthly' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Monthly Payments</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">£{currentPrice}</div>
                <p className="text-gray-600 mb-4">per month</p>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  0% APR • No Interest
                </div>
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                paymentMethod === 'full' 
                  ? 'ring-4 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
              onClick={() => setPaymentMethod('full')}
            >
              <div className={`bg-white border-2 rounded-xl p-6 text-center h-full relative ${
                paymentMethod === 'full' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-bold">
                    Save 10%
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Pay in Full</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">£{fullPrice}</div>
                <p className="text-gray-600 mb-4">one-time payment</p>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Save £{Math.ceil(currentPrice * parseInt(paymentType.replace('months', '')) * 0.1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {enhanced ? 'Enhanced' : 'Standard'} Warranty Summary
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {paymentMethod === 'monthly' ? `£${currentPrice}` : `£${fullPrice}`}
              </div>
              <p className="text-xl text-gray-700">
                {paymentMethod === 'monthly' 
                  ? `per month for ${paymentType.replace('months', ' months')} • 0% APR`
                  : `one-time payment • 10% discount applied`
                }
              </p>
            </div>
            
            {savings > 0 && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold">
                    You save £{savings} with this {paymentType.replace('months', '-year')} plan!
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span>UK Coverage</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Wrench className="w-4 h-4" />
                <span>Approved Garages</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleSelectPlan} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Your Warranty Now
            </Button>
            
            <p className="text-gray-500 mt-4 text-sm">
              Secure checkout • No hidden fees • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}