
import React, { useState, useEffect } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import ProgressIndicator from '@/components/ProgressIndicator';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import CustomerDetailsStep from '@/components/CustomerDetailsStep';


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

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, paymentType: string, name?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}} | null>(null);
  const [formData, setFormData] = useState({
    regNumber: '',
    mileage: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    make: '',
    model: '',
    fuelType: '',
    transmission: '',
    year: '',
    vehicleType: ''
  });
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan', 'Final Details'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setFormData({ ...formData, ...data });
    setCurrentStep(2);
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleFormDataUpdate = (data: Partial<VehicleData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleQuoteDeliveryComplete = (contactData: { email: string; phone: string; firstName: string; lastName: string }) => {
    const updatedData = { ...vehicleData, ...contactData };
    setVehicleData(updatedData as VehicleData);
    setFormData({ ...formData, ...contactData });
    setCurrentStep(3);
  };

  const handlePlanSelected = (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => {
    setSelectedPlan({ id: planId, paymentType, name: planName, pricingData });
    setCurrentStep(4);
  };

  const handleCustomerDetailsComplete = (customerData: any) => {
    // This will be handled by the CustomerDetailsStep component itself
    console.log('Customer details completed:', customerData);
  };

  // Check if vehicle is a special type
  const isSpecialVehicle = vehicleData?.vehicleType && ['EV', 'PHEV', 'MOTORBIKE'].includes(vehicleData.vehicleType);

  return (
    <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
      
      <ProgressIndicator currentStep={currentStep} totalSteps={4} steps={steps} />
      
      {currentStep === 1 && (
        <div className="w-full px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <RegistrationForm 
              onNext={handleRegistrationComplete} 
              onBack={(step: number) => handleBackToStep(step)}
              onFormDataUpdate={handleFormDataUpdate}
              initialData={formData}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      )}

      {currentStep === 2 && vehicleData && (
        <div className="w-full px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <QuoteDeliveryStep 
              vehicleData={vehicleData}
              onNext={handleQuoteDeliveryComplete}
              onBack={() => handleBackToStep(1)}
              onSkip={() => setCurrentStep(3)}
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full overflow-x-hidden">
          {vehicleData && (
            <>
              {isSpecialVehicle ? (
                <SpecialVehiclePricing 
                  vehicleData={vehicleData as any}
                  onBack={() => handleBackToStep(2)} 
                  onPlanSelected={handlePlanSelected}
                />
              ) : (
                <PricingTable 
                  vehicleData={vehicleData} 
                  onBack={() => handleBackToStep(2)} 
                  onPlanSelected={handlePlanSelected}
                />
              )}
            </>
          )}
        </div>
      )}

      {currentStep === 4 && vehicleData && selectedPlan && (
        <CustomerDetailsStep
          vehicleData={vehicleData}
          planId={selectedPlan.id}
          paymentType={selectedPlan.paymentType}
          planName={selectedPlan.name}
          pricingData={selectedPlan.pricingData}
          onNext={handleCustomerDetailsComplete}
          onBack={() => handleBackToStep(3)}
        />
      )}
      
    </div>
  );
};

export default Index;
