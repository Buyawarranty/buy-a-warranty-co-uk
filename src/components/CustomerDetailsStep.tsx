
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, Percent, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomerDetailsStepProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    email?: string;
    phone?: string;
    firstName?: string;
    address?: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    vehicleType?: string;
  };
  selectedPlan: {
    id: string;
    name: string;
    paymentType: string;
    totalPrice: number;
    monthlyPrice: number;
    voluntaryExcess: number;
    selectedAddOns: {[addon: string]: boolean};
  };
  onBack: () => void;
  onNext: (customerData: any) => void;
}

const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({ 
  vehicleData, 
  selectedPlan, 
  onBack, 
  onNext 
}) => {
  const [customerData, setCustomerData] = useState({
    first_name: vehicleData.firstName || '',
    last_name: '',
    email: vehicleData.email || '',
    mobile: vehicleData.phone || '',
    flat_number: '',
    building_name: '',
    building_number: '',
    street: '',
    town: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    vehicle_reg: vehicleData.regNumber || '',
    discount_code: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'bumper' | 'stripe'>('bumper');
  const [loading, setLoading] = useState(false);
  const [discountValidation, setDiscountValidation] = useState<{
    isValid: boolean;
    message: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [showDiscountInfo, setShowDiscountInfo] = useState(false);

  // Calculate prices based on final total price from selected plan
  const finalTotalPrice = selectedPlan.totalPrice;
  const monthlyBumperPrice = finalTotalPrice; // Monthly interest free credit shows the total price
  const stripePrice = Math.round(finalTotalPrice * 0.95); // 5% discount for full payment
  
  // Apply discount if valid
  const discountedBumperPrice = discountValidation?.isValid 
    ? discountValidation.finalAmount 
    : monthlyBumperPrice;
  
  const discountedStripePrice = discountValidation?.isValid 
    ? Math.round(discountValidation.finalAmount * 0.95)
    : stripePrice;

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const validateDiscountCode = async () => {
    if (!customerData.discount_code.trim()) {
      setDiscountValidation(null);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: {
          code: customerData.discount_code,
          customerEmail: customerData.email,
          orderAmount: finalTotalPrice
        }
      });

      if (error) throw error;

      if (data.valid) {
        setDiscountValidation({
          isValid: true,
          message: `Discount applied: ${data.discountCode.type === 'percentage' ? data.discountCode.value + '%' : '£' + data.discountCode.value} off`,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount
        });
        toast.success('Discount code applied successfully!');
      } else {
        setDiscountValidation({
          isValid: false,
          message: data.error || 'Invalid discount code',
          discountAmount: 0,
          finalAmount: finalTotalPrice
        });
        toast.error('Invalid discount code');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setDiscountValidation({
        isValid: false,
        message: 'Error validating discount code',
        discountAmount: 0,
        finalAmount: finalTotalPrice
      });
      toast.error('Error validating discount code');
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.first_name || !customerData.last_name || !customerData.email || 
        !customerData.mobile || !customerData.street || !customerData.town || 
        !customerData.county || !customerData.postcode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let checkoutUrl = '';
      
      if (paymentMethod === 'bumper') {
        console.log('Creating Bumper checkout with final price:', discountedBumperPrice);
        const { data, error } = await supabase.functions.invoke('create-bumper-checkout', {
          body: {
            planId: selectedPlan.name.toLowerCase(),
            vehicleData,
            paymentType: selectedPlan.paymentType,
            voluntaryExcess: selectedPlan.voluntaryExcess,
            customerData: customerData,
            discountCode: customerData.discount_code || null,
            finalAmount: discountedBumperPrice // Pass the final calculated amount
          }
        });

        if (error) throw error;

        if (data.fallbackToStripe) {
          toast.error('Credit check failed. Redirecting to yearly payment option.');
          checkoutUrl = data.stripeUrl;
        } else {
          checkoutUrl = data.url;
        }
      } else {
        console.log('Creating Stripe checkout with discounted price:', discountedStripePrice);
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            planName: selectedPlan.name.toLowerCase(),
            paymentType: 'yearly', // Always yearly for Stripe full payment
            voluntaryExcess: selectedPlan.voluntaryExcess,
            vehicleData,
            customerData: customerData,
            discountCode: customerData.discount_code || null,
            finalAmount: discountedStripePrice // Pass the final calculated amount
          }
        });

        if (error) throw error;
        checkoutUrl = data.url;
      }

      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Plans
      </Button>

      {/* Selected Plan Summary */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">{selectedPlan.name} Plan</Badge>
            <span className="text-lg">Selected</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payment Period:</span>
              <p className="font-semibold">
                {selectedPlan.paymentType === 'yearly' ? '1 Year' :
                 selectedPlan.paymentType === 'two_yearly' ? '2 Years' :
                 selectedPlan.paymentType === 'three_yearly' ? '3 Years' : '1 Year'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Monthly Price:</span>
              <p className="font-semibold">£{selectedPlan.monthlyPrice}/mo</p>
            </div>
            <div>
              <span className="text-gray-600">Voluntary Excess:</span>
              <p className="font-semibold">£{selectedPlan.voluntaryExcess}</p>
            </div>
            <div>
              <span className="text-gray-600">Final Total Price:</span>
              <p className="font-bold text-lg text-blue-600">£{finalTotalPrice}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={customerData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={customerData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  value={customerData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicle_reg">Vehicle Registration *</Label>
                <Input
                  id="vehicle_reg"
                  value={customerData.vehicle_reg}
                  onChange={(e) => handleInputChange('vehicle_reg', e.target.value)}
                  required
                />
              </div>

              {/* Address Details */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Address Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flat_number">Flat Number</Label>
                    <Input
                      id="flat_number"
                      value={customerData.flat_number}
                      onChange={(e) => handleInputChange('flat_number', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="building_name">Building Name</Label>
                    <Input
                      id="building_name"
                      value={customerData.building_name}
                      onChange={(e) => handleInputChange('building_name', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="building_number">Building Number</Label>
                  <Input
                    id="building_number"
                    value={customerData.building_number}
                    onChange={(e) => handleInputChange('building_number', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="street">Street *</Label>
                  <Input
                    id="street"
                    value={customerData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="town">Town *</Label>
                    <Input
                      id="town"
                      value={customerData.town}
                      onChange={(e) => handleInputChange('town', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      value={customerData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={customerData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={customerData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Discount Code</h4>
                  <Collapsible open={showDiscountInfo} onOpenChange={setShowDiscountInfo}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Info className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                        <p>Enter a valid discount code to get money off your warranty. The discount will be applied to your final total.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter discount code"
                    value={customerData.discount_code}
                    onChange={(e) => handleInputChange('discount_code', e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={validateDiscountCode}
                    disabled={!customerData.discount_code.trim() || isValidatingDiscount}
                  >
                    {isValidatingDiscount ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
                
                {discountValidation && (
                  <div className={`text-sm p-3 rounded-md flex items-center gap-2 ${
                    discountValidation.isValid 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {discountValidation.isValid ? (
                      <div className="text-green-600">✓</div>
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {discountValidation.message}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'bumper' | 'stripe') => setPaymentMethod(value)}>
              {/* Monthly Interest Free Credit */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bumper" id="bumper" />
                  <Label htmlFor="bumper" className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">Monthly Interest Free Credit</span>
                      </div>
                      <Badge variant="secondary">12 Payments</Badge>
                    </div>
                  </Label>
                </div>
                <div className="ml-6 text-sm text-gray-600 space-y-1">
                  <p>Pay in 12 monthly installments with 0% interest</p>
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                    <span>Monthly Payment:</span>
                    <span className="font-bold text-lg">
                      £{discountedBumperPrice} 
                      {discountValidation?.isValid && (
                        <span className="text-sm text-green-600 ml-2">
                          (Was £{monthlyBumperPrice})
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs">* Subject to credit approval</p>
                </div>
              </div>

              {/* Pay Full Amount */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-semibold">Pay Full Amount</span>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <Percent className="w-3 h-3 mr-1" />
                        5% OFF
                      </Badge>
                    </div>
                  </Label>
                </div>
                <div className="ml-6 text-sm text-gray-600 space-y-1">
                  <p>Pay the full amount upfront and save 5%</p>
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                    <span>Total Payment:</span>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        £{discountedStripePrice}
                        {discountValidation?.isValid && (
                          <span className="text-sm text-green-600 ml-2">
                            (Was £{stripePrice})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        £{discountValidation?.isValid ? Math.round(discountValidation.finalAmount) : finalTotalPrice}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6"
              size="lg"
            >
              {loading ? 'Processing...' : `Proceed to ${paymentMethod === 'bumper' ? 'Credit Application' : 'Payment'}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;
