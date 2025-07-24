
import React, { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import ProgressIndicator from '@/components/ProgressIndicator';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import TrustpilotHeader from '@/components/TrustpilotHeader';

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
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan'];

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
    <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
      
      <ProgressIndicator currentStep={currentStep} totalSteps={3} steps={steps} />
      
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
      
      {/* Trustpilot logo in bottom right corner */}
      <div className="fixed top-4 right-4 z-10">
        <img 
          src="/lovable-uploads/bed8e125-f5d3-4bf5-a0f8-df4df5ff8693.png" 
          alt="Trustpilot" 
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};

export default Index;
