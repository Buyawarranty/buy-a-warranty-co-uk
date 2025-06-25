
import React, { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import ProgressIndicator from '@/components/ProgressIndicator';

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
    year: ''
  });
  
  const steps = ['Your Car', 'You', 'Choose Plan'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleFormDataUpdate = (data: Partial<VehicleData>) => {
    setFormData({ ...formData, ...data });
  };

  return (
    <div className="min-h-screen bg-[#e8f4fb] pb-20"> {/* Add bottom padding for footer */}
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      
      {(currentStep === 1 || currentStep === 2) ? (
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
      ) : (
        <div className="w-full">
          {vehicleData && (
            <PricingTable 
              vehicleData={vehicleData} 
              onBack={() => handleBackToStep(2)} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
