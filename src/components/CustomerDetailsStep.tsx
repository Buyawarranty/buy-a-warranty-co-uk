import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerDetailsData {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  flat_number?: string;
  building_name?: string;
  building_number?: string;
  street?: string;
  town: string;
  county: string;
  country: string;
  postcode: string;
  vehicle_reg?: string;
}

interface CustomerDetailsStepProps {
  onNext: (data: CustomerDetailsData) => void;
  onBack: () => void;
  initialData?: Partial<CustomerDetailsData>;
  vehicleData: any;
  planId: string;
  paymentType: string;
  planName?: string;
}

const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({
  onNext,
  onBack,
  initialData,
  vehicleData,
  planId,
  paymentType,
  planName
}) => {
  // Split full name into first and last name from step 2
  const splitName = (fullName: string) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(vehicleData?.fullName || '');

  const [formData, setFormData] = useState<CustomerDetailsData>({
    first_name: initialData?.first_name || firstName,
    last_name: initialData?.last_name || lastName,
    email: initialData?.email || vehicleData?.email || '',
    mobile: initialData?.mobile || vehicleData?.phone || '',
    flat_number: initialData?.flat_number || '',
    building_name: initialData?.building_name || '',
    building_number: initialData?.building_number || '',
    street: initialData?.street || '',
    town: initialData?.town || '',
    county: initialData?.county || '',
    country: initialData?.country || 'UK',
    postcode: initialData?.postcode || '',
    vehicle_reg: initialData?.vehicle_reg || vehicleData?.regNumber || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [addressType, setAddressType] = useState<'flat' | 'building_name' | 'building_number'>('building_number');
  const [paymentMethod, setPaymentMethod] = useState<'bumper' | 'stripe'>('bumper');
  const { toast } = useToast();

  // Calculate total amount to determine if Bumper is available (£60+ threshold)
  const calculateTotalAmount = () => {
    // Define pricing table - you may need to adjust these values based on your actual pricing
    const pricingTable = {
      monthly: {
        "0": 9.99,    // £0 excess
        "250": 7.99,  // £250 excess  
        "500": 6.99   // £500 excess
      },
      yearly: {
        "0": 99.99,   // £0 excess
        "250": 79.99, // £250 excess
        "500": 69.99  // £500 excess
      },
      twoYear: {
        "0": 179.99,  // £0 excess
        "250": 149.99, // £250 excess
        "500": 129.99  // £500 excess
      },
      threeYear: {
        "0": 249.99,  // £0 excess
        "250": 199.99, // £250 excess
        "500": 169.99  // £500 excess
      }
    };

    // Get the price based on payment type and plan (assuming planId contains excess info)
    const excess = planId.includes('250') ? '250' : planId.includes('500') ? '500' : '0';
    const priceTable = pricingTable[paymentType as keyof typeof pricingTable];
    
    if (priceTable && priceTable[excess as keyof typeof priceTable]) {
      return priceTable[excess as keyof typeof priceTable];
    }
    
    // Default fallback
    return 69.99;
  };

  const totalAmount = calculateTotalAmount();
  const isBumperAvailable = totalAmount >= 60;

  // Track abandoned cart on page unload or navigation away
  useEffect(() => {
    const trackAbandonedCart = async () => {
      // Only track if user has provided some information and email is available
      const emailToUse = formData.email || vehicleData?.email;
      if (!emailToUse) return;

      try {
        await supabase.functions.invoke('track-abandoned-cart', {
          body: {
            full_name: `${formData.first_name} ${formData.last_name}`.trim() || vehicleData?.fullName,
            email: emailToUse,
            phone: formData.mobile || vehicleData?.phone,
            vehicle_reg: vehicleData?.regNumber,
            vehicle_make: vehicleData?.make,
            vehicle_model: vehicleData?.model,
            vehicle_year: vehicleData?.year,
            mileage: vehicleData?.mileage,
            plan_id: planId,
            plan_name: planName,
            payment_type: paymentType,
            step_abandoned: 4
          }
        });
      } catch (error) {
        console.error('Failed to track abandoned cart:', error);
      }
    };

    const handleBeforeUnload = () => {
      const emailToUse = formData.email || vehicleData?.email;
      if (emailToUse) {
        // Use sendBeacon for more reliable tracking during page unload
        const payload = JSON.stringify({
          full_name: `${formData.first_name} ${formData.last_name}`.trim() || vehicleData?.fullName,
          email: emailToUse,
          phone: formData.mobile || vehicleData?.phone,
          vehicle_reg: vehicleData?.regNumber,
          vehicle_make: vehicleData?.make,
          vehicle_model: vehicleData?.model,
          vehicle_year: vehicleData?.year,
          mileage: vehicleData?.mileage,
          plan_id: planId,
          plan_name: planName,
          payment_type: paymentType,
          step_abandoned: 4
        });

        // Try to use the Supabase function URL for sendBeacon
        const supabaseUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/functions/v1/track-abandoned-cart';
        navigator.sendBeacon(supabaseUrl, payload);
      }
    };

    // Track when component mounts (user reached step 4)
    const timeoutId = setTimeout(trackAbandonedCart, 2000); // Track after 2 seconds on the page

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, vehicleData, planId, planName, paymentType]);

  const handleInputChange = (field: keyof CustomerDetailsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressTypeChange = (type: 'flat' | 'building_name' | 'building_number') => {
    setAddressType(type);
    // Clear other address type fields
    setFormData(prev => ({
      ...prev,
      flat_number: type === 'flat' ? prev.flat_number : '',
      building_name: type === 'building_name' ? prev.building_name : '',
      building_number: type === 'building_number' ? prev.building_number : ''
    }));
  };

  const isFormValid = () => {
    const required = [
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.mobile,
      formData.town,
      formData.county,
      formData.country,
      formData.postcode
    ];

    // Check that at least one address type is filled
    const hasAddressType = formData.flat_number || formData.building_name || formData.building_number;

    return required.every(field => field.trim() !== '') && hasAddressType;
  };

  const handlePurchase = async () => {
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (paymentMethod === 'bumper' && isBumperAvailable) {
        // Call Bumper checkout with customer details
        const { data, error } = await supabase.functions.invoke('create-bumper-checkout', {
          body: {
            planId,
            paymentType,
            vehicleData,
            customerData: formData
          }
        });

        if (error) throw error;

        if (data.fallbackToStripe) {
          // If Bumper fails, fall back to Stripe
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
            body: {
              planId,
              paymentType,
              vehicleData
            }
          });

          if (stripeError) throw stripeError;
          
          if (stripeData?.url) {
            window.open(stripeData.url, '_blank');
          }
        } else if (data?.url) {
          // Success with Bumper
          window.open(data.url, '_blank');
        }
      } else {
        // Direct Stripe checkout
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-checkout', {
          body: {
            planId,
            paymentType,
            vehicleData
          }
        });

        if (stripeError) throw stripeError;
        
        if (stripeData?.url) {
          window.open(stripeData.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 font-sans">
                Final Step - Your Details
              </CardTitle>
            </div>
            {planName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-semibold">
                    Selected Plan: {planName} ({paymentType === 'yearly' ? 'Annual' : paymentType === 'monthly' ? 'Monthly' : paymentType})
                  </span>
                </div>
              </div>
            )}
            <p className="text-gray-600 font-sans">
              We need a few more details to complete your warranty purchase
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                      First Name *
                    </Label>
                    {formData.first_name.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.first_name.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    {formData.last_name.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.last_name.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    {formData.email.trim() && formData.email.includes('@') && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.email.trim() && formData.email.includes('@') && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                      Mobile Number *
                    </Label>
                    {formData.mobile.trim() && formData.mobile.length >= 10 && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="07000000000"
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.mobile.trim() && formData.mobile.length >= 10 && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address Information
              </h3>

              {/* Address Type Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Property Type *
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={addressType === 'building_number' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAddressTypeChange('building_number')}
                  >
                    House Number
                  </Button>
                  <Button
                    type="button"
                    variant={addressType === 'flat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAddressTypeChange('flat')}
                  >
                    Flat Number
                  </Button>
                  <Button
                    type="button"
                    variant={addressType === 'building_name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAddressTypeChange('building_name')}
                  >
                    Building Name
                  </Button>
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addressType === 'building_number' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="building_number" className="text-sm font-medium text-gray-700">
                        House/Building Number *
                      </Label>
                      {formData.building_number?.trim() && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="building_number"
                        value={formData.building_number}
                        onChange={(e) => handleInputChange('building_number', e.target.value)}
                        className="mt-1 pr-10"
                        required
                      />
                      {formData.building_number?.trim() && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                )}

                {addressType === 'flat' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="flat_number" className="text-sm font-medium text-gray-700">
                        Flat Number *
                      </Label>
                      {formData.flat_number?.trim() && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="flat_number"
                        value={formData.flat_number}
                        onChange={(e) => handleInputChange('flat_number', e.target.value)}
                        className="mt-1 pr-10"
                        required
                      />
                      {formData.flat_number?.trim() && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                )}

                {addressType === 'building_name' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="building_name" className="text-sm font-medium text-gray-700">
                        Building Name *
                      </Label>
                      {formData.building_name?.trim() && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="building_name"
                        value={formData.building_name}
                        onChange={(e) => handleInputChange('building_name', e.target.value)}
                        className="mt-1 pr-10"
                        required
                      />
                      {formData.building_name?.trim() && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                    Street (Optional)
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="town" className="text-sm font-medium text-gray-700">
                      Town *
                    </Label>
                    {formData.town.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="town"
                      value={formData.town}
                      onChange={(e) => handleInputChange('town', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.town.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                      County *
                    </Label>
                    {formData.county.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.county.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                      Postcode *
                    </Label>
                    {formData.postcode.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.postcode.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country *
                    </Label>
                    {formData.country.trim() && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-1 pr-10"
                      required
                    />
                    {formData.country.trim() && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Vehicle Information
              </h3>
              
              <div>
                <Label htmlFor="vehicle_reg" className="text-sm font-medium text-gray-700">
                  Vehicle Registration (Optional)
                </Label>
                <Input
                  id="vehicle_reg"
                  value={formData.vehicle_reg}
                  onChange={(e) => handleInputChange('vehicle_reg', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Payment Method
              </h3>
              
              <RadioGroup value={paymentMethod} onValueChange={(value: 'bumper' | 'stripe') => setPaymentMethod(value)}>
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handlePurchase}
                disabled={!isFormValid() || isLoading}
                className="flex-1 bg-[#eb4b00] hover:bg-[#d44300] text-white font-semibold py-3 px-6 rounded-lg shadow-lg animate-breathing disabled:opacity-50 disabled:animate-none font-sans"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Buy Your Warranty"
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Required fields. We'll perform a soft credit check with Bumper. If unavailable, you'll be redirected to Stripe for payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;