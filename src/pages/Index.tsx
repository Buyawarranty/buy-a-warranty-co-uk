
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import CarJourneyProgress from '@/components/CarJourneyProgress';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import CustomerDetailsStep from '@/components/CustomerDetailsStep';
import WarrantyCart from '@/components/WarrantyCart';
import MultiWarrantyCheckout from '@/components/MultiWarrantyCheckout';
import { supabase } from '@/integrations/supabase/client';
import { useCart, CartItem } from '@/contexts/CartContext';


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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  
  // Initialize state variables first
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
  
  // Get current step from URL or default to 1
  const getStepFromUrl = () => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'cart') {
      return 1; // Will be handled separately in useEffect
    }
    if (stepParam) {
      const step = parseInt(stepParam);
      return step >= 1 && step <= 4 ? step : 1;
    }
    return 1;
  };
  
  const [currentStep, setCurrentStep] = useState(getStepFromUrl());
  const [showCart, setShowCart] = useState(false);
  const [showCartCheckout, setShowCartCheckout] = useState(false);
  
  // Save state to localStorage
  const saveStateToLocalStorage = (step?: number) => {
    const state = {
      step: step || currentStep,
      vehicleData,
      selectedPlan,
      formData
    };
    localStorage.setItem('warrantyJourneyState', JSON.stringify(state));
  };
  
  // Load state from localStorage
  const loadStateFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem('warrantyJourneyState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return null;
  };
  
  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', step.toString());
    setSearchParams(newSearchParams, { replace: true });
  };
  
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
    // Store current state in localStorage for persistence
    saveStateToLocalStorage(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const stepFromUrl = getStepFromUrl();
      setCurrentStep(stepFromUrl);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Load saved state on initial load
    const savedState = loadStateFromLocalStorage();
    const stepFromUrl = getStepFromUrl();
    
    // Check for cart parameter
    const stepParam = searchParams.get('step');
    if (stepParam === 'cart') {
      setShowCart(true);
      setCurrentStep(1); // Set a valid step for the progress indicator
      return;
    }

    // Check for quote parameter from email links
    const quoteParam = searchParams.get('quote');
    const emailParam = searchParams.get('email');
    
    if (quoteParam && emailParam) {
      // User is returning from a quote email - fetch the stored quote data
      const fetchQuoteData = async () => {
        try {
          const { data, error } = await supabase
            .from('quote_data')
            .select('*')
            .eq('quote_id', quoteParam)
            .eq('customer_email', emailParam)
            .single();

          if (error || !data) {
            console.error('Quote not found or expired:', error);
            // Show error message and redirect to step 1
            setCurrentStep(1);
            updateStepInUrl(1);
            return;
          }

          // Restore the vehicle data from the stored quote
          const vehicleDataJson = data.vehicle_data as any;
          const restoredVehicleData = {
            regNumber: vehicleDataJson.regNumber || '',
            mileage: vehicleDataJson.mileage || '',
            email: emailParam,
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            make: vehicleDataJson.make || '',
            model: vehicleDataJson.model || '',
            year: vehicleDataJson.year || '',
            vehicleType: vehicleDataJson.vehicleType || 'car',
            fuelType: vehicleDataJson.fuelType || '',
            transmission: vehicleDataJson.transmission || ''
          };
          
          setVehicleData(restoredVehicleData);
          setFormData(prev => ({ ...prev, ...restoredVehicleData }));
          setCurrentStep(3); // Go to step 3 (choose your plan)
          updateStepInUrl(3);
          
          console.log('Quote data restored successfully:', restoredVehicleData);
        } catch (error) {
          console.error('Error fetching quote data:', error);
          setCurrentStep(1);
          updateStepInUrl(1);
        }
      };

      fetchQuoteData();
      return;
    }
    
    // Check for restore parameter from email links
    const restoreParam = searchParams.get('restore');
    
    if (restoreParam) {
      try {
        const restoredData = JSON.parse(atob(restoreParam));
        setVehicleData(restoredData);
        setFormData(prev => ({ ...prev, ...restoredData }));
        if (restoredData.selectedPlan) {
          setSelectedPlan(restoredData.selectedPlan);
        }
        const restoredStep = restoredData.step || 3;
        setCurrentStep(restoredStep);
        updateStepInUrl(restoredStep);
        
        // Clear the restore parameter but keep step
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('step', restoredStep.toString());
        setSearchParams(newSearchParams, { replace: true });
      } catch (error) {
        console.error('Error restoring data from URL:', error);
      }
    } else if (savedState && stepFromUrl > 1) {
      // Restore from localStorage if we're not on step 1
      setVehicleData(savedState.vehicleData);
      setSelectedPlan(savedState.selectedPlan);
      setFormData(prev => savedState.formData || prev);
    } else if (stepFromUrl === 1) {
      // Clear localStorage if we're starting fresh
      localStorage.removeItem('warrantyJourneyState');
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan', 'Final Details'];

  const handleRegistrationComplete = (data: VehicleData) => {
    setVehicleData(data);
    setFormData({ ...formData, ...data });
    // If manual entry was used, skip step 2 and go directly to pricing
    const nextStep = data.isManualEntry ? 3 : 2;
    setCurrentStep(nextStep);
    updateStepInUrl(nextStep);
    saveStateToLocalStorage(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
    saveStateToLocalStorage(step);
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
    updateStepInUrl(3);
    saveStateToLocalStorage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track pricing page view for abandoned cart emails
    trackAbandonedCart(updatedData as VehicleData, 3);
  };

  const handlePlanSelected = (planId: string, paymentType: string, planName?: string, pricingData?: {totalPrice: number, monthlyPrice: number, voluntaryExcess: number, selectedAddOns: {[addon: string]: boolean}}) => {
    setSelectedPlan({ id: planId, paymentType, name: planName, pricingData });
    setCurrentStep(4);
    updateStepInUrl(4);
    saveStateToLocalStorage(4);
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

  // Cart handlers
  const handleAddMoreToCart = () => {
    setShowCart(false);
    setCurrentStep(1);
    updateStepInUrl(1);
  };

  const handleProceedToCheckout = (items: CartItem[]) => {
    setShowCartCheckout(true);
  };

  const handleBackToCart = () => {
    setShowCartCheckout(false);
  };

  // Show cart interface
  if (showCart && !showCartCheckout) {
    return (
      <WarrantyCart 
        onAddMore={handleAddMoreToCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
    );
  }

  // Show cart checkout
  if (showCartCheckout) {
    return (
      <MultiWarrantyCheckout 
        items={cartItems}
        onBack={handleBackToCart}
      />
    );
  }

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
              onStepChange={handleStepChange}
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
              onSkip={() => handleStepChange(3)}
            />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full overflow-x-hidden">
          {vehicleData && (
            <>
              {/* Shopping Cart - Prominently placed above pricing tables */}
              {cartItems.length > 0 && (
                <div className="w-full px-4 py-4">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-orange-50 rounded-lg shadow-md border-2 border-orange-400 p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                            {cartItems.length}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-orange-900">Your Cart</h3>
                            <p className="text-sm text-orange-700">
                              You've added {cartItems.length} warrant{cartItems.length === 1 ? 'y' : 'ies'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setCurrentStep(1)}
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-100"
                          >
                            Add Another Vehicle
                          </Button>
                          <Button 
                            onClick={() => setShowCart(true)}
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                          >
                            Checkout Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

      {currentStep === 4 && (
        <>
          {vehicleData && selectedPlan ? (
            <CustomerDetailsStep
              vehicleData={vehicleData}
              planId={selectedPlan.id}
              paymentType={selectedPlan.paymentType}
              planName={selectedPlan.name}
              pricingData={selectedPlan.pricingData}
              onNext={handleCustomerDetailsComplete}
              onBack={() => handleBackToStep(3)}
            />
          ) : (
            <div className="w-full px-4 py-8">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Oops! We've lost your order details
                </h2>
                <p className="text-gray-600">
                  It looks like your session has expired or you've navigated back from a payment page. 
                  Please start your warranty journey again to continue.
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={() => handleStepChange(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Start Over
                  </Button>
                  <p className="text-sm text-gray-500">
                    If you've already completed a payment, please check your email for confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
    </div>
  );
};

export default Index;
