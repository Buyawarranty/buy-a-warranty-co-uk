import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle, Edit, User, CreditCard, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddAnotherWarrantyOffer from '@/components/AddAnotherWarrantyOffer';
import { useAuth } from '@/hooks/useAuth';
import { trackFormSubmission, trackEvent } from '@/utils/analytics';

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
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [addAnotherWarrantyRequested, setAddAnotherWarrantyRequested] = useState(false);
  const { user } = useAuth();

  // Calculate pricing with discounts
  const bumperTotalPrice = pricingData.totalPrice;
  const stripeTotalPrice = Math.round(pricingData.totalPrice * 0.95);

  const baseDiscountedPrice = bumperTotalPrice * 0.9;
  const discountedBumperPrice = Math.round(baseDiscountedPrice);
  const discountedStripePrice = Math.round(baseDiscountedPrice * 0.95);

  const hasAutoDiscount = true;

  const handleInputChange = (field: string, value: string | boolean) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customerData.first_name.trim()) errors.first_name = 'First name is required';
    if (!customerData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!customerData.email.trim()) errors.email = 'Email is required';
    if (!customerData.phone.trim()) errors.phone = 'Phone number is required';
    if (!customerData.address_line_1.trim()) errors.address_line_1 = 'Address is required';
    if (!customerData.city.trim()) errors.city = 'City is required';
    if (!customerData.postcode.trim()) errors.postcode = 'Postcode is required';
    if (!customerData.date_of_birth.trim()) errors.date_of_birth = 'Date of birth is required';
    if (!customerData.privacy_policy_accepted) errors.privacy_policy_accepted = 'Privacy policy must be accepted';
    if (!customerData.terms_conditions_accepted) errors.terms_conditions_accepted = 'Terms and conditions must be accepted';

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

    setLoading(true);

    try {
      const finalPrice = paymentMethod === 'stripe' ? discountedStripePrice : discountedBumperPrice;
      
      onNext({
        ...customerData,
        paymentMethod,
        finalPrice,
        planId,
        paymentType
      });
    } catch (error) {
      console.error('Error submitting customer details:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
                      placeholder="Enter your email"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={`mt-1 transition-all duration-300 ${
                        showValidation && !customerData.email.trim() 
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
                      placeholder="Enter your phone number"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className={`mt-1 transition-all duration-300 ${
                        showValidation && !customerData.phone.trim() 
                          ? 'border-red-500 focus:border-red-500 animate-pulse' 
                          : 'focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                    )}
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
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                        <Input
                          id="city"
                          placeholder="Enter your city"
                          value={customerData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                          className={`mt-1 transition-all duration-300 ${
                            showValidation && !customerData.city.trim() 
                              ? 'border-red-500 focus:border-red-500 animate-pulse' 
                              : 'focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.city && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode *</Label>
                        <Input
                          id="postcode"
                          placeholder="Enter your postcode"
                          value={customerData.postcode}
                          onChange={(e) => handleInputChange('postcode', e.target.value)}
                          required
                          className={`mt-1 transition-all duration-300 ${
                            showValidation && !customerData.postcode.trim() 
                              ? 'border-red-500 focus:border-red-500 animate-pulse' 
                              : 'focus:ring-2 focus:ring-blue-200'
                          }`}
                        />
                        {fieldErrors.postcode && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.postcode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={customerData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      required
                      className={`mt-1 transition-all duration-300 ${
                        showValidation && !customerData.date_of_birth.trim() 
                          ? 'border-red-500 focus:border-red-500 animate-pulse' 
                          : 'focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                    {fieldErrors.date_of_birth && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.date_of_birth}</p>
                    )}
                  </div>

                  {/* Legal Checkboxes */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy_policy"
                        checked={customerData.privacy_policy_accepted}
                        onCheckedChange={(checked) => handleInputChange('privacy_policy_accepted', checked as boolean)}
                        className={showValidation && !customerData.privacy_policy_accepted ? 'border-red-500' : ''}
                      />
                      <div className="text-sm">
                        <label htmlFor="privacy_policy" className="font-medium text-gray-700 cursor-pointer">
                          I agree to the <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a> *
                        </label>
                        {fieldErrors.privacy_policy_accepted && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.privacy_policy_accepted}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms_conditions"
                        checked={customerData.terms_conditions_accepted}
                        onCheckedChange={(checked) => handleInputChange('terms_conditions_accepted', checked as boolean)}
                        className={showValidation && !customerData.terms_conditions_accepted ? 'border-red-500' : ''}
                      />
                      <div className="text-sm">
                        <label htmlFor="terms_conditions" className="font-medium text-gray-700 cursor-pointer">
                          I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a> *
                        </label>
                        {fieldErrors.terms_conditions_accepted && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.terms_conditions_accepted}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing_opt_in"
                        checked={customerData.marketing_opt_in}
                        onCheckedChange={(checked) => handleInputChange('marketing_opt_in', checked as boolean)}
                      />
                      <label htmlFor="marketing_opt_in" className="text-sm font-medium text-gray-700 cursor-pointer">
                        I would like to receive marketing communications about products and services
                      </label>
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
                      Edit
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
                      <span className="font-semibold">{planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{paymentType === '12months' ? '12' : paymentType === '24months' ? '24' : '36'} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-semibold">{vehicleData.make} {vehicleData.model}</span>
                    </div>
                  </div>

                  {/* Vehicle Registration Display */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Vehicle Registration</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-l text-sm font-bold mr-0">🇬🇧 UK</span>
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-r font-bold">{vehicleData.regNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
                    
                    <RadioGroup value={paymentMethod} onValueChange={(value: 'bumper' | 'stripe') => setPaymentMethod(value)}>
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
                              {hasAutoDiscount && (
                                <span className="text-green-600"> (10% multi-warranty discount applied)</span>
                              )}
                              {hasAutoDiscount && (
                                <span className="text-gray-500 line-through ml-2">was £{Math.round(bumperTotalPrice)}</span>
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
                                  Save a further 5% (£{Math.round(baseDiscountedPrice * 0.05)})
                                </div>
                            </div>
                             <p className="text-sm text-gray-600">
                              Pay £{discountedStripePrice} upfront via card
                              {hasAutoDiscount && (
                                <span className="text-green-600"> (10% multi-warranty discount + 5% upfront discount)</span>
                              )}
                              {hasAutoDiscount && (
                                <span className="text-gray-500 line-through ml-2">was £{Math.round(bumperTotalPrice * 0.9)}</span>
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
                      className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg rounded-lg"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;
