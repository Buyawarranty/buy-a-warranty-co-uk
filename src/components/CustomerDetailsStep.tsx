
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, Percent, Info, AlertCircle, CheckCircle } from 'lucide-react';
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
  planId: string;
  paymentType: string;
  planName: string;
  pricingData: {
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
  planId,
  paymentType,
  planName,
  pricingData,
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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showValidation, setShowValidation] = useState(false);

  // Helper function to get payment period months
  const getPaymentPeriodMonths = () => {
    switch (paymentType) {
      case 'yearly': return 12;
      case 'two_yearly': return 24;
      case 'three_yearly': return 36;
      default: return 12;
    }
  };

  // Calculate prices based on pricing data
  // For Bumper: always use the original monthly price shown on pricing page
  // This ensures users pay the same monthly amount (e.g., £56) for 12 payments regardless of warranty duration
  const monthlyBumperPrice = pricingData.monthlyPrice; // Use the original monthly price from pricing page
  const bumperTotalPrice = monthlyBumperPrice * 12; // Always 12 payments with Bumper
  const stripePrice = Math.round(bumperTotalPrice * 0.95); // 5% discount based on order summary total
  
  // Apply discount if valid
  const discountedBumperPrice = discountValidation?.isValid 
    ? discountValidation.finalAmount 
    : bumperTotalPrice; // Use Bumper total (monthly x 12)
  
  const discountedStripePrice = discountValidation?.isValid 
    ? Math.round(discountValidation.finalAmount * 0.95)
    : stripePrice;

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
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
          orderAmount: bumperTotalPrice
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
          finalAmount: bumperTotalPrice
        });
        toast.error('Invalid discount code');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
        setDiscountValidation({
          isValid: false,
          message: 'Error validating discount code',
          discountAmount: 0,
          finalAmount: bumperTotalPrice
        });
      toast.error('Error validating discount code');
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const validateFields = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customerData.first_name.trim()) errors.first_name = 'First name is required';
    if (!customerData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!customerData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(customerData.email)) errors.email = 'Email format is invalid';
    if (!customerData.mobile.trim()) errors.mobile = 'Mobile number is required';
    if (!customerData.street.trim()) errors.street = 'Address is required';
    if (!customerData.town.trim()) errors.town = 'Town/City is required';
    if (!customerData.postcode.trim()) errors.postcode = 'Postcode is required';
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    const errors = validateFields();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please complete all required fields correctly');
      return;
    }

    setLoading(true);
    
    try {
      let checkoutUrl = '';
      
      if (paymentMethod === 'bumper') {
        console.log('Creating Bumper checkout with final price:', discountedBumperPrice);
        const { data, error } = await supabase.functions.invoke('create-bumper-checkout', {
          body: {
            planId: planName.toLowerCase(),
            vehicleData,
            paymentType: paymentType,
            voluntaryExcess: pricingData.voluntaryExcess,
            customerData: customerData,
            discountCode: customerData.discount_code || null,
            finalAmount: discountedBumperPrice // Pass the final calculated amount
          }
        });

        if (error) throw error;

        if (data.fallbackToStripe) {
          console.log('Bumper credit check failed, creating Stripe fallback checkout');
          toast.error('Credit check failed. Redirecting to full payment option.');
          
          // Create Stripe checkout with the fallback data
          const stripeResponse = await supabase.functions.invoke('create-stripe-checkout', {
            body: data.fallbackData
          });
          
          if (stripeResponse.error) throw stripeResponse.error;
          checkoutUrl = stripeResponse.data.url;
        } else {
          checkoutUrl = data.url;
        }
      } else {
        console.log('Creating Stripe checkout with discounted price:', discountedStripePrice);
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            planName: planName.toLowerCase(),
            paymentType: 'yearly', // Always yearly for Stripe full payment
            voluntaryExcess: pricingData.voluntaryExcess,
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
        // Redirect in the same tab so we can properly return to thank you page
        window.location.href = checkoutUrl;
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
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={onBack} className="mb-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Details Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="Enter first name"
                    value={customerData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                    className={`mt-1 ${fieldErrors.first_name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="Enter last name"
                    value={customerData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                    className={`mt-1 ${fieldErrors.last_name ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className={`mt-1 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="Enter mobile number"
                  value={customerData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                  className={`mt-1 ${fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {fieldErrors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.mobile}</p>
                )}
              </div>

              {/* Address Details */}
              <div className="pt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Address Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="text-sm font-medium text-gray-700">Address Line 1 *</Label>
                    <Input
                      id="street"
                      placeholder="Street address and house/building number"
                      value={customerData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      required
                      className={`mt-1 ${fieldErrors.street ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {fieldErrors.street && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.street}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="building_name" className="text-sm font-medium text-gray-700">Address Line 2 (optional)</Label>
                    <Input
                      id="building_name"
                      placeholder="Apartment, flat, building name"
                      value={customerData.building_name}
                      onChange={(e) => handleInputChange('building_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="town" className="text-sm font-medium text-gray-700">Town/City *</Label>
                      <Input
                        id="town"
                        placeholder="Enter town/city"
                        value={customerData.town}
                        onChange={(e) => handleInputChange('town', e.target.value)}
                        required
                        className={`mt-1 ${fieldErrors.town ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {fieldErrors.town && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.town}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="county" className="text-sm font-medium text-gray-700">County</Label>
                      <Input
                        id="county"
                        placeholder="Enter county"
                        value={customerData.county}
                        onChange={(e) => handleInputChange('county', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="Enter postcode"
                      value={customerData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      required
                      className={`mt-1 ${fieldErrors.postcode ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {fieldErrors.postcode && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.postcode}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="vehicle_reg" className="text-sm font-medium text-gray-700">Vehicle Registration *</Label>
                    <Input
                      id="vehicle_reg"
                      placeholder="Vehicle registration"
                      value={customerData.vehicle_reg}
                      onChange={(e) => handleInputChange('vehicle_reg', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Confidence Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-green-800 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Shop with confidence - cancel anytime within 14 days for a full refund 💸
                </div>
              </div>
              
              {/* Vehicle Registration Display */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center bg-[#ffdb00] text-gray-900 font-bold text-lg px-4 py-3 rounded-[6px] shadow-sm leading-tight border-2 border-black">
                  <img 
                    src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                    alt="GB Flag" 
                    className="w-[25px] h-[18px] mr-3 object-cover rounded-[2px]"
                  />
                  <div className="font-bold font-sans tracking-normal">
                    {vehicleData.regNumber}
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cover period:</span>
                  <span className="font-semibold">
                    {paymentType === 'yearly' ? '1 Year' :
                     paymentType === 'two_yearly' ? '2 Years' :
                     paymentType === 'three_yearly' ? '3 Years' : '1 Year'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Voluntary Excess:</span>
                  <span className="font-semibold">£{pricingData.voluntaryExcess}</span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="text-green-600 font-semibold text-lg mb-2">
                  Payment: £{Math.round(monthlyBumperPrice)} x 12 easy payments
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Price:</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      £{Math.round(discountValidation?.isValid ? discountValidation.finalAmount : bumperTotalPrice)} for entire cover period
                      {discountValidation?.isValid && (
                        <span className="text-green-600 text-sm ml-2">
                          (5% discount applied: -£{Math.round(bumperTotalPrice - discountValidation.finalAmount)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Discount Code Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Discount Code</h4>
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
                      className="flex-1"
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
                    <div className={`text-sm p-3 rounded-md flex items-center gap-2 mt-2 ${
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
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={(value: 'bumper' | 'stripe') => setPaymentMethod(value)} className="space-y-4">
                {/* Monthly Interest Free Credit */}
                <div className={`border rounded-lg p-4 ${paymentMethod === 'bumper' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="bumper" id="bumper" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="bumper" className="font-semibold text-gray-900">Monthly Interest-Free Credit</Label>
                        <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          0% Interest
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Pay £{Math.round(monthlyBumperPrice)} x 12 monthly payments = £{Math.round(discountValidation?.isValid ? discountValidation.finalAmount : bumperTotalPrice)} total
                        {discountValidation?.isValid && (
                          <span className="text-green-600"> (discount applied)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pay Full Amount */}
                <div className={`border rounded-lg p-4 ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="stripe" className="font-semibold text-gray-900">Pay Full Amount</Label>
                        <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          Save a further 5% (£{Math.round((discountValidation?.isValid ? discountValidation.finalAmount : bumperTotalPrice) * 0.05)})
                        </div>
                      </div>
                       <p className="text-sm text-gray-600">
                        Pay £{discountedStripePrice} upfront via card 
                        {discountValidation?.isValid ? (
                          <span> (was £{Math.round(discountValidation.finalAmount * 0.95)})</span>
                        ) : (
                          <span> (was £{Math.round(bumperTotalPrice)})</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              {/* Complete Purchase Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 text-lg rounded-lg"
                size="lg"
              >
                {loading ? 'Processing...' : 'Complete Purchase'}
              </Button>

              <div className="text-center mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
                Secure checkout powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;
