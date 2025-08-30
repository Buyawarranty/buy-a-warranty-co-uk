import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Info, FileText, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [paymentType, setPaymentType] = useState<'12months' | '24months' | '36months'>('24months');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[addon: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [reliabilityScore, setReliabilityScore] = useState<number | null>(null);
  const [reliabilityTier, setReliabilityTier] = useState<string | null>(null);
  const [reliabilityLoading, setReliabilityLoading] = useState(false);

  // Voluntary excess options with discounts
  const excessOptions = [
    { amount: 0, label: '£0', discount: '' },
    { amount: 50, label: '£50', discount: '5% discount' },
    { amount: 100, label: '£100', discount: '10% discount' },
    { amount: 150, label: '£150', discount: '12% discount' },
  ];

  // Coverage features
  const coverageFeatures = [
    'Engine and transmission coverage',
    'Cooling and heating systems',
    'Braking system coverage',
    '24/7 breakdown assistance',
    'Electrical system protection',
    'Steering and suspension',
    'Fuel system protection',
    'UK-wide coverage'
  ];

  // Add-on options
  const addOnOptions = [
    { name: 'Power Hood', price: 25 },
    { name: 'ECU', price: 30 },
    { name: 'Air Conditioning', price: 35 },
    { name: 'Turbo', price: 40 }
  ];

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
    fetchPdfUrl();
  }, []);

  // Auto-calculate reliability score when component loads with registration
  useEffect(() => {
    if (vehicleData?.regNumber && !vehicleAgeError) {
      calculateReliabilityScore();
    }
  }, [vehicleData?.regNumber]);

  const fetchPdfUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('file_url')
        .eq('plan_type', 'Warranty')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPdfUrl(data.file_url);
      }
    } catch (error) {
      console.error('Error fetching PDF URL:', error);
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
      }
    } catch (error) {
      console.error('Error calculating reliability:', error);
    } finally {
      setReliabilityLoading(false);
    }
  };

  const calculateBasePrice = () => {
    // Base pricing structure
    const basePrices = {
      '12months': { 0: 559, 50: 529, 100: 459, 150: 429 },
      '24months': { 0: 1009, 50: 959, 100: 829, 150: 779 },
      '36months': { 0: 1349, 50: 1279, 100: 1109, 150: 1039 }
    };

    return basePrices[paymentType][voluntaryExcess as keyof typeof basePrices[typeof paymentType]] || basePrices[paymentType][0];
  };

  const calculateMonthlyPrice = () => {
    const basePrice = calculateBasePrice();
    const months = paymentType === '12months' ? 12 : paymentType === '24months' ? 24 : 36;
    return Math.round(basePrice / months);
  };

  const calculateAddOnTotal = () => {
    return Object.entries(selectedAddOns)
      .filter(([_, selected]) => selected)
      .reduce((total, [addonName]) => {
        const addon = addOnOptions.find(a => a.name === addonName);
        return total + (addon?.price || 0);
      }, 0);
  };

  const getDiscountPercentage = () => {
    if (voluntaryExcess === 50) return 5;
    if (voluntaryExcess === 100) return 10;
    if (voluntaryExcess === 150) return 12;
    return 0;
  };

  const toggleAddOn = (addonName: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addonName]: !prev[addonName]
    }));
  };

  const handleSelectPlan = async () => {
    setLoading(true);
    
    try {
      const basePrice = calculateBasePrice();
      const addOnTotal = calculateAddOnTotal();
      const totalPrice = basePrice + addOnTotal;
      const monthlyPrice = calculateMonthlyPrice() + Math.round(addOnTotal / 12);
      
      const pricingData = {
        totalPrice,
        monthlyPrice,
        voluntaryExcess,
        selectedAddOns
      };

      if (onPlanSelected) {
        onPlanSelected('warranty-plan', paymentType, 'Vehicle Warranty Plan', pricingData);
      }
    } catch (error) {
      console.error('Error in plan selection:', error);
      toast.error('An error occurred while processing your selection');
    } finally {
      setLoading(false);
    }
  };

  if (vehicleAgeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to vehicle details
          </Button>
          <div className="bg-card rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Vehicle Not Eligible</h2>
            <p className="text-muted-foreground mb-6">{vehicleAgeError}</p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to vehicle details
        </Button>

        {/* Reliability Score Display */}
        {reliabilityScore !== null && (
          <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border/50">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Vehicle Reliability Score
              </h3>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {reliabilityScore}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                {reliabilityTier && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {reliabilityTier}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                This score reflects your vehicle's reliability based on MOT history and helps determine pricing.
              </p>
            </div>
          </div>
        )}

        {/* Voluntary Excess Selection */}
        <div className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border/50">
          <h2 className="text-xl font-semibold text-center mb-6">Select Your Voluntary Excess</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {excessOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => setVoluntaryExcess(option.amount)}
                className={`px-6 py-4 rounded-lg border-2 transition-all duration-200 min-w-[120px] ${
                  voluntaryExcess === option.amount
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <div className="font-bold text-lg">{option.label}</div>
                {option.amount === 50 && <div className="text-xs opacity-80">Standard</div>}
                {option.discount && (
                  <div className="text-xs opacity-80 mt-1">{option.discount}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Warranty Plan */}
        <div className="bg-card rounded-xl shadow-lg p-8 mb-8 border border-border/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Vehicle Warranty Plan</h2>
            <p className="text-muted-foreground">Comprehensive coverage for your vehicle</p>
          </div>

          {/* Payment Period Selection */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {[
              { key: '12months' as const, label: '1 Year' },
              { key: '24months' as const, label: '2 Years' },
              { key: '36months' as const, label: '3 Years' }
            ].map((period) => {
              const isSelected = paymentType === period.key;
              const isMostPopular = period.key === '24months';
              
              // Calculate price for this specific period
              const basePrices = {
                '12months': { 0: 559, 50: 529, 100: 459, 150: 429 },
                '24months': { 0: 1009, 50: 959, 100: 829, 150: 779 },
                '36months': { 0: 1349, 50: 1279, 100: 1109, 150: 1039 }
              };
              const periodPrice = basePrices[period.key][voluntaryExcess as keyof typeof basePrices[typeof period.key]] || basePrices[period.key][0];
              const months = period.key === '12months' ? 12 : period.key === '24months' ? 24 : 36;
              const monthlyPrice = Math.round(periodPrice / months);
              
              return (
                <div key={period.key} className="relative">
                  {isMostPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                      Most Popular
                    </Badge>
                  )}
                  <button
                    onClick={() => setPaymentType(period.key)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 min-w-[180px] ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-2">{period.label}</div>
                    <div className="text-2xl font-bold mb-1">£{periodPrice}</div>
                    <div className="text-sm text-muted-foreground">£{monthlyPrice} per month</div>
                    {period.key === '36months' && (
                      <div className="text-xs text-green-600 mt-2 font-medium">Best Value - Save more!</div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* What's Covered */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">What's Covered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coverageFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Add-ons */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Optional Add-ons</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOnOptions.map((addon) => (
                <div key={addon.name} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    id={addon.name}
                    checked={selectedAddOns[addon.name] || false}
                    onCheckedChange={() => toggleAddOn(addon.name)}
                  />
                  <label htmlFor={addon.name} className="flex-1 cursor-pointer text-sm">
                    {addon.name}
                  </label>
                  <span className="text-sm font-medium">£{addon.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty Plan Details & PDF Link */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Warranty Plan Details</span>
            </div>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View PDF <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Buy Now Button */}
          <div className="text-center">
            <Button 
              onClick={handleSelectPlan}
              disabled={loading}
              size="lg"
              className="px-8 py-4 text-lg font-semibold min-w-[200px] bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Processing...' : `Buy ${paymentType === '12months' ? '1' : paymentType === '24months' ? '2' : '3'} Year Plan - £${calculateBasePrice() + calculateAddOnTotal()}`}
            </Button>
            <div className="text-sm text-muted-foreground mt-2">
              Voluntary Excess: £{voluntaryExcess}
              {getDiscountPercentage() > 0 && (
                <span className="text-green-600 ml-2">({getDiscountPercentage()}% discount applied)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTable;