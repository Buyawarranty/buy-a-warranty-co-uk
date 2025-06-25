
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

  if (currentStep === 1 || currentStep === 2) {
    return (
      <div>
        <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
        <RegistrationForm onNext={handleRegistrationComplete} />
      </div>
    );
  }

  return (
    <div>
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      {vehicleData && <PricingTable vehicleData={vehicleData} />}
    </div>
  );
};

export default Index;
