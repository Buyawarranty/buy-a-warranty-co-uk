
import React, { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import ProgressIndicator from '@/components/ProgressIndicator';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';

interface VehicleData {
  regNumber: string;
  mileage: string;
  email: string;
  phone: string;
  fullName: string;
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
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [formData, setFormData] = useState({
    regNumber: '',
    mileage: '',
    email: '',
    phone: '',
    fullName: '',
    address: '',
    make: '',
    model: '',
    fuelType: '',
    transmission: '',
    year: '',
    vehicleType: ''
  });
  
  const steps = ['Input Reg Plate', 'Receive Quote', 'Choose Your Plan'];

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

  const handleQuoteDeliveryComplete = (contactData: { email: string; phone: string; fullName: string }) => {
    const updatedData = { ...vehicleData, ...contactData };
    setVehicleData(updatedData as VehicleData);
    setFormData({ ...formData, ...contactData });
    setCurrentStep(3);
  };

  // Check if vehicle is a special type
  const isSpecialVehicle = vehicleData?.vehicleType && ['EV', 'PHEV', 'MOTORBIKE'].includes(vehicleData.vehicleType);

  return (
    <div className="bg-[#e8f4fb]">
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <RegistrationForm 
            onNext={handleRegistrationComplete} 
            onBack={(step: number) => handleBackToStep(step)}
            onFormDataUpdate={handleFormDataUpdate}
            initialData={formData}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      )}

      {currentStep === 2 && vehicleData && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <QuoteDeliveryStep 
            vehicleData={vehicleData}
            onNext={handleQuoteDeliveryComplete}
            onBack={() => handleBackToStep(1)}
            onSkip={() => setCurrentStep(3)}
          />
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full">
          {vehicleData && (
            <>
              {isSpecialVehicle ? (
                <SpecialVehiclePricing 
                  vehicleData={vehicleData as any}
                  onBack={() => handleBackToStep(2)} 
                />
              ) : (
                <PricingTable 
                  vehicleData={vehicleData} 
                  onBack={() => handleBackToStep(2)} 
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
