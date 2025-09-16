import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Calendar, Percent, Info, AlertCircle, CheckCircle, HelpCircle, Edit, Check, Crown, User, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AddAnotherWarrantyOffer from './AddAnotherWarrantyOffer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getWarrantyDurationDisplay } from '@/lib/warrantyDurationUtils';

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
    protectionAddOns?: {[key: string]: boolean};
    claimLimit?: number;
    installmentBreakdown?: {
      firstInstallment: number;
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
  const [quoteSent, setQuoteSent] = useState(false);
  const [addAnotherWarrantyEnabled, setAddAnotherWarrantyEnabled] = useState(false);
  const [selectedClaimLimit, setSelectedClaimLimit] = useState('plus'); // Default to Plus Cover
  const [currentPaymentType, setCurrentPaymentType] = useState(paymentType);
  const [currentPricingData, setCurrentPricingData] = useState(pricingData);

  // Debug logging for pricing
  console.log('CustomerDetailsStep - Pricing Debug:', {
    monthlyPrice: currentPricingData.monthlyPrice,
    totalPrice: currentPricingData.totalPrice,
    protectionAddOns: currentPricingData.protectionAddOns,
    voluntaryExcess: currentPricingData.voluntaryExcess,
    currentPaymentType,
    originalPaymentType: paymentType
  });

  // Get pricing data using the exact pricing structure from the matrix
  const getPricingForDuration = (paymentPeriod: string) => {
    const { voluntaryExcess = 50, claimLimit = 1250, protectionAddOns = {}, selectedAddOns = {} } = pricingData;
    
    // Your exact pricing matrix for base warranty
    const pricingTable = {
      '12months': {
        0: { 750: 467, 1250: 497, 2000: 587 },
        50: { 750: 437, 1250: 457, 2000: 547 },
        100: { 750: 387, 1250: 417, 2000: 507 },
        150: { 750: 367, 1250: 387, 2000: 477 }
      },
      '24months': {
        0: { 750: 897, 1250: 937, 2000: 1027 },
        50: { 750: 827, 1250: 877, 2000: 957 },
        100: { 750: 737, 1250: 787, 2000: 877 },
        150: { 750: 697, 1250: 737, 2000: 827 }
      },
      '36months': {
        0: { 750: 1347, 1250: 1397, 2000: 1497 },
        50: { 750: 1247, 1250: 1297, 2000: 1397 },
        100: { 750: 1097, 1250: 1177, 2000: 1277 },
        150: { 750: 1047, 1250: 1097, 2000: 1197 }
      }
    };
    
    const periodData = pricingTable[paymentPeriod as keyof typeof pricingTable] || pricingTable['12months'];
    const excessData = periodData[voluntaryExcess as keyof typeof periodData] || periodData[50];
    const baseWarrantyPrice = excessData[claimLimit as keyof typeof excessData] || excessData[1250];
    
    // Calculate addon prices for this duration
    const durationMonths = paymentPeriod === '12months' ? 12 : 
                          paymentPeriod === '24months' ? 24 : 
                          paymentPeriod === '36months' ? 36 : 12;
    
    // Plan-specific addons (from step 3 selection)
    const planAddOnCount = Object.values(selectedAddOns || {}).filter(Boolean).length;
    const planAddOnPrice = planAddOnCount * 2 * durationMonths; // £2 per add-on per month * duration
    
    // Protection addons (from step 3 selection)
    let protectionAddOnPrice = 0;
    if (protectionAddOns.breakdown) protectionAddOnPrice += 6 * durationMonths; // £6/mo
    if (protectionAddOns.rental) protectionAddOnPrice += 4 * durationMonths; // £4/mo
    if (protectionAddOns.tyre) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.wearTear) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.european) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.motRepair) protectionAddOnPrice += 4 * durationMonths; // £4/mo
    if (protectionAddOns.motFee) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.lostKey) protectionAddOnPrice += 3 * durationMonths; // £3/mo
    if (protectionAddOns.consequential) protectionAddOnPrice += 5 * durationMonths; // £5/mo
    if (protectionAddOns.transfer) protectionAddOnPrice += 30; // £30 one-time
    
    const totalPrice = baseWarrantyPrice + planAddOnPrice + protectionAddOnPrice;
    const monthlyPrice = Math.round(totalPrice / 12); // Always use 12 months for monthly calculation
    
    return { totalPrice, monthlyPrice };
  };

  // Handle duration change
  const handleDurationChange = (newPaymentType: string) => {
    setCurrentPaymentType(newPaymentType);
    const newPricing = getPricingForDuration(newPaymentType);
    setCurrentPricingData({
      ...currentPricingData,
      totalPrice: newPricing.totalPrice,
      monthlyPrice: newPricing.monthlyPrice
    });
  };

  // Helper function to get payment period months
  const getPaymentPeriodMonths = () => {
    switch (paymentType) {
      case 'yearly': return 12;
      case 'two_yearly': return 24;
      case 'three_yearly': return 36;
      default: return 12;
    }
  };

  // Helper functions for claim limits
  const getClaimLimitAmount = (limit: string) => {
    switch (limit) {
      case 'essential': return 750;
      case 'plus': return 1250;
      case 'premium': return 2000;
      default: return 1250;
    }
  };

  const getClaimLimitTitle = (limit: string) => {
    switch (limit) {
      case 'essential': return 'AutoCare Standard';
      case 'plus': return 'AutoCare Enhanced';
      case 'premium': return 'AutoCare Ultimate';
      default: return 'AutoCare Enhanced';
    }
  };

  const getClaimLimitTagline = (limit: string) => {
    switch (limit) {
      case 'essential': return 'Confidence for the everyday drive.';
      case 'plus': return 'Balanced protection for life\'s bigger bumps.';
      case 'premium': return 'Top-tier cover for total peace of mind.';
      default: return 'Balanced protection for life\'s bigger bumps.';
    }
  };

  const getClaimLimitDescription = (limit: string) => {
    switch (limit) {
      case 'essential': return 'Designed for everyday motoring peace of mind, this plan covers the most common and affordable mechanical and electrical faults—not wear and tear or consumables.';
      case 'plus': return 'A comprehensive option that balances cost and coverage, ideal for drivers who want broader protection.';
      case 'premium': return 'Premium-level protection for high-value repairs.';
      default: return 'A comprehensive option that balances cost and coverage, ideal for drivers who want broader protection.';
    }
  };

  const getClaimLimitDetails = (limit: string) => {
    switch (limit) {
      case 'essential': 
        return {
          claims: '10 claims per warranty',
          exampleRepairs: [
            'Starter motor failure',
            'Alternator replacement',
            'Electric window motor faults',
            'Central locking system issues',
            'Fuel pump malfunction'
          ],
          whatIf: 'If your repair exceeds the £750 limit, you\'ll just pay the difference. You\'re still making significant savings—without the high cost of unlimited cover.'
        };
      case 'plus':
        return {
          claims: 'Unlimited claims',
          exampleRepairs: [
            'Transmission control module faults',
            'Suspension arm or bush replacements',
            'Radiator or water pump failure',
            'ABS sensor or module issues',
            'Air conditioning compressor faults'
          ],
          whatIf: 'If your repair exceeds the £1,250 limit, you\'ll only need to top up the difference—still saving significantly compared to paying out of pocket.'
        };
      case 'premium':
        return {
          claims: 'Unlimited claims',
          exampleRepairs: [
            'Engine control unit (ECU) failure',
            'Gearbox or clutch actuator replacement',
            'Turbocharger faults',
            'Hybrid or electric drive system issues',
            'Advanced infotainment or navigation system faults'
          ],
          whatIf: 'If the repair goes beyond the £2,000 limit, you\'ll just pay the extra. You still benefit from major savings—without the premium of unlimited cover.'
        };
      default:
        return {
          claims: 'Unlimited claims',
          exampleRepairs: [],
          whatIf: ''
        };
    }
  };

  // Calculate prices based on pricing data passed from PricingTable
  // The pricingData.totalPrice already includes base price + all addons
  const monthlyBumperPrice = currentPricingData.monthlyPrice; // Monthly amount for display
  const bumperTotalPrice = currentPricingData.totalPrice; // Total already includes all addons
  const stripePrice = Math.round(bumperTotalPrice * 0.95); // 5% discount for Stripe
  
  // Calculate protection addons total for display purposes only
  let protectionAddonsTotal = 0;
  if (currentPricingData.protectionAddOns?.breakdown) protectionAddonsTotal += 89;
  if (currentPricingData.protectionAddOns?.rental) protectionAddonsTotal += 89;
  if (currentPricingData.protectionAddOns?.wearTear) protectionAddonsTotal += 89;
  if (currentPricingData.protectionAddOns?.transfer) protectionAddonsTotal += 30;
  
  // Check for automatic 10% discount (add another warranty)
  const hasAutoDiscount = localStorage.getItem('addAnotherWarrantyDiscount') === 'true';
  
  // Apply automatic 10% discount or manual discount code
  const baseDiscountedPrice = hasAutoDiscount ? bumperTotalPrice * 0.9 : bumperTotalPrice;
  
  // Apply manual discount if valid, otherwise use auto discount
  const discountedBumperPrice = discountValidation?.isValid 
    ? discountValidation.finalAmount 
    : baseDiscountedPrice;
  
  const discountedStripePrice = discountValidation?.isValid 
    ? Math.round(discountValidation.finalAmount * 0.9)
    : Math.round(baseDiscountedPrice * 0.9);

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
    if (!customerData.vehicle_reg.trim()) errors.vehicle_reg = 'Vehicle registration is required';
    
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
            paymentType: currentPaymentType,
            voluntaryExcess: currentPricingData.voluntaryExcess,
            customerData: customerData,
            discountCode: customerData.discount_code || null,
            finalAmount: discountedBumperPrice, // Pass the final calculated amount
            addAnotherWarrantyEnabled
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
          // Set the checkout URL with query parameter if add another warranty is enabled
          if (data?.url) {
            const url = new URL(data.url);
            if (addAnotherWarrantyEnabled) {
              url.searchParams.set('addAnotherWarranty', 'true');
            }
            checkoutUrl = url.toString();
          } else {
            checkoutUrl = data.url;
          }
        }
      } else {
        console.log('Creating Stripe checkout with discounted price:', discountedStripePrice);
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            planName: planName.toLowerCase(),
            paymentType: paymentType, // Use the actual selected payment type
            voluntaryExcess: pricingData.voluntaryExcess,
            vehicleData,
            customerData: customerData,
            discountCode: customerData.discount_code || null,
            finalAmount: discountedStripePrice, // Pass the final calculated amount
            protectionAddOns: pricingData.protectionAddOns || {}, // Add protection addons data
            addAnotherWarrantyEnabled
          }
        });

        if (error) throw error;
        
        // Set the checkout URL with query parameter if add another warranty is enabled
        if (data?.url) {
          const url = new URL(data.url);
          if (addAnotherWarrantyEnabled) {
            url.searchParams.set('addAnotherWarranty', 'true');
          }
          checkoutUrl = url.toString();
        } else {
          checkoutUrl = data.url;
        }
      }

      if (checkoutUrl) {
        // Ensure current step 4 is saved in browser history before navigating to Bumper
        // This way, the back button from Bumper payment page returns to step 4
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('step', '4');
        window.history.pushState({ step: 4 }, '', currentUrl.toString());
        
        // Redirect to Bumper payment page
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

  // Send quote email when component mounts (step 4 reached)
  React.useEffect(() => {
    const sendQuoteEmail = async () => {
      if (!quoteSent && customerData.email) {
        try {
          await supabase.functions.invoke('send-quote-email', {
            body: {
              email: customerData.email,
              firstName: customerData.first_name,
              lastName: customerData.last_name,
              vehicleData,
              planData: {
                planName,
                totalPrice: pricingData.totalPrice,
                monthlyPrice: pricingData.monthlyPrice,
                voluntaryExcess: pricingData.voluntaryExcess,
                paymentType,
                selectedAddOns: pricingData.selectedAddOns || {}
              },
              quoteId: `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              isInitialQuote: false
            }
          });
          setQuoteSent(true);
          toast.success('Quote sent to your email!');
        } catch (error) {
          console.error('Error sending quote email:', error);
        }
      }
    };

    sendQuoteEmail();
  }, [customerData.email, vehicleData, planName, paymentType, pricingData, planId, quoteSent]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" onClick={onBack} className="mb-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're almost covered</h1>
        </div>

        {/* Customer Details Section - Now Step 5 */}
        <div className="bg-white border-2 border-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              5
            </div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Complete Your Order
            </h3>
          </div>
          
          {/* Selected Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{planName}</h4>
                <p className="text-sm text-gray-600">{getWarrantyDurationDisplay(currentPaymentType)}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  £{currentPricingData?.monthlyPrice}/month
                </div>
                <div className="text-sm text-gray-500">
                  Total: £{currentPricingData?.totalPrice}
                </div>
              </div>
            </div>
          </div>

          {/* Plans section removed per user request */}
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
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Where should we send your documents?</h3>
                        
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
                              className={`mt-1 transition-all duration-300 ${
                                showValidation && !customerData.vehicle_reg.trim() 
                                  ? 'border-red-500 focus:border-red-500 animate-pulse' 
                                  : 'focus:ring-2 focus:ring-blue-200'
                              }`}
                            />
                            {fieldErrors.vehicle_reg && (
                              <p className="text-red-500 text-sm mt-1">{fieldErrors.vehicle_reg}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add Another Warranty Offer */}
                      <AddAnotherWarrantyOffer 
                        onAddAnotherWarranty={() => setAddAnotherWarrantyEnabled(true)}
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
                            <span className="text-gray-600">Plan:</span>
                            <span className="font-semibold">Platinum</span>
                          </div>
                           <div className="flex justify-between">
                             <span className="text-gray-600">Claim Limit:</span>
                             <span className="font-semibold">£{currentPricingData?.claimLimit?.toLocaleString() || getClaimLimitAmount(selectedClaimLimit).toLocaleString()}</span>
                           </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cover period:</span>
                            <span className="font-semibold">
                              {getWarrantyDurationDisplay(currentPaymentType)}
                            </span>
                          </div>
                           <div className="flex justify-between">
                             <span className="text-gray-600">Voluntary Excess:</span>
                             <span className="font-semibold">£{currentPricingData.voluntaryExcess}</span>
                           </div>

                            {/* Add-ons integrated into main list */}
                            {currentPricingData.protectionAddOns && Object.values(currentPricingData.protectionAddOns).some(Boolean) && (
                              <>
                                {currentPricingData.protectionAddOns.breakdown && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">🚨 24/7 Breakdown Recovery:</span>
                                    <span className="font-semibold">£6/mo</span>
                                  </div>
                                )}
                                {currentPricingData.protectionAddOns.rental && (
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">🚙 Vehicle Rental:</span>
                                     <span className="font-semibold">£4/mo</span>
                                   </div>
                                )}
                                {currentPricingData.protectionAddOns.tyre && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">🛞 Tyre Cover:</span>
                                    <span className="font-semibold">£60/year</span>
                                  </div>
                                )}
                                {currentPricingData.protectionAddOns.wearTear && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">🛠️ Wear & Tear Cover:</span>
                                    <span className="font-semibold">£60/year</span>
                                  </div>
                                )}
                                {currentPricingData.protectionAddOns.european && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">🌍 European Cover:</span>
                                    <span className="font-semibold">£36/year</span>
                                  </div>
                                )}
                                {currentPricingData.protectionAddOns.transfer && (
                                 <div className="flex justify-between">
                                   <span className="text-gray-600">🔁 Transfer Cover:</span>
                                   <span className="font-semibold">£30 one-time</span>
                                 </div>
                               )}
                             </>
                           )}
                        </div>

                        {/* Payment Summary */}
                        <div className="border-t border-gray-200 pt-4 mb-6">
                          <div className="text-green-600 font-semibold text-lg mb-2">
                            Payment: £{Math.round(bumperTotalPrice / 12)} x 12 easy payments
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Price:</span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                £{Math.round(discountValidation?.isValid ? discountValidation.finalAmount : bumperTotalPrice)} for entire cover period
                                {discountValidation?.isValid && (
                                  <span className="text-green-600 text-sm ml-2">
                                    (Discount applied: -£{Math.round(bumperTotalPrice - discountValidation.finalAmount)})
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
                    <div className="bg-white rounded-lg shadow-sm p-6 border">
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
                                {pricingData.installmentBreakdown?.hasTransfer ? (
                                  <>
                                    Pay £{Math.round(discountedBumperPrice / 12)} x 12 monthly payments = £{Math.round(discountedBumperPrice)} total
                                  </>
                                ) : (
                                  <>
                                    Pay £{Math.round(discountedBumperPrice / 12)} x 12 monthly payments = £{Math.round(discountedBumperPrice)} total
                                  </>
                                )}
                                {(discountValidation?.isValid || hasAutoDiscount) && (
                                  <span className="text-green-600">
                                    {hasAutoDiscount && !discountValidation?.isValid 
                                      ? " (10% multi-warranty discount applied)" 
                                      : " (discount applied)"}
                                  </span>
                                )}
                                {hasAutoDiscount && !discountValidation?.isValid && (
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
                                   Save a further 10% (£{Math.round(baseDiscountedPrice * 0.1)})
                                 </div>
                              </div>
                               <p className="text-sm text-gray-600">
                                Pay £{discountedStripePrice} upfront via card
                                {(discountValidation?.isValid || hasAutoDiscount) && (
                                  <span className="text-green-600">
                                    {hasAutoDiscount && !discountValidation?.isValid 
                                      ? " (10% multi-warranty discount + 10% upfront discount)" 
                                      : " (discount applied)"}
                                  </span>
                                )}
                                {hasAutoDiscount && !discountValidation?.isValid && (
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
              </CardContent>
            </Card>
      </div>
    </div>
  );
};

export default CustomerDetailsStep;