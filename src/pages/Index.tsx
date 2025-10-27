
import React, { useState, useEffect, useCallback, useMemo, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Homepage from '@/components/Homepage';
import { DiscountPopup } from '@/components/DiscountPopup';
import { SEOHead } from '@/components/SEOHead';
import { OrganizationSchema } from '@/components/schema/OrganizationSchema';
import { FAQSchema, defaultWarrantyFAQs } from '@/components/schema/FAQSchema';
import { ProductSchema } from '@/components/schema/ProductSchema';
import { BreadcrumbSchema } from '@/components/schema/BreadcrumbSchema';
import { ReviewSchema } from '@/components/schema/ReviewSchema';
import { WebPageSchema } from '@/components/schema/WebPageSchema';
import { supabase } from '@/integrations/supabase/client';
import { useMobileBackNavigation } from '@/hooks/useMobileBackNavigation';
import { useQuoteRestoration } from '@/hooks/useQuoteRestoration';
import { batchLocalStorageWrite, safeLocalStorageRemove, parseLocalStorageJSON } from '@/utils/localStorage';
import PerformanceOptimizedSuspense from '@/components/PerformanceOptimizedSuspense';
import { BackNavigationConfirmDialog } from '@/components/BackNavigationConfirmDialog';

// Lazy load heavy components that are not immediately visible
const RegistrationForm = lazy(() => import('@/components/RegistrationForm'));
const PricingTable = lazy(() => import('@/components/PricingTable'));
const CarJourneyProgress = lazy(() => import('@/components/CarJourneyProgress'));
const QuoteDeliveryStep = lazy(() => import('@/components/QuoteDeliveryStep'));
const CustomerDetailsStep = lazy(() => import('@/components/CustomerDetailsStep'));
const MaintenanceBanner = lazy(() => import('@/components/MaintenanceBanner'));


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
  blocked?: boolean;
  blockReason?: string;
}

// Recovery fallback component
const RecoveryFallback: React.FC<{
  onRecovered: (vehicleData: VehicleData, selectedPlan: any) => void;
  onStartOver: () => void;
}> = ({ onRecovered, onStartOver }) => {
  const [isAttemptingRecovery, setIsAttemptingRecovery] = useState(false);
  const [recoveryFailed, setRecoveryFailed] = useState(false);

  useEffect(() => {
    // Attempt automatic recovery once
    const attemptRecovery = () => {
      setIsAttemptingRecovery(true);
      
      try {
        const savedVehicleData = localStorage.getItem('buyawarranty_vehicleData');
        const savedSelectedPlan = localStorage.getItem('buyawarranty_selectedPlan');
        
        if (savedVehicleData && savedSelectedPlan) {
          const parsedVehicleData = JSON.parse(savedVehicleData);
          const parsedSelectedPlan = JSON.parse(savedSelectedPlan);
          
          console.log('Recovery attempt successful:', { parsedVehicleData, parsedSelectedPlan });
          onRecovered(parsedVehicleData, parsedSelectedPlan);
          return;
        }
      } catch (error) {
        console.error('Error during recovery attempt:', error);
      }
      
      // Recovery failed
      setRecoveryFailed(true);
      setIsAttemptingRecovery(false);
    };

    attemptRecovery();
  }, [onRecovered]);

  if (isAttemptingRecovery) {
    return (
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Restoring your details...
          </h2>
          <p className="text-gray-600">
            We're recovering your warranty details. This will only take a moment.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (recoveryFailed) {
    // Scroll to top so user can see the error message
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    return (
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
              onClick={onStartOver}
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
    );
  }

  return null;
};

const Index = () => {
  console.log('Index component rendering, URL:', window.location.href);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for quote restoration immediately
  const quoteParam = searchParams.get('quote');
  const emailParam = searchParams.get('email');
  console.log('Immediate quote check:', { quoteParam, emailParam });
  console.log('All URL params:', Object.fromEntries(searchParams.entries()));
  
  // Initialize state variables first - check localStorage immediately for vehicleData
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(() => {
    try {
      const saved = localStorage.getItem('buyawarranty_vehicleData');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string, 
    paymentType: string, 
    name?: string, 
    pricingData?: {
      totalPrice: number, 
      monthlyPrice: number, 
      voluntaryExcess: number, 
      selectedAddOns: {[addon: string]: boolean},
      protectionAddOns?: {[key: string]: boolean},
      claimLimit?: number
    }
  } | null>(null);
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
  
  // State for back navigation confirmation dialog
  const [showBackConfirmDialog, setShowBackConfirmDialog] = useState(false);
  
  // Get current step from URL or default to 1
  const getStepFromUrl = () => {
    const stepParam = searchParams.get('step');
    console.log('getStepFromUrl - stepParam:', stepParam);
    if (stepParam) {
      const step = parseInt(stepParam);
      console.log('getStepFromUrl - parsed step:', step);
      return step >= 1 && step <= 5 ? step : 1;
    }
    // Also check window.location for step parameter as fallback
    const urlParams = new URLSearchParams(window.location.search);
    const fallbackStep = urlParams.get('step');
    console.log('getStepFromUrl - fallback step from window.location:', fallbackStep);
    if (fallbackStep) {
      const step = parseInt(fallbackStep);
      return step >= 1 && step <= 5 ? step : 1;
    }
    return 1;
  };
  
  const [currentStep, setCurrentStep] = useState(getStepFromUrl());
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  
  const { restoreQuoteData } = useQuoteRestoration();

  // Quote restoration effect - optimized with memoization
  useEffect(() => {
    if (quoteParam && emailParam) {
      restoreQuoteData(quoteParam, emailParam).then(restoredData => {
        if (restoredData) {
          setVehicleData(restoredData);
          setFormData(prev => ({ ...prev, ...restoredData }));
          
          // Batch localStorage operations
          const updates = {
            buyawarranty_vehicleData: JSON.stringify(restoredData),
            buyawarranty_formData: JSON.stringify(restoredData),
            buyawarranty_currentStep: '3'
          };
          Object.entries(updates).forEach(([key, value]) => 
            localStorage.setItem(key, value)
          );
          
          setCurrentStep(3);
          updateStepInUrl(3);
        }
      });
    }
  }, [quoteParam, emailParam, restoreQuoteData]);
  
  // Optimized localStorage operations with batching
  const saveStateToLocalStorage = useCallback((step?: number) => {
    const currentStepValue = step || currentStep;
    const state = {
      step: currentStepValue,
      vehicleData,
      selectedPlan,
      formData
    };
    
    // Batch all localStorage operations to reduce I/O
    const updates: Record<string, string> = {
      warrantyJourneyState: JSON.stringify(state),
      buyawarranty_formData: JSON.stringify(formData),
      buyawarranty_currentStep: String(currentStepValue)
    };
    
    if (vehicleData) {
      updates.buyawarranty_vehicleData = JSON.stringify(vehicleData);
    }
    if (selectedPlan) {
      updates.buyawarranty_selectedPlan = JSON.stringify(selectedPlan);
    }
    
    Object.entries(updates).forEach(([key, value]) => 
      localStorage.setItem(key, value)
    );
  }, [currentStep, vehicleData, selectedPlan, formData]);
  
  // Memoized localStorage operations
  const loadStateFromLocalStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem('warrantyJourneyState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      return null;
    }
  }, []);
  
  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('step', step.toString());
    
    // Push state to history (not replace) so each step creates a history entry
    // This allows proper back button navigation
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    window.history.pushState({ step }, '', newUrl);
    
    // Also update React Router's search params without adding another history entry
    setSearchParams(newSearchParams, { replace: true });
  };
  
  // Restore state from localStorage for a specific step
  const restoreStateFromStep = useCallback((step: number) => {
    console.log('🔄 Restoring state for step', step);
    const savedState = loadStateFromLocalStorage();
    
    if (savedState) {
      console.log('✅ Found saved state:', savedState);
      if (savedState.vehicleData) setVehicleData(savedState.vehicleData);
      if (savedState.selectedPlan) setSelectedPlan(savedState.selectedPlan);
      if (savedState.formData) setFormData(savedState.formData);
    } else {
      console.log('⚠️ No saved state found, checking individual items');
      // Try individual localStorage items as fallback
      const savedVehicleData = localStorage.getItem('buyawarranty_vehicleData');
      const savedSelectedPlan = localStorage.getItem('buyawarranty_selectedPlan');
      const savedFormData = localStorage.getItem('buyawarranty_formData');
      
      if (savedVehicleData) {
        try {
          setVehicleData(JSON.parse(savedVehicleData));
        } catch (e) {
          console.error('Error parsing vehicleData:', e);
        }
      }
      
      if (savedSelectedPlan) {
        try {
          setSelectedPlan(JSON.parse(savedSelectedPlan));
        } catch (e) {
          console.error('Error parsing selectedPlan:', e);
        }
      }
      
      if (savedFormData) {
        try {
          setFormData(JSON.parse(savedFormData));
        } catch (e) {
          console.error('Error parsing formData:', e);
        }
      }
    }
  }, [loadStateFromLocalStorage]);
  
  const handleStepChange = (step: number) => {
    console.log('📍 Step change:', currentStep, '->', step);
    setCurrentStep(step);
    updateStepInUrl(step);
    // Store current state in localStorage for persistence
    saveStateToLocalStorage(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redirect to step 1 if accessing step 2+ without vehicle data
  useEffect(() => {
    if (currentStep >= 2 && !vehicleData) {
      console.log('⚠️ Accessing step', currentStep, 'without vehicle data, redirecting to step 1');
      handleStepChange(1);
    }
  }, [currentStep, vehicleData]);

  // Handle mobile back button navigation to keep users on the site
  const { allowLeave, stay } = useMobileBackNavigation({
    currentStep,
    onStepChange: handleStepChange,
    totalSteps: 5,
    restoreStateFromStep,
    journeyId: 'warranty-journey',
    isGuarded: currentStep > 1, // Only guard if user has progressed past step 1
    onShowConfirmDialog: () => setShowBackConfirmDialog(true)
  });
  
  // Debounced state saving to reduce localStorage writes
  useEffect(() => {
    if (vehicleData || selectedPlan) {
      const timeoutId = setTimeout(() => {
        saveStateToLocalStorage();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [vehicleData, selectedPlan, saveStateToLocalStorage]);
  
  
  useEffect(() => {
    console.log('useEffect triggered, current URL:', window.location.href);
    console.log('searchParams:', Object.fromEntries(searchParams.entries()));
    console.log('currentStep:', currentStep);
    window.scrollTo(0, 0);
    
    // Check for quote parameter from email links FIRST
    const quoteParam = searchParams.get('quote');
    const emailParam = searchParams.get('email');
    
    console.log('URL params check:', { quoteParam, emailParam, currentUrl: window.location.href });
    
    // Quote restoration is now handled by the earlier effect to avoid duplication

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
    
    // Note: popstate is now handled by useMobileBackNavigation hook
    // which includes state restoration logic
    
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
      localStorage.removeItem('buyawarranty_vehicleData');
      localStorage.removeItem('buyawarranty_selectedPlan');
      localStorage.removeItem('buyawarranty_formData');
      localStorage.removeItem('buyawarranty_currentStep');
      localStorage.removeItem('buyawarranty_customerData');
    }
    
    // Additional recovery for when users return from payment pages
    if (stepFromUrl === 4 && (!vehicleData || !selectedPlan)) {
      console.log('Step 4 detected without required data, attempting recovery from localStorage');
      
      const savedVehicleData = localStorage.getItem('buyawarranty_vehicleData');
      const savedSelectedPlan = localStorage.getItem('buyawarranty_selectedPlan');
      const savedFormData = localStorage.getItem('buyawarranty_formData');
      
      if (savedVehicleData && !vehicleData) {
        try {
          const parsedVehicleData = JSON.parse(savedVehicleData);
          console.log('Recovered vehicle data:', parsedVehicleData);
          setVehicleData(parsedVehicleData);
        } catch (error) {
          console.error('Error parsing saved vehicle data:', error);
        }
      }
      
      if (savedSelectedPlan && !selectedPlan) {
        try {
          const parsedSelectedPlan = JSON.parse(savedSelectedPlan);
          console.log('Recovered selected plan:', parsedSelectedPlan);
          setSelectedPlan(parsedSelectedPlan);
        } catch (error) {
          console.error('Error parsing saved selected plan:', error);
        }
      }
      
      if (savedFormData) {
        try {
          const parsedFormData = JSON.parse(savedFormData);
          setFormData(prev => ({ ...prev, ...parsedFormData }));
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
    
    // Cleanup handled by useMobileBackNavigation hook
  }, [searchParams, quoteParam, emailParam, restoreQuoteData, currentStep, vehicleData, selectedPlan, loadStateFromLocalStorage, setSearchParams]);
  
  const steps = ['Your Reg Plate', 'Receive Quote', 'Choose Your Plan', 'Review & Confirm'];

  const handleRegistrationComplete = (data: VehicleData) => {
    const nextStep = data.isManualEntry ? 3 : 2;
    
    setVehicleData(data);
    setFormData({ ...formData, ...data });
    setCurrentStep(nextStep);
    updateStepInUrl(nextStep);
    saveStateToLocalStorage(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomepageRegistration = (vehicleData: VehicleData) => {
    console.log('Homepage registration submitted:', vehicleData);
    
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

  const handlePlanSelected = (
    planId: string, 
    paymentType: string, 
    planName?: string, 
    pricingData?: {
      totalPrice: number, 
      monthlyPrice: number, 
      voluntaryExcess: number, 
      selectedAddOns: {[addon: string]: boolean}, 
      protectionAddOns?: {[key: string]: boolean},
      claimLimit?: number
    }
  ) => {
    setSelectedPlan({ id: planId, paymentType, name: planName, pricingData });
    setCurrentStep(4); // Go to step 4 for customer details/checkout
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

  // Memoized abandoned cart tracking to avoid unnecessary calls
  const trackAbandonedCart = useCallback(async (data: VehicleData, step: number, planName?: string, paymentType?: string) => {
    try {
      // Always track with email if available, otherwise use vehicle reg as identifier
      const trackingEmail = data.email || data.regNumber || 'no-identifier';
      
      await supabase.functions.invoke('track-abandoned-cart', {
        body: {
          full_name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : (data.email || ''),
          email: trackingEmail,
          phone: data.phone || '',
          vehicle_reg: data.regNumber,
          vehicle_make: data.make,
          vehicle_model: data.model,
          vehicle_year: data.year,
          vehicle_type: data.vehicleType,
          mileage: data.mileage,
          plan_name: planName,
          payment_type: paymentType,
          step_abandoned: step
        }
      });
      console.log(`✅ Tracked abandoned cart at step ${step} for:`, trackingEmail);
    } catch (error) {
      console.error('Error tracking abandoned cart:', error);
    }
  }, []);

  // All vehicles now use the modern PricingTable layout

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
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
          "Complete your car warranty purchase with our secure checkout. Review your selected plan and enter your details for instant approval."
        }
        keywords="car warranty, vehicle warranty, UK warranty, car insurance, breakdown cover, warranty prices, vehicle protection, extended warranty"
        canonical="https://buyawarranty.co.uk/"
      />
      
      {/* Schema.org Structured Data for AI Search & SEO */}
      <OrganizationSchema type="LocalBusiness" />
      <ReviewSchema />
      <WebPageSchema 
        name="Car Warranty UK | Instant Quotes"
        description="Leading UK car warranty provider since 2016 with 4.7-star Trustpilot rating. Get instant quotes for comprehensive vehicle protection."
        url="https://buyawarranty.co.uk/"
      />
      <FAQSchema faqs={defaultWarrantyFAQs} />
      <ProductSchema 
        name="Car Warranty UK"
        description="Comprehensive car warranty protection for UK vehicles. Flexible plans from £20/month with instant online quotes and 14-day money-back guarantee."
        price="20"
        priceCurrency="GBP"
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: 'https://buyawarranty.co.uk/' },
          ...(currentStep === 2 ? [{ name: 'Get Quote', url: 'https://buyawarranty.co.uk/' }] : []),
          ...(currentStep === 3 ? [{ name: 'Choose Plan', url: 'https://buyawarranty.co.uk/' }] : []),
          ...(currentStep === 4 ? [{ name: 'Checkout', url: 'https://buyawarranty.co.uk/' }] : [])
        ]}
      />
      
      {/* Progress Bar with Moving Car - Steps 2, 3, and 4 */}
      {currentStep >= 2 && currentStep <= 4 && (
        <PerformanceOptimizedSuspense height="120px">
          <CarJourneyProgress currentStep={currentStep} />
        </PerformanceOptimizedSuspense>
      )}
      
      {currentStep === 1 && (
        <Homepage onRegistrationSubmit={handleHomepageRegistration} />
      )}

      {currentStep === 2 && vehicleData && (
        <div className="bg-[#e8f4fb] w-full px-4 py-2 sm:py-4">
          <div className="max-w-4xl mx-auto">
        <PerformanceOptimizedSuspense height="40vh">
          <QuoteDeliveryStep 
            vehicleData={vehicleData}
            onNext={handleQuoteDeliveryComplete}
            onBack={() => handleBackToStep(1)}
            onSkip={() => handleStepChange(3)}
          />
        </PerformanceOptimizedSuspense>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-[#e8f4fb] w-full overflow-x-hidden">
          {(() => {
            console.log('🚗 Step 3 rendering - vehicleData:', vehicleData);
            console.log('🚗 vehicleData exists:', !!vehicleData);
            if (vehicleData) {
              console.log('✅ Rendering PricingTable with vehicleData:', {
                regNumber: vehicleData.regNumber,
                make: vehicleData.make,
                model: vehicleData.model
              });
            } else {
              console.log('❌ No vehicleData available, showing fallback');
            }
            return vehicleData;
          })() ? (
            <PerformanceOptimizedSuspense height="60vh">
              <PricingTable 
                vehicleData={vehicleData} 
                onBack={() => handleBackToStep(2)} 
                onPlanSelected={handlePlanSelected}
                previousPaymentType={selectedPlan?.paymentType as '12months' | '24months' | '36months' | undefined}
                previousVoluntaryExcess={selectedPlan?.pricingData?.voluntaryExcess}
                previousClaimLimit={selectedPlan?.pricingData?.claimLimit}
                previousSelectedAddOns={selectedPlan?.pricingData?.selectedAddOns}
                previousProtectionAddOns={selectedPlan?.pricingData?.protectionAddOns}
              />
            </PerformanceOptimizedSuspense>
          ) : (
            <div className="w-full px-4 py-8">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vehicle Details Required
                </h2>
                <p className="text-gray-600">
                  To view our warranty plans, we need your vehicle details first.
                </p>
                <Button 
                  onClick={() => handleStepChange(1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Enter Vehicle Details
                </Button>
              </div>
            </div>
          )}
        </div>
      )}


      {currentStep === 4 && (
        <div className="bg-[#e8f4fb]">
          {vehicleData && selectedPlan ? (
            <PerformanceOptimizedSuspense height="60vh">
              <CustomerDetailsStep
                vehicleData={{
                  ...vehicleData,
                  make: vehicleData.make || 'Unknown'
                }}
                planId={selectedPlan.id}
                paymentType={selectedPlan.paymentType}
                planName={selectedPlan.name}
                pricingData={{
                  basePrice: selectedPlan.pricingData.totalPrice || 0,
                  totalPrice: selectedPlan.pricingData.totalPrice || 0,
                  ...selectedPlan.pricingData
                }}
                onNext={handleCustomerDetailsComplete}
                onBack={() => handleBackToStep(3)}
              />
            </PerformanceOptimizedSuspense>
          ) : (
            <RecoveryFallback 
              onRecovered={(recoveredVehicleData, recoveredSelectedPlan) => {
                setVehicleData(recoveredVehicleData);
                setSelectedPlan(recoveredSelectedPlan);
              }}
              onStartOver={() => handleStepChange(1)}
            />
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

      {/* Back Navigation Confirmation Dialog */}
      <BackNavigationConfirmDialog
        open={showBackConfirmDialog}
        onStay={() => {
          setShowBackConfirmDialog(false);
          stay();
        }}
        onLeave={() => {
          setShowBackConfirmDialog(false);
          allowLeave();
        }}
        journeyName="warranty journey"
      />
    </div>
  );
};

export default Index;
