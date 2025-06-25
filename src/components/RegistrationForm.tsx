
import React, { useState } from 'react';
import VehicleDetailsStep from './VehicleDetailsStep';
import ContactDetailsStep from './ContactDetailsStep';

interface RegistrationFormProps {
  onNext: (data: { regNumber: string; mileage: string; email?: string; phone?: string }) => void;
  onBack?: () => void;
}

interface VehicleData {
  regNumber: string;
  mileage: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNext, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  const handleVehicleNext = (data: VehicleData) => {
    setVehicleData(data);
    setCurrentStep(2);
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
    setCurrentStep(1);
  };

  if (currentStep === 1) {
    return <VehicleDetailsStep onNext={handleVehicleNext} />;
  }

  return (
    <ContactDetailsStep 
      onNext={handleContactNext} 
      onBack={onBack || handleBackToVehicle}
    />
  );
};

export default RegistrationForm;
