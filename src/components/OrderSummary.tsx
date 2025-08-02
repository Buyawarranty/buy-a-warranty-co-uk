import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderSummaryProps {
  vehicleData: any;
  selectedPlan?: {
    id: string;
    name?: string;
    paymentType: string;
  };
  paymentType: 'yearly' | 'two_yearly' | 'three_yearly';
  voluntaryExcess: number;
  selectedAddOns: {[addon: string]: boolean};
  plans: any[];
  mode: 'plan-selection' | 'checkout';
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  vehicleData,
  selectedPlan,
  paymentType,
  voluntaryExcess,
  selectedAddOns,
  plans,
  mode
}) => {
  const [pdfUrls, setPdfUrls] = useState<{[planName: string]: string}>({});

  useEffect(() => {
    const fetchPdfUrls = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('warranty-pdfs')
          .list('', { limit: 100 });

        if (error) {
          console.error('Error fetching PDF files:', error);
          return;
        }

        const urlMap: {[planName: string]: string} = {};
        
        for (const file of data) {
          if (file.name.endsWith('.pdf')) {
            const { data: urlData } = await supabase.storage
              .from('warranty-pdfs')
              .getPublicUrl(file.name);
            
            const fileName = file.name.toLowerCase().replace('.pdf', '');
            urlMap[fileName] = urlData.publicUrl;
          }
        }
        
        setPdfUrls(urlMap);
      } catch (error) {
        console.error('Error setting up PDF URLs:', error);
      }
    };

    fetchPdfUrls();
  }, []);

  const getCurrentPlan = () => {
    if (selectedPlan) {
      return plans.find(p => p.id === selectedPlan.id);
    }
    return null;
  };

  const calculatePlanPrice = (plan: any) => {
    if (!plan) return 0;
    
    const priceMap = {
      yearly: plan.yearly_price,
      two_yearly: plan.two_yearly_price,
      three_yearly: plan.three_yearly_price
    };
    
    let basePrice = priceMap[paymentType] || plan.yearly_price || 0;
    
    if (plan.pricing_matrix && voluntaryExcess !== 50) {
      const excessMultiplier = plan.pricing_matrix[voluntaryExcess.toString()] || 1;
      basePrice = basePrice * excessMultiplier;
    }
    
    return basePrice;
  };

  const calculateAddOnPrice = () => {
    let addOnTotal = 0;
    const plan = getCurrentPlan();
    if (!plan) return addOnTotal;

    Object.entries(selectedAddOns).forEach(([addon, isSelected]) => {
      if (isSelected) {
        addOnTotal += 10; // Base add-on price
      }
    });
    
    return addOnTotal;
  };

  const getPlanSavings = (plan: any) => {
    if (!plan || paymentType === 'yearly') return null;
    
    const yearlyPrice = plan.yearly_price || 0;
    const currentPrice = calculatePlanPrice(plan);
    
    if (paymentType === 'two_yearly' && plan.two_yearly_price) {
      return Math.round((yearlyPrice * 2) - plan.two_yearly_price);
    } else if (paymentType === 'three_yearly' && plan.three_yearly_price) {
      return Math.round((yearlyPrice * 3) - plan.three_yearly_price);
    }
    
    return null;
  };

  const plan = getCurrentPlan();
  const basePrice = plan ? calculatePlanPrice(plan) : 0;
  const addOnPrice = calculateAddOnPrice();
  const totalPrice = basePrice + addOnPrice;
  const savings = plan ? getPlanSavings(plan) : null;

  const getPdfUrl = () => {
    if (!plan) return null;
    
    const planType = plan.name.toLowerCase();
    const vehicleType = vehicleData?.vehicleType?.toLowerCase();

    if (vehicleType === 'motorbike') {
      return pdfUrls['motorbike'];
    } else if (vehicleType === 'electric' || vehicleType === 'ev') {
      return pdfUrls['electric'];
    } else if (vehicleType === 'phev' || vehicleType === 'hybrid') {
      return pdfUrls['phev'];
    } else {
      return pdfUrls[planType];
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicle Information */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Vehicle Details</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Registration:</strong> {vehicleData?.regNumber}</p>
            <p><strong>Mileage:</strong> {vehicleData?.mileage ? `${vehicleData.mileage} miles` : 'N/A'}</p>
            {vehicleData?.make && <p><strong>Make:</strong> {vehicleData.make}</p>}
            {vehicleData?.model && <p><strong>Model:</strong> {vehicleData.model}</p>}
            {vehicleData?.year && <p><strong>Year:</strong> {vehicleData.year}</p>}
          </div>
        </div>

        {/* Selected Plan */}
        {plan && (
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Plan</h3>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-lg ${
                plan.name === 'Basic' ? 'text-blue-900' :
                plan.name === 'Gold' ? 'text-yellow-600' :
                'text-orange-600'
              }`}>
                {plan.name}
              </span>
              <Badge variant="secondary">
                {paymentType === 'yearly' ? '1 Year' :
                 paymentType === 'two_yearly' ? '2 Years' :
                 '3 Years'}
              </Badge>
            </div>
            
            {/* Coverage Overview */}
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-gray-700">Key Coverage:</h4>
              <div className="space-y-1">
                {plan.coverage?.slice(0, 3).map((item: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
                {plan.coverage?.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{plan.coverage.length - 3} more items covered
                  </p>
                )}
              </div>
            </div>

            {/* PDF Link */}
            {getPdfUrl() && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mb-4"
                onClick={() => window.open(getPdfUrl(), '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Full Details (PDF)
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {plan && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Price Breakdown</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Premium</span>
                <span>£{Math.round(basePrice)}</span>
              </div>
              
              {voluntaryExcess !== 50 && (
                <div className="flex justify-between text-gray-600">
                  <span>Excess Adjustment ({voluntaryExcess})</span>
                  <span>Included</span>
                </div>
              )}
              
              {addOnPrice > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>£{Math.round(addOnPrice)}</span>
                </div>
              )}
              
              {savings && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Savings</span>
                  <span>-£{savings}</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">
                    £{Math.round(totalPrice)}
                  </span>
                  <div className="text-sm text-gray-600">
                    {paymentType === 'yearly' ? 'per year' :
                     paymentType === 'two_yearly' ? 'for 2 years' :
                     'for 3 years'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center text-sm text-green-800">
            <Check className="h-4 w-4 mr-2 text-green-600" />
            <span>SSL Secured Checkout</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;