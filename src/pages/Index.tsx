
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import CarJourneyProgress from '@/components/CarJourneyProgress';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import CustomerDetailsStep from '@/components/CustomerDetailsStep';
import { supabase } from '@/integrations/supabase/client';


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
  isManualEntry?: boolean;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Check for restore parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restoreParam = urlParams.get('restore');
    const stepParam = urlParams.get('step');
    
    if (restoreParam) {
      try {
        const restoredData = JSON.parse(atob(restoreParam));
        setVehicleData(restoredData);
        setFormData({ ...formData, ...restoredData });
        if (restoredData.selectedPlan) {
          setSelectedPlan(restoredData.selectedPlan);
        }
        setCurrentStep(restoredData.step || 3);
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error restoring data from URL:', error);
      }
    } else if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 4) {
        setCurrentStep(step);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
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
    // If manual entry was used, skip step 2 and go directly to pricing
    const nextStep = data.isManualEntry ? 3 : 2;
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormDataUpdate = (data: Partial<VehicleData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleQuoteDeliveryComplete = (contactData: { email: string; phone: string; firstName: string; lastName: string }) => {
    const updatedData = { ...vehicleData, ...contactData };
    setVehicleData(updatedData as VehicleData);
    setFormData({ ...formData, ...contactData });
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track pricing page view for abandoned cart emails
    trackAbandonedCart(updatedData as VehicleData, 3);
  };

  const handlePlanSelected = (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => {
    setSelectedPlan({ id: planId, paymentType, name: planName, pricingData });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track plan selection for abandoned cart emails
    if (vehicleData) {
      trackAbandonedCart(vehicleData, 4, planName, paymentType);
    }
  };

  const handleCustomerDetailsComplete = (customerData: any) => {
    // This will be handled by the CustomerDetailsStep component itself
    console.log('Customer details completed:', customerData);
  };

  // Function to track abandoned cart events
  const trackAbandonedCart = async (data: VehicleData, step: number, planName?: string, paymentType?: string) => {
    try {
      await supabase.functions.invoke('track-abandoned-cart', {
        body: {
          full_name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
          email: data.email,
          phone: data.phone,
          vehicle_reg: data.regNumber,
          vehicle_make: data.make,
          vehicle_model: data.model,
          vehicle_year: data.year,
          vehicle_type: data.vehicleType, // Include vehicle type for special vehicles
          mileage: data.mileage,
          plan_name: planName,
          payment_type: paymentType,
          step_abandoned: step
        }
      });
    } catch (error) {
      console.error('Error tracking abandoned cart:', error);
      // Don't throw error to avoid disrupting user flow
    }
  };

  // Check if vehicle is a special type
  const isSpecialVehicle = vehicleData?.vehicleType && ['EV', 'PHEV', 'MOTORBIKE'].includes(vehicleData.vehicleType);

  return (
    <div className="bg-[#e8f4fb] min-h-screen overflow-x-hidden">
      {/* Customer Login Header */}
      <div className="w-full bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-end">
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Customer Login
            </Button>
          </Link>
        </div>
      </div>
      
      <CarJourneyProgress currentStep={currentStep} onStepChange={handleStepChange} />
      
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
