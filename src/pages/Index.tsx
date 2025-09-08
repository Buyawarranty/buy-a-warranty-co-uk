
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Homepage from '@/components/Homepage';
import RegistrationForm from '@/components/RegistrationForm';
import PricingTable from '@/components/PricingTable';
import SpecialVehiclePricing from '@/components/SpecialVehiclePricing';
import CarJourneyProgress from '@/components/CarJourneyProgress';
import QuoteDeliveryStep from '@/components/QuoteDeliveryStep';
import CustomerDetailsStep from '@/components/CustomerDetailsStep';
import { DiscountPopup } from '@/components/DiscountPopup';
import { SEOHead } from '@/components/SEOHead';
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
  console.log('Index component rendering, URL:', window.location.href);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for quote restoration immediately
  const quoteParam = searchParams.get('quote');
  const emailParam = searchParams.get('email');
  console.log('Immediate quote check:', { quoteParam, emailParam });
  
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
    if (stepParam) {
      const step = parseInt(stepParam);
      return step >= 1 && step <= 4 ? step : 1;
    }
    return 1;
  };
  
  const [currentStep, setCurrentStep] = useState(getStepFromUrl());
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  
  // Quote restoration effect - runs immediately when component loads
  useEffect(() => {
    if (quoteParam && emailParam) {
      console.log('QUOTE RESTORATION: Found quote params, fetching data...');
      
      const fetchQuoteData = async () => {
        try {
          console.log('QUOTE RESTORATION: Fetching from database...');
          
          const { data, error } = await supabase
            .from('quote_data')
            .select('*')
            .eq('quote_id', quoteParam)
            .eq('customer_email', emailParam)
            .maybeSingle();

          console.log('QUOTE RESTORATION: Database response:', { data, error });

          if (error || !data) {
            console.error('QUOTE RESTORATION: Failed to fetch quote data:', error);
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
          
          console.log('QUOTE RESTORATION: Restoring vehicle data and going to step 3:', restoredVehicleData);
          setVehicleData(restoredVehicleData);
          setFormData(prev => ({ ...prev, ...restoredVehicleData }));
          setCurrentStep(3);
          updateStepInUrl(3);
          
        } catch (error) {
          console.error('QUOTE RESTORATION: Error in fetchQuoteData:', error);
        }
      };

      fetchQuoteData();
    }
  }, [quoteParam, emailParam]);
  
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
    console.log('useEffect triggered, current URL:', window.location.href);
    console.log('searchParams:', Object.fromEntries(searchParams.entries()));
    console.log('currentStep:', currentStep);
    window.scrollTo(0, 0);
    
    // Check for quote parameter from email links FIRST
    const quoteParam = searchParams.get('quote');
    const emailParam = searchParams.get('email');
    
    console.log('URL params check:', { quoteParam, emailParam, currentUrl: window.location.href });
    
    if (quoteParam && emailParam) {
      console.log('Quote params found, fetching quote data...');
      // User is returning from a quote email - fetch the stored quote data
      // User is returning from a quote email - fetch the stored quote data
      const fetchQuoteData = async () => {
        try {
          console.log('Fetching quote data:', { quoteParam, emailParam });
          
          const { data, error } = await supabase
            .from('quote_data')
            .select('*')
            .eq('quote_id', quoteParam)
            .eq('customer_email', emailParam)
            .maybeSingle();

          console.log('Quote data response:', { data, error });

          if (error) {
            console.error('Error fetching quote data:', error);
            setCurrentStep(1);
            updateStepInUrl(1);
            return;
          }

          if (!data) {
            console.error('Quote not found or expired');
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

    // Show discount popup after 20 seconds of scrolling (not on homepage)
    if (currentStep !== 1) {
      // Check if already seen popup in this session
      const hasSeenPopup = sessionStorage.getItem('hasSeenDiscountPopup');
      if (hasSeenPopup) return;
      
      let scrollTime = 0;
      let scrollTimer: NodeJS.Timeout;
      let isScrolling = false;
      
      const handleScroll = () => {
        if (!isScrolling) {
          isScrolling = true;
          scrollTimer = setInterval(() => {
            scrollTime += 100; // Increment by 100ms
            if (scrollTime >= 20000) { // 20 seconds
              setShowDiscountPopup(true);
              clearInterval(scrollTimer);
              window.removeEventListener('scroll', handleScroll);
            }
          }, 100);
        }
        
        // Reset scrolling flag after a brief pause
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          isScrolling = false;
          clearInterval(scrollTimer);
        }, 150);
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(scrollTimer);
      };
    }
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const stepFromUrl = getStepFromUrl();
      setCurrentStep(stepFromUrl);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Load saved state on initial load
    const savedState = loadStateFromLocalStorage();
    const stepFromUrl = getStepFromUrl();
    
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
  }, [searchParams]);
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan', 'Review & Confirm'];

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

  const handleHomepageRegistration = (vehicleData: VehicleData) => {
    console.log('Homepage registration submitted:', vehicleData);
    
    // Set the vehicle data and go to quote delivery step (step 2)
    setVehicleData(vehicleData);
    setFormData({ ...formData, ...vehicleData });
    setCurrentStep(2); // Go to quote delivery step
    updateStepInUrl(2);
    saveStateToLocalStorage(2);
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
    setCurrentStep(4); // Back to step 4 for customer details
    updateStepInUrl(4);
    saveStateToLocalStorage(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track plan selection for abandoned cart emails
    if (vehicleData) {
      trackAbandonedCart(vehicleData, 4, planName, paymentType); // Back to step 4
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
    <div className="min-h-screen overflow-x-hidden">
      <SEOHead 
        title={
          currentStep === 1 ? "Car Warranty Prices | Affordable UK Vehicle Warranties" :
          currentStep === 2 ? "Get Your Car Warranty Quote | Instant Online Quotes" :
          currentStep === 3 ? "Choose Your Car Warranty Plan | Compare Prices" :
          "Complete Your Car Warranty Purchase | Secure Checkout"
        }
        description={
          currentStep === 1 ? "Compare our car warranty prices and choose the perfect plan for your vehicle. Flexible, affordable UK coverage with no hidden fees. Instant online quotes available." :
          currentStep === 2 ? "Get an instant quote for your car warranty. Enter your vehicle details and receive competitive pricing for comprehensive coverage in the UK." :
          currentStep === 3 ? "Compare car warranty plans and choose the best coverage for your vehicle. Basic, Gold, and Platinum options available with flexible payment terms." :
          "Complete your car warranty purchase with our secure checkout. Instant activation and immediate coverage for your vehicle."
        }
        keywords="car warranty, vehicle warranty, UK warranty, car insurance, breakdown cover, warranty prices, vehicle protection, extended warranty"
        canonical={`${window.location.origin}/?step=${currentStep}`}
      />
      {currentStep !== 1 && (
        <div className="bg-[#e8f4fb]">
          <CarJourneyProgress currentStep={currentStep} onStepChange={handleStepChange} />
        </div>
      )}
      
      {currentStep === 1 && (
        <Homepage onRegistrationSubmit={handleHomepageRegistration} />
      )}

      {currentStep === 2 && vehicleData && (
        <div className="bg-[#e8f4fb] w-full px-4 py-2 sm:py-4">
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
        <div className="bg-[#e8f4fb] w-full overflow-x-hidden">
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

      {currentStep === 4 && (
        <div className="bg-[#e8f4fb]">
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
        </div>
      )}
      

      {/* Discount Popup */}
      <DiscountPopup 
        isOpen={showDiscountPopup} 
        onClose={() => {
          setShowDiscountPopup(false);
          sessionStorage.setItem('hasSeenDiscountPopup', 'true');
        }}
      />
    </div>
  );
};

export default Index;
