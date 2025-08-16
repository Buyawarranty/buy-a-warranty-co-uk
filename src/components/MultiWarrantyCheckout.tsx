import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/contexts/CartContext';

interface MultiWarrantyCheckoutProps {
  items: CartItem[];
  onBack: () => void;
}

const MultiWarrantyCheckout: React.FC<MultiWarrantyCheckoutProps> = ({ items, onBack }) => {
  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    flat_number: '',
    building_name: '',
    building_number: '',
    street: '',
    town: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    discount_code: ''
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showValidation, setShowValidation] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.pricingData.totalPrice, 0);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
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
      // Create multi-warranty checkout
      const { data, error } = await supabase.functions.invoke('create-multi-warranty-checkout', {
        body: {
          items: items.map(item => ({
            planName: item.planName.toLowerCase(),
            paymentType: item.paymentType,
            voluntaryExcess: item.pricingData.voluntaryExcess,
            vehicleData: item.vehicleData,
            selectedAddOns: item.pricingData.selectedAddOns,
            totalPrice: item.pricingData.totalPrice
          })),
          customerData: customerData,
          discountCode: customerData.discount_code || null,
          totalAmount: totalPrice
        }
      });

      if (error) throw error;

      if (data.url) {
        // Redirect to checkout
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Multi-warranty checkout error:', error);
      toast.error('Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  const formatVehicleDisplay = (item: CartItem) => {
    const { vehicleData } = item;
    if (vehicleData.make && vehicleData.model) {
      return `${vehicleData.year || ''} ${vehicleData.make} ${vehicleData.model}`.trim();
    }
    return vehicleData.regNumber;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={onBack} className="mb-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Details Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>
            
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
                    className={`mt-1 ${fieldErrors.first_name ? 'border-red-500' : ''}`}
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
                    className={`mt-1 ${fieldErrors.last_name ? 'border-red-500' : ''}`}
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
                  className={`mt-1 ${fieldErrors.email ? 'border-red-500' : ''}`}
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
                  className={`mt-1 ${fieldErrors.mobile ? 'border-red-500' : ''}`}
                />
                {fieldErrors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.mobile}</p>
                )}
              </div>

              {/* Address Details */}
              <div className="pt-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Address Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="text-sm font-medium text-gray-700">Address Line 1 *</Label>
                    <Input
                      id="street"
                      placeholder="Street address and house/building number"
                      value={customerData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      required
                      className={`mt-1 ${fieldErrors.street ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.street && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.street}</p>
                    )}
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
                        className={`mt-1 ${fieldErrors.town ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.town && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.town}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode *</Label>
                      <Input
                        id="postcode"
                        placeholder="Enter postcode"
                        value={customerData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        required
                        className={`mt-1 ${fieldErrors.postcode ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.postcode && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.postcode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div>
                <Label htmlFor="discount_code" className="text-sm font-medium text-gray-700">Discount Code (optional)</Label>
                <Input
                  id="discount_code"
                  placeholder="Enter discount code"
                  value={customerData.discount_code}
                  onChange={(e) => handleInputChange('discount_code', e.target.value)}
                  className="mt-1"
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  Order Summary ({items.length} {items.length === 1 ? 'warranty' : 'warranties'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Warranty Items */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Warranty {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatVehicleDisplay(item)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.vehicleData.regNumber}
                          </p>
                        </div>
                        <Badge variant="outline">{item.planName}</Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          £{item.pricingData.totalPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total to Pay:</span>
                    <span className="text-lg font-bold text-blue-600">
                      £{totalPrice}
                    </span>
                  </div>
                  
                  {/* Payment Methods */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Methods Available:</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>💳 Stripe (Card Payment)</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🏦 Bumper (Finance Options)</span>
                        <span className="text-green-600 font-medium">Available</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center mt-3">
                    <p>Choose between Stripe (instant) or Bumper (finance) at checkout</p>
                    <p>Secure payment processing with multiple options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiWarrantyCheckout;