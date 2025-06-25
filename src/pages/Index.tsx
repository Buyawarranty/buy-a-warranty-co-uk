
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
  
  const steps = ['Your Car', 'You', 'Choose Plan'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setCurrentStep(3);
  };

  const handleBackToRegistration = () => {
    setCurrentStep(2);
  };

  const handleBackToVehicleDetails = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-[#e8f4fb]">
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      
      {(currentStep === 1 || currentStep === 2) ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <RegistrationForm 
            onNext={handleRegistrationComplete} 
            onBack={currentStep === 2 ? handleBackToVehicleDetails : undefined}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {vehicleData && <PricingTable vehicleData={vehicleData} onBack={handleBackToRegistration} />}
        </div>
      )}
    </div>
  );
};

export default Index;
