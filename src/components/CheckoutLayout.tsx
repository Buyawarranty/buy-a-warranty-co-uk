import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PersonalInformation from './PersonalInformation';
import OrderSummary from './OrderSummary';
import PaymentOptions from './PaymentOptions';

interface CheckoutLayoutProps {
  vehicleData: any;
  selectedPlan?: {
    id: string;
    name?: string;
    paymentType: string;
  };
  onBack: () => void;
  onComplete: (data: any) => void;
  mode: 'plan-selection' | 'checkout';
  plans?: any[];
  onPlanSelected?: (planId: string, paymentType: string, planName?: string) => void;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({
  vehicleData,
  selectedPlan,
  onBack,
  onComplete,
  mode,
  plans = [],
  onPlanSelected
}) => {
  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: vehicleData?.email || '',
    mobile: vehicleData?.phone || '',
    flat_number: '',
    building_name: '',
    building_number: '',
    street: '',
    town: '',
    county: '',
    country: 'United Kingdom',
    postcode: '',
    vehicle_reg: vehicleData?.regNumber || ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'bumper' | 'stripe'>('stripe');
  const [voluntaryExcess, setVoluntaryExcess] = useState<number>(50);
  const [selectedAddOns, setSelectedAddOns] = useState<{[addon: string]: boolean}>({});
  const [currentPaymentType, setCurrentPaymentType] = useState<'yearly' | 'two_yearly' | 'three_yearly'>('yearly');

  // Split full name if it exists
  useEffect(() => {
    if (vehicleData?.fullName) {
      const nameParts = vehicleData.fullName.trim().split(' ');
      setPersonalData(prev => ({
        ...prev,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || ''
      }));
    }
  }, [vehicleData?.fullName]);

  const handlePersonalDataChange = (data: Partial<typeof personalData>) => {
    setPersonalData(prev => ({ ...prev, ...data }));
  };

  const handlePaymentMethodChange = (method: 'bumper' | 'stripe') => {
    setPaymentMethod(method);
  };

  const handleCheckout = () => {
    const checkoutData = {
      personalData,
      paymentMethod,
      selectedPlan,
      voluntaryExcess,
      selectedAddOns,
      paymentType: currentPaymentType,
      vehicleData
    };
    onComplete(checkoutData);
  };

  const isFormValid = (): boolean => {
    if (mode === 'plan-selection') return true;
    
    return !!(personalData.first_name && 
             personalData.last_name && 
             personalData.email && 
             personalData.mobile && 
             personalData.postcode &&
             personalData.town &&
             personalData.county);
  };

  return (
    <div className="bg-[#e8f4fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'plan-selection' ? 'Choose Your Warranty Plan' : 'Complete Your Purchase'}
          </h1>
        </div>

        {/* Main Layout - Amazon Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info & Payment (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {mode === 'checkout' && (
              <PersonalInformation
                data={personalData}
                onChange={handlePersonalDataChange}
                vehicleData={vehicleData}
              />
            )}
            
            <PaymentOptions
              paymentMethod={paymentMethod}
              onChange={handlePaymentMethodChange}
              totalAmount={selectedPlan ? 100 : 0} // Calculate based on selected plan
              onCheckout={handleCheckout}
              isFormValid={isFormValid()}
              mode={mode}
              onPlanSelected={onPlanSelected}
              plans={plans}
              currentPaymentType={currentPaymentType}
              onPaymentTypeChange={setCurrentPaymentType}
              voluntaryExcess={voluntaryExcess}
              onVoluntaryExcessChange={setVoluntaryExcess}
              selectedAddOns={selectedAddOns}
              onSelectedAddOnsChange={setSelectedAddOns}
              vehicleData={vehicleData}
            />
          </div>

          {/* Right Column - Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary
                vehicleData={vehicleData}
                selectedPlan={selectedPlan}
                paymentType={currentPaymentType}
                voluntaryExcess={voluntaryExcess}
                selectedAddOns={selectedAddOns}
                plans={plans}
                mode={mode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutLayout;