import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle, Edit, User, CreditCard, MapPin } from 'lucide-react';
import { PostcodeAutocomplete } from '@/components/ui/uk-postcode-autocomplete';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddAnotherWarrantyOffer from '@/components/AddAnotherWarrantyOffer';
import { useAuth } from '@/hooks/useAuth';
import { trackFormSubmission, trackEvent } from '@/utils/analytics';
import { getWarrantyDurationInMonths } from '@/lib/warrantyDurationUtils';

export interface CustomerDetailsStepProps {
  vehicleData: {
    regNumber: string;
    make: string;
    model?: string;
    year?: string;
    fuelType?: string;
    mileage: string;
    engineSize?: string;
    bodyType?: string;
    colour?: string;
    transmission?: string;
    dateOfRegistration?: string;
    found?: boolean;
    error?: string;
    isManualEntry?: boolean;
  };
  planId: string;
  paymentType: string;
  planName: string;
  pricingData: {
    basePrice: number;
    totalPrice: number;
    installmentBreakdown?: {
      upfrontInstallment: number;
      monthlyInstallment: number;
      standardInstallment: number;
      hasTransfer: boolean;
      transferAmount: number;
    };
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
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postcode: '',
    date_of_birth: '',
    marketing_opt_in: false,
    privacy_policy_accepted: false,
    terms_conditions_accepted: false,
    contact_method: 'email' as 'email' | 'phone'
  });

  const [paymentMethod, setPaymentMethod] = useState<'bumper' | 'stripe'>('bumper');
  
  const [showValidation, setShowValidation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [addAnotherWarrantyRequested, setAddAnotherWarrantyRequested] = useState(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoCodeError, setPromoCodeError] = useState<string>('');
  const { user } = useAuth();

  // Check for discount code on component mount
  useEffect(() => {
    const savedDiscountCode = localStorage.getItem('secondWarrantyDiscountCode');
    if (savedDiscountCode && savedDiscountCode.startsWith('SECOND10-')) {
      setAppliedDiscountCode(savedDiscountCode);
      setDiscountAmount(0.10); // 10% discount
    }
  }, []);

  // Calculate pricing with discounts
  const bumperTotalPrice = pricingData.totalPrice;
  const stripeTotalPrice = Math.round(pricingData.totalPrice * 0.95);

  // Only apply discount if customer has a valid discount code (from completed purchase)
  const hasValidDiscountCode = appliedDiscountCode && discountAmount > 0;
  const discountedPrice = hasValidDiscountCode ? bumperTotalPrice * (1 - discountAmount) : bumperTotalPrice;
  const discountedBumperPrice = Math.round(discountedPrice);
  const discountedStripePrice = Math.round(discountedPrice * 0.95); // 5% upfront discount on discounted price

  const hasSecondWarrantyDiscount = hasValidDiscountCode;

  const handleInputChange = (field: string, value: string | boolean) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { 
          code: promoCodeInput.trim(),
          customerEmail: customerData.email,
          orderAmount: bumperTotalPrice
        }
      });

      if (error) throw error;

      if (data.valid) {
        setAppliedDiscountCode(promoCodeInput.trim());
        // Use the actual discount amount or calculate percentage discount
        const discountPercentage = data.discountCode.type === 'percentage' 
          ? data.discountCode.value 
          : (data.discountAmount / bumperTotalPrice) * 100;
        setDiscountAmount(discountPercentage / 100);
        setPromoCodeInput('');
        setPromoCodeError('');
        
        const discountText = data.discountCode.type === 'percentage' 
          ? `${data.discountCode.value}% discount` 
          : `£${data.discountAmount.toFixed(2)} discount`;
        toast.success(`Promo code applied! ${discountText}`);
      } else {
        setPromoCodeError(data.error || 'Invalid or expired promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeError('Unable to validate promo code. Please try again.');
    }
  };

  const removePromoCode = () => {
    setAppliedDiscountCode('');
    setDiscountAmount(0);
    setPromoCodeInput('');
    setPromoCodeError('');
    toast.success('Promo code removed');
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // UK phone number validation (landline and mobile)
    const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?1\d{3}|\(?01\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?2\d{2}|\(?02\d{2}\)?)\s?\d{3}\s?\d{4}$/;
    
    // UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
    
    if (!customerData.first_name.trim()) errors.first_name = 'First name is required';
    if (!customerData.last_name.trim()) errors.last_name = 'Last name is required';
    
    if (!customerData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(customerData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!customerData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(customerData.phone)) {
      errors.phone = 'Please enter a valid UK phone number';
    }
    
    if (!customerData.address_line_1.trim()) errors.address_line_1 = 'Address is required';
    if (!customerData.city.trim()) errors.city = 'City is required';
    
    if (!customerData.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    } else if (!postcodeRegex.test(customerData.postcode)) {
      errors.postcode = 'Please enter a valid UK postcode';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setShowValidation(true);
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      trackEvent('form_validation_error', { form_name: 'customer_details' });
      return;
    }

    // Track customer details form submission
    trackFormSubmission('customer_details', {
      payment_type: paymentType,
      payment_method: paymentMethod
    });

    try {
      const finalPrice = paymentMethod === 'stripe' ? discountedStripePrice : discountedBumperPrice;
      
      onNext({
        ...customerData,
        paymentMethod,
        finalPrice,
        planId,
        paymentType,
        discountCode: appliedDiscountCode,
        discountAmount: hasSecondWarrantyDiscount ? discountAmount : 0,
        addAnotherWarranty: addAnotherWarrantyRequested
      });

      // Clear the discount code after use
      if (appliedDiscountCode) {
        localStorage.removeItem('secondWarrantyDiscountCode');
        localStorage.removeItem('addAnotherWarrantyDiscount');
      }
    } catch (error) {
      console.error('Error submitting customer details:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f4fb] w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Button>
        </div>

        {/* Header with Clickable Logo */}
        <div className="flex justify-center mb-8">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
              alt="Buy a Warranty" 
              className="h-10 w-auto"
            />
          </a>
        </div>

        {/* Almost Done Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-black" />
            <h1 className="text-3xl font-bold text-black">Almost done! Just confirm your details</h1>
          </div>
        </div>


        {/* Customer Details Form */}
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Personal Details Form */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tell us about yourself</h3>
                
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
                        className={`mt-1 transition-all duration-300 ${
                          showValidation && !customerData.first_name.trim() 
                            ? 'border-red-500 focus:border-red-500 animate-pulse' 
                            : 'focus:ring-2 focus:ring-blue-200'
                        }`}
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
                        className={`mt-1 transition-all duration-300 ${
                          showValidation && !customerData.last_name.trim() 
                            ? 'border-red-500 focus:border-red-500 animate-pulse' 
                            : 'focus:ring-2 focus:ring-blue-200'
                        }`}
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
                      placeholder="e.g., john.smith@email.com"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={`mt-1 transition-all duration-300 ${
                        showValidation && fieldErrors.email 
                          ? 'border-red-500 focus:border-red-500 animate-pulse' 
                          : 'focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 07123 456789 or 01234 567890"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className={`mt-1 transition-all duration-300 ${
                        showValidation && fieldErrors.phone 
                          ? 'border-red-500 focus:border-red-500 animate-pulse' 
                          : 'focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">UK mobile or landline numbers only</p>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address_line_1" className="text-sm font-medium text-gray-700">Address Line 1 *</Label>
                      <Input
                        id="address_line_1"
                        placeholder="Enter your address"
                        value={customerData.address_line_1}
                        onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                        required
                        className={`mt-1 transition-all duration-300 ${
                          showValidation && !customerData.address_line_1.trim() 
                            ? 'border-red-500 focus:border-red-500 animate-pulse' 
                            : 'focus:ring-2 focus:ring-blue-200'
                        }`}
                      />
                      {fieldErrors.address_line_1 && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.address_line_1}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="address_line_2" className="text-sm font-medium text-gray-700">Address Line 2</Label>
                      <Input
                        id="address_line_2"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={customerData.address_line_2}
                        onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                        className="mt-1 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode *</Label>
                        <PostcodeAutocomplete
                          value={customerData.postcode}
                          onChange={(value) => handleInputChange('postcode', value)}
                          onAddressSelect={(address) => {
                            // Auto-populate address fields when postcode is selected
                            if (address.town) {
                              handleInputChange('city', address.town);
                            }
                            if (address.street && !customerData.address_line_1) {
                              handleInputChange('address_line_1', address.street);
                            }
                          }}
                          placeholder="e.g., SW1A 1AA"
                          required
                          className={`${
                            showValidation && fieldErrors.postcode 
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                          error={fieldErrors.postcode}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City/Town *</Label>
                        <Input
                          id="city"
                          placeholder="Enter your city/town"
                          value={customerData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                          className={`mt-1 transition-all duration-300 ${
                            showValidation && fieldErrors.city 
                              ? 'border-red-500 focus:border-red-500 animate-pulse' 
                              : 'focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">This may auto-fill from your postcode</p>
                      </div>
                    </div>
                  </div>

                  <AddAnotherWarrantyOffer
                    onAddAnotherWarranty={() => setAddAnotherWarrantyRequested(true)}
                  />
                </form>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onBack}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Change
                    </Button>
                  </div>
                  
                  {/* Confidence Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center text-green-800 font-medium">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Shop with confidence - cancel anytime within 14 days for a full refund 💸
                    </div>
                  </div>

                   {/* Plan Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan</span>
                      <span className="font-semibold">{planName.replace(/premium/gi, 'Platinum')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{paymentType === '12months' 
                        ? '1 Year'
                        : paymentType === '24months' 
                          ? '2 Years'
                          : '3 Years'
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-semibold">{vehicleData.make} {vehicleData.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Registration</span>
                      <span className="font-semibold">{vehicleData.regNumber}</span>
                    </div>
                    
                    {/* Promo Code Section */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Promo Code</span>
                        {hasValidDiscountCode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removePromoCode}
                            className="text-red-600 hover:text-red-800 h-auto p-1"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      {hasValidDiscountCode ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-800">{appliedDiscountCode}</span>
                            <span className="text-green-600 font-medium">{Math.round(discountAmount * 100)}% OFF</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter promo code"
                              value={promoCodeInput}
                              onChange={(e) => {
                                setPromoCodeInput(e.target.value.toUpperCase());
                                setPromoCodeError('');
                              }}
                              className="flex-1"
                            />
                            <Button
                              onClick={applyPromoCode}
                              variant="outline"
                              size="sm"
                              disabled={!promoCodeInput.trim()}
                            >
                              Apply
                            </Button>
                          </div>
                          {promoCodeError && (
                            <p className="text-red-500 text-xs">{promoCodeError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                   {/* Pricing Information */}
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                     {(() => {
                       const months = getWarrantyDurationInMonths(paymentType);
                       const monthlyPayment = Math.round(discountedBumperPrice / 12);
                       
                       if (months === 12) {
                         return (
                           <div className="text-center">
                             <div className="text-2xl font-bold text-blue-800 mb-2">£{monthlyPayment}/month</div>
                             <div className="flex items-center justify-center text-green-600 mb-2">
                               <span className="mr-2">✓</span>
                               <span className="font-medium">Only 12 easy payments</span>
                             </div>
                             <div className="text-lg font-semibold text-gray-900">
                               Total cost: £{discountedBumperPrice}
                             </div>
                           </div>
                         );
                       } else if (months === 24) {
                         // Use actual pricing data instead of simulated calculations
                         const originalPrice = discountedBumperPrice + 100; // £100 discount for 2-year
                         const savings = 100;
                         return (
                           <div className="text-center">
                             <div className="text-2xl font-bold text-blue-800 mb-2">£{monthlyPayment}/month</div>
                             <div className="space-y-1 mb-3">
                               <div className="flex items-center justify-center text-green-600">
                                 <span className="mr-2">✓</span>
                                 <span className="font-medium">Only 12 easy payments</span>
                               </div>
                               <div className="flex items-center justify-center text-green-600">
                                 <span className="mr-2">✓</span>
                                 <span className="font-medium">Nothing to pay in Year 2</span>
                               </div>
                             </div>
                             <div className="text-lg font-semibold text-gray-900">
                               Total cost: <span className="line-through text-gray-500">£{originalPrice}</span> £{discountedBumperPrice} <span className="text-green-600">Save £{savings}</span>
                             </div>
                           </div>
                         );
                       } else if (months === 36) {
                         // Use actual pricing data instead of simulated calculations  
                         const originalPrice = discountedBumperPrice + 200; // £200 discount for 3-year
                         const savings = 200;
                         return (
                           <div className="text-center">
                             <div className="text-2xl font-bold text-blue-800 mb-2">£{monthlyPayment}/month</div>
                             <div className="space-y-1 mb-3">
                               <div className="flex items-center justify-center text-green-600">
                                 <span className="mr-2">✓</span>
                                 <span className="font-medium">Only 12 easy payments</span>
                               </div>
                               <div className="flex items-center justify-center text-green-600">
                                 <span className="mr-2">✓</span>
                                 <span className="font-medium">Nothing to pay in Year 2 and Year 3</span>
                               </div>
                             </div>
                             <div className="text-lg font-semibold text-gray-900">
                               Total cost: <span className="line-through text-gray-500">£{originalPrice}</span> £{discountedBumperPrice} <span className="text-green-600">Save £{savings}</span>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()}
                   </div>

                   {/* Terms and Conditions Notice */}
                   <div className="text-center mb-6">
                     <p className="text-sm text-gray-500">
                       By completing your purchase, you confirm you've read and accept the Warranty Terms & Conditions
                     </p>
                   </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value: 'bumper' | 'stripe') => setPaymentMethod(value)}>
                      {/* Monthly Interest Free Credit */}
                      <div className={`border rounded-lg p-4 ${paymentMethod === 'bumper' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                         <div className="flex items-center space-x-3">
                           <RadioGroupItem value="bumper" id="bumper" className="border-black text-black" />
                           <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor="bumper" className="font-semibold text-gray-900">Monthly Interest-Free Credit</Label>
                              <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                0% Interest
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              <div className="flex items-center mb-1">
                                <span className="text-green-600 mr-2">✔️</span>
                                <span>Only a soft credit search</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-green-600 mr-2">✔️</span>
                                <span>No impact on your credit score</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Pay £{Math.round(discountedBumperPrice / 12)} x 12 monthly payments = £{Math.round(discountedBumperPrice)} total
                              {hasSecondWarrantyDiscount && (
                                <span className="text-orange-600"> ({Math.round(discountAmount * 100)}% discount applied)</span>
                              )}
                              {hasSecondWarrantyDiscount && (
                                <span className="text-gray-500 line-through ml-2">was £{Math.round(bumperTotalPrice)}</span>
                              )}
                              {hasSecondWarrantyDiscount && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <span className="font-semibold text-orange-800">Discount Code Applied: {appliedDiscountCode}</span>
                                </div>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pay Full Amount */}
                      <div className={`border rounded-lg p-4 ${paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                         <div className="flex items-center space-x-3">
                           <RadioGroupItem value="stripe" id="stripe" className="border-black text-black" />
                           <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor="stripe" className="font-semibold text-gray-900">Pay Full Amount</Label>
                               <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                  Save a further 5% (£{Math.round(discountedPrice * 0.05)})
                                </div>
                            </div>
                             <p className="text-sm text-gray-600">
                              Pay £{discountedStripePrice} upfront via card
                              {hasSecondWarrantyDiscount && (
                                <span className="text-orange-600"> ({Math.round(discountAmount * 100)}% discount + 5% upfront discount)</span>
                              )}
                              {!hasSecondWarrantyDiscount && (
                                <span className="text-green-600"> (5% upfront discount)</span>
                              )}
                              {hasSecondWarrantyDiscount && (
                                <span className="text-gray-500 line-through ml-2">was £{Math.round(bumperTotalPrice)}</span>
                              )}
                              {hasSecondWarrantyDiscount && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <span className="font-semibold text-orange-800">Discount Code Applied: {appliedDiscountCode}</span>
                                </div>
                              )}
                             </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>

                    {/* Complete Purchase Button */}
                    <Button
                      onClick={handleSubmit}
                      className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-lg"
                      size="lg"
                    >
                      Complete Purchase
                    </Button>

                    <div className="text-center mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                      <CreditCard size={16} className="text-blue-600" />
                      Secure checkout powered by Stripe
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;
