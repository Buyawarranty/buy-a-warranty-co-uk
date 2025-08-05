import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ArrowLeft, Info, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import TrustpilotHeader from '@/components/TrustpilotHeader';

interface SpecialPlan {
  id: string;
  vehicle_type: string;
  name: string;
  monthly_price: number;
  yearly_price: number | null;
  two_yearly_price: number | null;
  three_yearly_price: number | null;
  coverage: string[];
  is_active: boolean;
  pricing_matrix?: any;
}

interface VehicleData {
  regNumber: string;
  mileage: string;
  email: string;
  phone: string;
  firstName: string;
  address: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
}

interface SpecialVehiclePricingProps {
  vehicleData: VehicleData;
  onBack: () => void;
  onPlanSelected?: (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => void;
}

const SpecialVehiclePricing: React.FC<SpecialVehiclePricingProps> = ({ vehicleData, onBack, onPlanSelected }) => {
  const [plan, setPlan] = useState<SpecialPlan | null>(null);
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly' | 'two_yearly' | 'three_yearly'>('monthly');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialPlan();
    fetchPdfUrls();
  }, [vehicleData.vehicleType]);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating bar when user scrolls past the initial pricing cards
      const scrollY = window.scrollY;
      setIsFloatingBarVisible(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSpecialPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('special_vehicle_plans')
        .select('*')
        .eq('vehicle_type', vehicleData.vehicleType)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setPlan({
          ...data,
          coverage: Array.isArray(data.coverage) ? data.coverage.map(item => String(item)) : []
        });
      }
    } catch (error) {
      console.error('Error fetching special vehicle plan:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicle plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getBasePrice = () => {
    if (!plan) return 0;
    
    switch (paymentType) {
      case 'yearly':
        return plan.yearly_price || plan.monthly_price * 12;
      case 'two_yearly':
        return plan.two_yearly_price || plan.monthly_price * 24;
      case 'three_yearly':
        return plan.three_yearly_price || plan.monthly_price * 36;
      default:
        return plan.monthly_price;
    }
  };

  const calculatePlanPrice = () => {
    const basePrice = getBasePrice();
    // Apply voluntary excess discount
    const excessDiscount = voluntaryExcess * 0.01; // 1% discount per £1 excess
    return Math.max(basePrice * (1 - excessDiscount), basePrice * 0.7); // Min 30% of base price
  };

  const getMonthlyDisplayPrice = () => {
    if (!plan) return 0;
    
    // Try to use database pricing matrix first, fallback to hardcoded
    if (plan.pricing_matrix && typeof plan.pricing_matrix === 'object') {
      const matrix = plan.pricing_matrix as any;
      const periodData = matrix[paymentType];
      if (periodData && periodData[voluntaryExcess.toString()]) {
        return periodData[voluntaryExcess.toString()].monthly || 0;
      }
    }
    
    // Fallback to hardcoded pricing (Gold plan equivalent)
    const fallbackPricingTable = {
      yearly: {
        0: { monthly: 34 },
        50: { monthly: 31 },
        100: { monthly: 27 },
        150: { monthly: 26 },
        200: { monthly: 23 }
      },
      two_yearly: {
        0: { monthly: 61 },
        50: { monthly: 56 },
        100: { monthly: 49 },
        150: { monthly: 47 },
        200: { monthly: 44 }
      },
      three_yearly: {
        0: { monthly: 90 },
        50: { monthly: 82 },
        100: { monthly: 71 },
        150: { monthly: 69 },
        200: { monthly: 66 }
      }
    };
    
    const periodData = fallbackPricingTable[paymentType as keyof typeof fallbackPricingTable] || fallbackPricingTable.yearly;
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[0];
    
    return excessData.monthly;
  };

  const handlePurchase = () => {
    if (!plan) return;
    
    if (onPlanSelected) {
      const monthlyPrice = getMonthlyDisplayPrice();
      
      // Calculate total price based on payment period
      let totalPrice = monthlyPrice;
      if (paymentType === 'yearly') {
        totalPrice = monthlyPrice * 12;
      } else if (paymentType === 'two_yearly') {
        totalPrice = monthlyPrice * 24;
      } else if (paymentType === 'three_yearly') {
        totalPrice = monthlyPrice * 36;
      }
      
      const pricingData = {
        totalPrice,
        monthlyPrice,
        voluntaryExcess,
        selectedAddOns: {}
      };
      onPlanSelected(plan.id, paymentType, plan.name, pricingData);
    }
  };

  const getPaymentLabel = () => {
    switch (paymentType) {
      case 'yearly': return 'per year';
      case 'two_yearly': return 'for 2 years';
      case 'three_yearly': return 'for 3 years';
      default: return 'per month';
    }
  };

  const getVehicleTypeTitle = () => {
    switch (vehicleData.vehicleType) {
      case 'EV': return 'Electric Vehicle';
      case 'PHEV': return 'PHEV / Hybrid';
      case 'MOTORBIKE': return 'Motorbikes';
      default: return vehicleData.vehicleType;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="text-center">Loading special vehicle plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="mb-4">No special plan found for this vehicle type.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
        {/* Back Button and Trustpilot Header */}
        <div className="mb-4 sm:mb-8 px-4 sm:px-8 pt-4 sm:pt-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </Button>
          <TrustpilotHeader />
        </div>

        {/* Header with Vehicle Type Image */}
        <div className="text-center mb-6 sm:mb-10 px-4 sm:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            {getVehicleTypeTitle()}
          </h1>
          
          {/* Vehicle Registration Display */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-sm sm:text-lg px-3 sm:px-4 py-2 sm:py-3 rounded-[6px] shadow-sm leading-tight border-2 border-black">
              <img 
                src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                alt="GB Flag" 
                className="w-[20px] h-[14px] sm:w-[25px] sm:h-[18px] mr-2 sm:mr-3 object-cover rounded-[2px]"
              />
              <div className="font-bold font-sans tracking-normal">
                {vehicleData.regNumber}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {vehicleData.make && vehicleData.model && (
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border max-w-md mx-auto">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {vehicleData.make} {vehicleData.model}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm sm:text-base text-gray-600">
                {vehicleData.fuelType && <span><strong>Fuel:</strong> {vehicleData.fuelType}</span>}
                {vehicleData.year && <span><strong>Year:</strong> {vehicleData.year}</span>}
                {vehicleData.transmission && <span><strong>Transmission:</strong> {vehicleData.transmission}</span>}
                <span><strong>Mileage:</strong> {parseInt(vehicleData.mileage).toLocaleString()} miles</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Period Toggle */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white rounded-2xl p-1 shadow-lg border border-gray-200 inline-flex">
            <button
              onClick={() => setPaymentType('yearly')}
              className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                paymentType === 'yearly' 
                  ? 'bg-[#1a365d] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              1 Year
            </button>
            <div className="relative">
              <button
                onClick={() => setPaymentType('two_yearly')}
                className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                  paymentType === 'two_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                2 Years
              </button>
              <div className="absolute -top-2 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-1">
                10% OFF
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setPaymentType('three_yearly')}
                className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 ${
                  paymentType === 'three_yearly' 
                    ? 'bg-[#1a365d] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                3 Years
              </button>
              <div className="absolute -top-2 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold transform translate-x-1">
                20% OFF
              </div>
            </div>
          </div>
        </div>

        {/* Voluntary Excess Selection */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Voluntary Excess Amount</h3>
            <div className="flex justify-center gap-3">
              {[0, 50, 100, 150].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setVoluntaryExcess(amount)}
                  className={`px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 min-w-[80px] ${
                    voluntaryExcess === amount
                      ? 'bg-[#1a365d] text-white border-2 border-[#1a365d]'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#1a365d]'
                  }`}
                >
                  £{amount}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Single Plan Card */}
        <div className="w-full px-4 pb-16">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 relative">
                {/* Plan Header */}
                <div className="p-8 text-center">
                  <h3 className="text-4xl font-bold mb-4 text-yellow-600">
                    {plan.name}
                  </h3>
                  <p className="text-gray-900 text-xl font-bold mb-6">
                    {paymentType === 'yearly' ? '1 Year warranty' :
                     paymentType === 'two_yearly' ? '2 Year warranty' :
                     paymentType === 'three_yearly' ? '3 Year warranty' :
                     '1 Year warranty'}
                  </p>
                  <div className="text-4xl font-bold text-gray-900 mb-3">
                    <span className="text-2xl">£</span>{Math.round(getMonthlyDisplayPrice())}<span className="text-2xl">/mo</span>
                  </div>
                  <div className="text-gray-600 text-base mb-6">
                    for 12 months interest free
                  </div>
                  
                  <Button
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    className="w-full py-4 text-lg font-bold rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0 transition-colors duration-200"
                  >
                    {checkoutLoading ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>

                {/* Plan Content */}
                <div className="px-8 pb-8">
                  {/* What's Covered */}
                  <div>
                    <h4 className="font-bold text-lg mb-4 text-gray-900">What's Covered:</h4>
                    <div className="space-y-2">
                      {plan.coverage.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-base text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warranty Plan Details PDF - Bottom Section */}
                <div className="p-6 bg-gray-50 rounded-lg m-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Warranty Plan Details</h4>
                      <p className="text-sm text-gray-600">*Full breakdown of coverage</p>
                    </div>
                  </div>
                  {(() => {
                    // Determine which PDF to show based on plan and vehicle type
                    let pdfUrl = null;
                    const planType = plan.name.toLowerCase();
                    const vehicleType = vehicleData.vehicleType?.toLowerCase();

                    if (vehicleType === 'motorbike') {
                      pdfUrl = pdfUrls['motorbike'];
                    } else if (vehicleType === 'electric' || vehicleType === 'ev') {
                      pdfUrl = pdfUrls['electric'];
                    } else if (vehicleType === 'phev' || vehicleType === 'hybrid') {
                      pdfUrl = pdfUrls['phev'];
                    } else {
                      pdfUrl = pdfUrls[planType];
                    }

                    return pdfUrl ? (
                      <Button
                        variant="outline"
                        className="w-full text-sm bg-white hover:bg-gray-50 border-gray-300"
                        onClick={() => window.open(pdfUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View PDF
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-sm bg-white border-gray-300"
                        disabled
                      >
                        PDF Not Available
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p className="mb-2">From £26 per month</p>
              <p>{getVehicleTypeTitle()} Extended Warranty</p>
            </div>
          </div>
        </div>

        {/* Floating Bottom Bar */}
        {isFloatingBarVisible && plan && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-yellow-600">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm">£</span>
                    <span className="text-2xl font-bold">{Math.round(getMonthlyDisplayPrice())}</span>
                    <span className="text-sm text-gray-600">x 12</span>
                  </div>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={checkoutLoading}
                  className="ml-4 px-6 py-2 font-semibold rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                >
                  {checkoutLoading ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SpecialVehiclePricing;
