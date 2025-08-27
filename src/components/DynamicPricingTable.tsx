import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Star, Shield, Wrench } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calculating your personalized pricing...</p>
        </div>
      </div>
    );
  }

  if (!eligible || !pricing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vehicle Details
        </Button>
        
        <Card className="text-center p-8">
          <CardContent>
            <div className="mb-4">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coverage Not Available</h3>
              <p className="text-muted-foreground">
                Unfortunately, we're unable to provide warranty coverage for this vehicle. 
                This may be due to the vehicle's age, make/model restrictions, or other eligibility criteria.
              </p>
            </div>
            <Button onClick={onBack} className="mt-4">
              Try Another Vehicle
            </Button>
          </CardContent>
        </Card>
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
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Vehicle Details
      </Button>

      {/* Vehicle Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{vehicleData.make} {vehicleData.model}</h3>
              <p className="text-sm text-muted-foreground">
                {vehicleData.year} • {vehicleData.fuelType} • {vehicleData.registration}
              </p>
            </div>
            <Badge variant="secondary">
              Warranty Available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Period Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Your Warranty Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: '12months', label: '1 Year', monthly: displayPricing.monthly1Year, savings: 0 },
              { key: '24months', label: '2 Years', monthly: displayPricing.monthly2Year, savings: displayPricing.savings2Year },
              { key: '36months', label: '3 Years', monthly: displayPricing.monthly3Year, savings: displayPricing.savings3Year }
            ].map((option) => (
              <Card 
                key={option.key}
                className={`cursor-pointer transition-all ${
                  paymentType === option.key 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setPaymentType(option.key as typeof paymentType)}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-2xl font-bold text-primary">£{option.monthly}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                  {option.savings > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      Save £{option.savings}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Level Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Your Coverage Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                !enhanced 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setEnhanced(false)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Standard Warranty</h4>
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Comprehensive coverage for essential components
                </div>
                <ul className="text-sm space-y-1">
                  {getStandardCoverage().slice(0, 4).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                  <li className="text-muted-foreground">+ 4 more...</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                enhanced 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setEnhanced(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Enhanced Warranty</h4>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Premium coverage with additional benefits
                </div>
                <ul className="text-sm space-y-1">
                  {getEnhancedCoverage().slice(0, 4).map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                  <li className="text-muted-foreground">+ 7 more...</li>
                </ul>
                <Badge variant="secondary" className="mt-2">
                  +£{Math.ceil(79 * parseInt(paymentType.replace('months', '')) / 12)} per month
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === 'monthly' 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('monthly')}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold mb-2">Monthly Payments</h4>
                <div className="text-2xl font-bold text-primary">£{currentPrice}</div>
                <div className="text-sm text-muted-foreground">per month • 0% APR</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === 'full' 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('full')}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold mb-2">Pay in Full</h4>
                <div className="text-2xl font-bold text-primary">£{fullPrice}</div>
                <div className="text-sm text-muted-foreground">
                  Save £{Math.ceil(currentPrice * parseInt(paymentType.replace('months', '')) * 0.1)} (10% discount)
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {enhanced ? 'Enhanced' : 'Standard'} Warranty - {paymentType.replace('months', ' months')}
              </h3>
              <p className="text-muted-foreground">
                {paymentMethod === 'monthly' 
                  ? `£${currentPrice} per month (0% APR)`
                  : `£${fullPrice} paid in full (10% discount applied)`
                }
              </p>
            </div>
            <Button size="lg" onClick={handleSelectPlan} className="min-w-[120px]">
              Buy Now
            </Button>
          </div>
          
          {savings > 0 && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              You save £{savings} with this {paymentType.replace('months', '-year')} plan!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}