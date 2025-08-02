
import React, { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import CheckoutLayout from '@/components/CheckoutLayout';
import ProgressIndicator from '@/components/ProgressIndicator';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


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
  const [selectedPlan, setSelectedPlan] = useState<{id: string, paymentType: string, name?: string} | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
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
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan', 'Complete Purchase'];

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
    loadPlans(); // Load plans when moving to step 3
    setCurrentStep(3);
  };

  const handlePlanSelected = (planId: string, paymentType: string, planName?: string) => {
    setSelectedPlan({ id: planId, paymentType, name: planName });
    setCurrentStep(4);
  };

  const handleCustomerDetailsComplete = async (checkoutData: any) => {
    // Handle the final checkout process
    console.log('Processing checkout:', checkoutData);
    // Add checkout logic here (Stripe/Bumper integration)
    toast.success('Purchase completed successfully!');
  };

  // Load plans when moving to checkout
  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load warranty plans');
    }
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

      {currentStep === 3 && vehicleData && (
        <CheckoutLayout
          vehicleData={vehicleData}
          onBack={() => handleBackToStep(2)}
          onComplete={handleCustomerDetailsComplete}
          mode="plan-selection"
          plans={plans}
          onPlanSelected={handlePlanSelected}
        />
      )}

      {currentStep === 4 && vehicleData && selectedPlan && (
        <CheckoutLayout
          vehicleData={vehicleData}
          selectedPlan={selectedPlan}
          onBack={() => handleBackToStep(3)}
          onComplete={handleCustomerDetailsComplete}
          mode="checkout"
          plans={plans}
        />
      )}
      
    </div>
  );
};

export default Index;
