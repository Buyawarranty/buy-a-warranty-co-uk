import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
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
}

const CustomerDetailsStep: React.FC<CustomerDetailsStepProps> = ({
  onNext,
  onBack,
  initialData,
  vehicleData,
  planId,
  paymentType
}) => {
  const [formData, setFormData] = useState<CustomerDetailsData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
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
  const { toast } = useToast();

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
        // If Bumper fails, call regular Stripe checkout
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
              <Shield className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Final Step - Your Details
              </CardTitle>
            </div>
            <p className="text-gray-600">
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
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    Mobile Number *
                  </Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="07000000000"
                    className="mt-1"
                    required
                  />
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
                    <Label htmlFor="building_number" className="text-sm font-medium text-gray-700">
                      House/Building Number *
                    </Label>
                    <Input
                      id="building_number"
                      value={formData.building_number}
                      onChange={(e) => handleInputChange('building_number', e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                {addressType === 'flat' && (
                  <div>
                    <Label htmlFor="flat_number" className="text-sm font-medium text-gray-700">
                      Flat Number *
                    </Label>
                    <Input
                      id="flat_number"
                      value={formData.flat_number}
                      onChange={(e) => handleInputChange('flat_number', e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                {addressType === 'building_name' && (
                  <div>
                    <Label htmlFor="building_name" className="text-sm font-medium text-gray-700">
                      Building Name *
                    </Label>
                    <Input
                      id="building_name"
                      value={formData.building_name}
                      onChange={(e) => handleInputChange('building_name', e.target.value)}
                      className="mt-1"
                      required
                    />
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
                  <Label htmlFor="town" className="text-sm font-medium text-gray-700">
                    Town *
                  </Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={(e) => handleInputChange('town', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                    County *
                  </Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                    Postcode *
                  </Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country *
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="mt-1"
                    required
                  />
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Buy Your Warranty
                  </div>
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