import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import TrustpilotHeader from '@/components/TrustpilotHeader';

interface VehicleData {
  regNumber: string;
  mileage: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
}

interface CustomerDetailsStepProps {
  vehicleData: VehicleData;
  planId: string;
  paymentType: string;
  planName?: string;
  pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}};
  onNext: (customerData: any) => void;
  onBack: () => void;
}

const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({
  vehicleData,
  planId,
  paymentType,
  planName = 'Unknown Plan',
  pricingData,
  onNext,
  onBack
}) => {
  const [customerData, setCustomerData] = useState({
    first_name: vehicleData.firstName || '',
    last_name: vehicleData.lastName || '',
    email: vehicleData.email || '',
    mobile: vehicleData.phone || '',
    address_line_1: '',
    address_line_2: '',
    town: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    vehicle_reg: vehicleData.regNumber || ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'bumper'>('stripe');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Prefill customer data from vehicleData if available
    setCustomerData(prevData => ({
      ...prevData,
      first_name: vehicleData.firstName || prevData.first_name,
      last_name: vehicleData.lastName || prevData.last_name,
      email: vehicleData.email || prevData.email,
      mobile: vehicleData.phone || prevData.mobile,
      vehicle_reg: vehicleData.regNumber || prevData.vehicle_reg
    }));
  }, [vehicleData]);

  const totalAmount = pricingData?.monthlyPrice || 0;
  const totalPrice = pricingData ? Math.round(pricingData.totalPrice * 12) : totalAmount * 12;
  const isBumperAvailable = totalPrice >= 60; // Use total price instead of monthly amount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCountryChange = (value: string) => {
    setCustomerData(prevData => ({
      ...prevData,
      country: value
    }));
  };

  const isFormValid = () => {
    // Check if all required fields are filled
    const requiredFields = ['first_name', 'last_name', 'email', 'mobile', 'address_line_1', 'town', 'county', 'postcode', 'country', 'vehicle_reg'];
    return requiredFields.every(field => customerData[field as keyof typeof customerData] !== '');
  };

  const handleCheckout = async () => {
    if (!isFormValid()) {
      // Find which specific fields are missing
      const requiredFields = [
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'email', label: 'Email Address' },
        { key: 'mobile', label: 'Phone Number' },
        { key: 'address_line_1', label: 'Address Line 1' },
        { key: 'town', label: 'Town/City' },
        { key: 'county', label: 'County' },
        { key: 'postcode', label: 'Postcode' },
        { key: 'country', label: 'Country' },
        { key: 'vehicle_reg', label: 'Vehicle Registration' }
      ];
      
      const missingFields = requiredFields.filter(field => 
        !customerData[field.key as keyof typeof customerData] || 
        customerData[field.key as keyof typeof customerData] === ''
      ).map(field => field.label);

      toast({
        title: "Please Complete All Required Fields",
        description: missingFields.length > 0 
          ? `Missing: ${missingFields.join(', ')}`
          : "Please fill in all required fields before proceeding with your purchase.",
        variant: "destructive",
      });
      return;
    }

    setCheckoutLoading(true);

    try {
      if (selectedPaymentMethod === 'stripe') {
        // Redirect to Stripe checkout
        const res = await fetch('/api/create-stripe-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId,
            paymentType: paymentType,
            vehicleData: vehicleData,
            customerData: customerData
          }),
        });

        if (!res.ok) {
          console.error('Failed to create Stripe checkout session:', res.status, res.statusText);
          toast({
            title: "Error",
            description: "Failed to initiate Stripe checkout. Please try again.",
            variant: "destructive",
          });
          setCheckoutLoading(false);
          return;
        }

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error('No URL received from Stripe checkout creation:', data);
          toast({
            title: "Error",
            description: "Could not redirect to checkout. Please try again.",
            variant: "destructive",
          });
          setCheckoutLoading(false);
        }
      } else if (selectedPaymentMethod === 'bumper') {
        // Redirect to Bumper checkout
        const res = await fetch('/api/create-bumper-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId,
            paymentType: paymentType,
            vehicleData: vehicleData,
            customerData: customerData
          }),
        });

        if (!res.ok) {
          console.error('Failed to create Bumper checkout session:', res.status, res.statusText);
          toast({
            title: "Error",
            description: "Failed to initiate Bumper checkout. Please try again.",
            variant: "destructive",
          });
          setCheckoutLoading(false);
          return;
        }

        const data = await res.json();

        if (data.fallbackToStripe) {
          // Fallback to Stripe due to Bumper failure
          toast({
            title: "Bumper Unavailable",
            description: "Falling back to Stripe payment.",
            variant: "destructive",
          });
          setSelectedPaymentMethod('stripe'); // Switch to Stripe
        } else if (data.url) {
          // Redirect to Bumper URL
          window.location.href = data.url;
        } else {
          console.error('No URL received from Bumper checkout creation:', data);
          toast({
            title: "Error",
            description: "Could not redirect to checkout. Please try again.",
            variant: "destructive",
          });
          setCheckoutLoading(false);
        }
      }
    } catch (error) {
      console.error('Checkout process failed:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-[#e8f4fb] min-h-screen">
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

        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Just a few more details to secure your warranty
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Details Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Details Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-1 block">
                        First Name *
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={customerData.first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-1 block">
                        Last Name *
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={customerData.last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-1 block">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={customerData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Address Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address_line_1" className="text-sm font-medium text-gray-700 mb-1 block">
                      Address Line 1 *
                    </Label>
                    <Input
                      id="address_line_1"
                      name="address_line_1"
                      value={customerData.address_line_1}
                      onChange={handleInputChange}
                      placeholder="Street address and house/building number"
                      className="w-full"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">(Street address and house/building number)</p>
                  </div>

                  <div>
                    <Label htmlFor="address_line_2" className="text-sm font-medium text-gray-700 mb-1 block">
                      Address Line 2 (optional)
                    </Label>
                    <Input
                      id="address_line_2"
                      name="address_line_2"
                      value={customerData.address_line_2}
                      onChange={handleInputChange}
                      placeholder="Apartment, flat, building name"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">(Apartment, flat, building name)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="town" className="text-sm font-medium text-gray-700 mb-1 block">
                        Town/City *
                      </Label>
                      <Input
                        id="town"
                        name="town"
                        value={customerData.town}
                        onChange={handleInputChange}
                        placeholder="Enter town/city"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="county" className="text-sm font-medium text-gray-700 mb-1 block">
                        County *
                      </Label>
                      <Input
                        id="county"
                        name="county"
                        value={customerData.county}
                        onChange={handleInputChange}
                        placeholder="Enter county"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postcode" className="text-sm font-medium text-gray-700 mb-1 block">
                        Postcode *
                      </Label>
                      <Input
                        id="postcode"
                        name="postcode"
                        value={customerData.postcode}
                        onChange={handleInputChange}
                        placeholder="Enter postcode"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-1 block">
                        Country *
                      </Label>
                      <Select value={customerData.country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Northern Ireland">Northern Ireland</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="vehicle_reg" className="text-sm font-medium text-gray-700 mb-1 block">
                      Vehicle Registration *
                    </Label>
                    <Input
                      id="vehicle_reg"
                      name="vehicle_reg"
                      value={customerData.vehicle_reg}
                      onChange={handleInputChange}
                      placeholder="Enter vehicle registration"
                      className="w-full"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vehicle Details */}
                  <div className="flex justify-center mb-4">
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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Plan:</span>
                      <span className="text-gray-900">{planName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Payment Period:</span>
                      <span className="text-gray-900 capitalize">
                        {paymentType.replace('_', ' ')}
                      </span>
                    </div>
                    {pricingData?.voluntaryExcess !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Voluntary Excess:</span>
                        <span className="text-gray-900">£{pricingData.voluntaryExcess}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">Payment:</span>
                      <span className="text-lg font-bold text-green-600">
                        £{pricingData ? Math.round(pricingData.monthlyPrice || pricingData.totalPrice) : totalAmount} x 12
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">Total Price:</span>
                      <span className="text-gray-700">
                        £{totalPrice} for entire cover period
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        12 monthly payments of £{pricingData ? Math.round(pricingData.monthlyPrice || pricingData.totalPrice) : totalAmount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bumper Option */}
                    <div 
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === 'bumper' && isBumperAvailable
                          ? 'border-blue-500 bg-blue-50' 
                          : isBumperAvailable 
                            ? 'border-gray-200 hover:border-gray-300 bg-white'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => isBumperAvailable && setSelectedPaymentMethod('bumper')}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bumper"
                          checked={selectedPaymentMethod === 'bumper'}
                          onChange={() => setSelectedPaymentMethod('bumper')}
                          disabled={!isBumperAvailable}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:cursor-not-allowed"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isBumperAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                              Monthly Interest-Free Credit 
                              {!isBumperAvailable && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Available for orders over £60</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </span>
                            {isBumperAvailable && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                0% Interest
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isBumperAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                            Pay monthly with no interest charges
                          </p>
                          {!isBumperAvailable && (
                            <p className="text-sm text-orange-600 mt-1">
                              <strong>Note:</strong> The Bumper payment option is only available for orders over £60. 
                              Your current order total is £{totalPrice}.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stripe Option */}
                    <div 
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setSelectedPaymentMethod('stripe')}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={selectedPaymentMethod === 'stripe'}
                          onChange={() => setSelectedPaymentMethod('stripe')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              Pay Full Amount
                            </span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Instant Coverage
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay the full amount upfront via card
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-6">
                    <Button
                      onClick={handleCheckout}
                      disabled={checkoutLoading || !isFormValid()}
                      className="w-full py-3 text-lg font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl transition-colors duration-200"
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          Processing...
                        </div>
                      ) : (
                        'Complete Purchase'
                      )}
                    </Button>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-7-4z" />
                    </svg>
                    Secure checkout powered by Stripe
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CustomerDetailsStep;
