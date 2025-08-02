import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentOptionsProps {
  paymentMethod: 'bumper' | 'stripe';
  onChange: (method: 'bumper' | 'stripe') => void;
  totalAmount: number;
  onCheckout: () => void;
  isFormValid: boolean;
  mode: 'plan-selection' | 'checkout';
  onPlanSelected?: (planId: string, paymentType: string, planName?: string) => void;
  plans: any[];
  currentPaymentType: 'yearly' | 'two_yearly' | 'three_yearly';
  onPaymentTypeChange: (type: 'yearly' | 'two_yearly' | 'three_yearly') => void;
  voluntaryExcess: number;
  onVoluntaryExcessChange: (excess: number) => void;
  selectedAddOns: {[addon: string]: boolean};
  onSelectedAddOnsChange: (addOns: {[addon: string]: boolean}) => void;
  vehicleData: any;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  paymentMethod,
  onChange,
  totalAmount,
  onCheckout,
  isFormValid,
  mode,
  onPlanSelected,
  plans = [],
  currentPaymentType,
  onPaymentTypeChange,
  voluntaryExcess,
  onVoluntaryExcessChange,
  selectedAddOns,
  onSelectedAddOnsChange,
  vehicleData
}) => {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [showAddOnInfo, setShowAddOnInfo] = useState<{[planId: string]: boolean}>({});
  
  const isBumperAvailable = totalAmount >= 60;

  const calculatePlanPrice = (plan: any) => {
    const priceMap = {
      yearly: plan.yearly_price,
      two_yearly: plan.two_yearly_price,
      three_yearly: plan.three_yearly_price
    };
    
    let basePrice = priceMap[currentPaymentType] || plan.yearly_price || 0;
    
    if (plan.pricing_matrix && voluntaryExcess !== 50) {
      const excessMultiplier = plan.pricing_matrix[voluntaryExcess.toString()] || 1;
      basePrice = basePrice * excessMultiplier;
    }
    
    return basePrice;
  };

  const calculateAddOnPrice = (planId: string) => {
    let addOnTotal = 0;
    
    Object.entries(selectedAddOns).forEach(([addon, isSelected]) => {
      if (isSelected) {
        addOnTotal += 10; // Base add-on price
      }
    });
    
    return addOnTotal;
  };

  const getPlanSavings = (plan: any) => {
    if (currentPaymentType === 'yearly') return null;
    
    const yearlyPrice = plan.yearly_price || 0;
    
    if (currentPaymentType === 'two_yearly' && plan.two_yearly_price) {
      return Math.round((yearlyPrice * 2) - plan.two_yearly_price);
    } else if (currentPaymentType === 'three_yearly' && plan.three_yearly_price) {
      return Math.round((yearlyPrice * 3) - plan.three_yearly_price);
    }
    
    return null;
  };

  const handleSelectPlan = async (plan: any) => {
    if (!onPlanSelected) return;
    
    setLoading({ ...loading, [plan.id]: true });
    
    try {
      onPlanSelected(plan.id, currentPaymentType, plan.name);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading({ ...loading, [plan.id]: false });
    }
  };

  const handleAddOnChange = (planId: string, addon: string, checked: boolean) => {
    const currentPlanAddOns = selectedAddOns || {};
    const updatedAddOns = {
      ...selectedAddOns,
      [addon]: checked
    };
    onSelectedAddOnsChange(updatedAddOns);
  };

  if (mode === 'plan-selection') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Choose Your Warranty Plan
          </CardTitle>
          
          {/* Payment Term Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Payment Term:</Label>
              <Select value={currentPaymentType} onValueChange={onPaymentTypeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">1 Year</SelectItem>
                  <SelectItem value="two_yearly">2 Years</SelectItem>
                  <SelectItem value="three_yearly">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-700">Voluntary Excess:</Label>
              <Select value={voluntaryExcess.toString()} onValueChange={(value) => onVoluntaryExcessChange(Number(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">£0</SelectItem>
                  <SelectItem value="50">£50</SelectItem>
                  <SelectItem value="100">£100</SelectItem>
                  <SelectItem value="150">£150</SelectItem>
                  <SelectItem value="200">£200</SelectItem>
                  <SelectItem value="250">£250</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {plans.map((plan) => {
              const basePrice = calculatePlanPrice(plan);
              const addOnPrice = calculateAddOnPrice(plan.id);
              const totalPrice = basePrice + addOnPrice;
              const isLoading = loading[plan.id];
              const savings = getPlanSavings(plan);
              
              return (
                <div
                  key={plan.id}
                  className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                    plan.name === 'Premium' ? 'border-orange-300 bg-orange-50' :
                    plan.name === 'Gold' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}
                >
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        plan.name === 'Basic' ? 'text-blue-900' :
                        plan.name === 'Gold' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {plan.name}
                      </h3>
                      {plan.name === 'Premium' && (
                        <Badge className="bg-orange-500 text-white mt-1">Most Popular</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg">£</span>
                        <span className="text-3xl font-bold">{Math.round(totalPrice)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentPaymentType === 'yearly' ? 'per year' :
                         currentPaymentType === 'two_yearly' ? 'for 2 years' :
                         'for 3 years'}
                      </div>
                      {savings && (
                        <div className="text-green-600 font-semibold text-sm">
                          Save £{savings}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coverage List */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.coverage?.map((item: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  {plan.add_ons && plan.add_ons.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowAddOnInfo({
                          ...showAddOnInfo,
                          [plan.id]: !showAddOnInfo[plan.id]
                        })}
                        className="flex items-center text-sm font-medium text-gray-700 mb-2"
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Optional Add-ons
                        {showAddOnInfo[plan.id] ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                        }
                      </button>
                      
                      {showAddOnInfo[plan.id] && (
                        <div className="space-y-2 pl-5">
                          {plan.add_ons.map((addon: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${plan.id}-addon-${index}`}
                                checked={selectedAddOns[addon] || false}
                                onCheckedChange={(checked) => 
                                  handleAddOnChange(plan.id, addon, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${plan.id}-addon-${index}`}
                                className="text-sm text-gray-600 cursor-pointer"
                              >
                                {addon} (+£10)
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                      plan.name === 'Basic' ? 'bg-[#1a365d] hover:bg-[#2d4a6b] text-white' :
                      plan.name === 'Gold' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                      'bg-[#eb4b00] hover:bg-[#d44300] text-white'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Select This Plan'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={onChange}>
          {isBumperAvailable && (
            <div className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <RadioGroupItem value="bumper" id="bumper" />
              <Label htmlFor="bumper" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <img src="/lovable-uploads/cacd3333-06fb-4bfb-b8f8-32505122c11d.png" alt="Bumper" className="h-6 w-auto" />
                  <div>
                    <div className="font-semibold text-gray-900">Spread the cost with Bumper</div>
                    <div className="text-sm text-gray-600">Pay monthly over 12 months with 0% APR representative</div>
                  </div>
                </div>
              </Label>
            </div>
          )}
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex-1 cursor-pointer">
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/81af2dba-748e-43a9-b3af-839285969056.png" alt="Stripe" className="h-6 w-auto" />
                <div>
                  <div className="font-semibold text-gray-900">Pay in Full By Card/Bank</div>
                  <div className="text-sm text-gray-600">Pay in full with debit/credit card with a secure Stripe Payment</div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {!isBumperAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The Bumper payment option is only available for orders over £60. 
              Your current order total is £{totalAmount}.
            </p>
          </div>
        )}

        <Button
          onClick={onCheckout}
          disabled={!isFormValid}
          className="w-full bg-[#eb4b00] hover:bg-[#d44300] text-white font-semibold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50"
        >
          Complete Purchase
        </Button>

        <p className="text-xs text-gray-500 text-center">
          * Secure SSL encryption. We'll perform a soft credit check with Bumper if selected.
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentOptions;