
import React, { useState, useEffect } from 'react';
import VehicleDetailsStep from './VehicleDetailsStep';
import ContactDetailsStep from './ContactDetailsStep';

interface RegistrationFormProps {
  onNext: (data: { regNumber: string; mileage: string; email?: string; phone?: string }) => void;
  onBack?: (step: number) => void;
  onFormDataUpdate?: (data: any) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
  };
  currentStep: number;
  onStepChange: (step: number) => void;
}

interface VehicleData {
  regNumber: string;
  mileage: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onNext, 
  onBack, 
  onFormDataUpdate,
  initialData,
  currentStep,
  onStepChange
}) => {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  const handleVehicleNext = (data: VehicleData) => {
    setVehicleData(data);
    onFormDataUpdate?.(data);
    onStepChange(2);
  };

  const handleContactNext = (contactData: { email?: string; phone?: string }) => {
    if (vehicleData) {
      onNext({
        ...vehicleData,
        ...contactData
      });
    }
  };

  const handleBackToVehicle = () => {
    onStepChange(1);
  };

  if (currentStep === 1) {
    return (
      <VehicleDetailsStep 
        onNext={handleVehicleNext}
        onBack={onBack ? () => onBack(1) : handleBackToVehicle}
        initialData={initialData}
        onFormDataUpdate={onFormDataUpdate || (() => {})}
        currentStep={currentStep}
        onStepChange={onStepChange}
      />
    );
  }

  return (
    <ContactDetailsStep 
      onNext={handleContactNext} 
      onBack={onBack ? () => onBack(1) : handleBackToVehicle}
      initialData={initialData}
    />
  );
};

export default RegistrationForm;
