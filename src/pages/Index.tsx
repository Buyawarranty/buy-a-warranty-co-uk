
import React, { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import ProgressIndicator from '@/components/ProgressIndicator';

interface VehicleData {
  regNumber: string;
  mileage: string;
  email?: string;
  phone?: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  
  const steps = ['Vehicle Details', 'Contact Info', 'Choose Plan'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setCurrentStep(3); // Skip to pricing (step 2 is integrated into registration)
  };

  const handleBackToRegistration = () => {
    setCurrentStep(2); // Go back to contact info step
  };

  return (
    <div className="min-h-screen bg-[#e8f4fb]">
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      
      {(currentStep === 1 || currentStep === 2) ? (
        <RegistrationForm onNext={handleRegistrationComplete} />
      ) : (
        <div className="py-8">
          {vehicleData && <PricingTable vehicleData={vehicleData} onBack={handleBackToRegistration} />}
        </div>
      )}
    </div>
  );
};

export default Index;
