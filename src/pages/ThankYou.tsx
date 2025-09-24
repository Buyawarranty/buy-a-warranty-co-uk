
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import { CarDrivingSpinner } from '@/components/ui/car-driving-spinner';
import { TrophySpinner } from '@/components/ui/trophy-spinner';
import { SEOHead } from '@/components/SEOHead';
import bawLogo from '@/assets/baw-logo-new-2025.png';
import pandaFamilySuccess from '@/assets/panda-family-success.png';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const paymentType = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const source = searchParams.get('source');
  const [isProcessing, setIsProcessing] = useState(true);
  const [policyNumber, setPolicyNumber] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      if (!plan || !paymentType) {
        toast.error('Missing payment information');
        setIsProcessing(false);
        return;
      }

      try {
        let data, error;
        
        // Check if this is a Bumper payment (has source=bumper in URL)
        if (source === 'bumper') {
          console.log('🔄 Processing Bumper payment...', { plan, paymentType, sessionId });
          console.log('📋 All URL params:', Object.fromEntries(searchParams.entries()));
          
          // Log all customer data being extracted
          console.log('👤 Extracting customer data from URL...');
          
          // Extract customer and vehicle data from URL parameters
          const customerData = {
            first_name: searchParams.get('first_name') || undefined,
            last_name: searchParams.get('last_name') || undefined,
            email: searchParams.get('email') || undefined,
            mobile: searchParams.get('mobile') || undefined,
            street: searchParams.get('street') || undefined,
            town: searchParams.get('town') || undefined,
            postcode: searchParams.get('postcode') || undefined,
            vehicle_reg: searchParams.get('vehicle_reg') || undefined
          };
          
          const vehicleData = {
            regNumber: searchParams.get('vehicle_reg') || undefined,
            make: searchParams.get('vehicle_make') || undefined,
            model: searchParams.get('vehicle_model') || undefined,
            year: searchParams.get('vehicle_year') || undefined,
            mileage: searchParams.get('mileage') || undefined
          };
          
          console.log('📞 Calling process-bumper-success function with data:', {
            planId: plan,
            paymentType,
            customerData,
            vehicleData,
            sessionId: sessionId || `BUMPER_${Date.now()}`,
            discountCode: searchParams.get('discount_code'),
            discountAmount: searchParams.get('discount_amount') ? parseFloat(searchParams.get('discount_amount')!) : 0,
            originalAmount: searchParams.get('original_amount') ? parseFloat(searchParams.get('original_amount')!) : null,
            finalAmount: searchParams.get('final_amount') ? parseFloat(searchParams.get('final_amount')!) : null
          });
          
          const result = await supabase.functions.invoke('process-bumper-success', {
            body: {
              planId: plan,
              paymentType,
              customerData,
              vehicleData,
              sessionId: sessionId || `BUMPER_${Date.now()}`,
              discountCode: searchParams.get('discount_code'),
              discountAmount: searchParams.get('discount_amount') ? parseFloat(searchParams.get('discount_amount')!) : 0,
              originalAmount: searchParams.get('original_amount') ? parseFloat(searchParams.get('original_amount')!) : null,
              finalAmount: searchParams.get('final_amount') ? parseFloat(searchParams.get('final_amount')!) : null
            }
          });
          console.log('📤 Function call result:', { data: result.data, error: result.error });
          data = result.data;
          error = result.error;
        } else if (sessionId) {
          // Process Stripe payment
          console.log('Processing Stripe payment...', { sessionId, plan, paymentType });
          
          const result = await supabase.functions.invoke('process-stripe-success', {
            body: {
              sessionId,
              planId: plan,
              paymentType
            }
          });
          data = result.data;
          error = result.error;
        } else {
          throw new Error('Missing payment session information');
        }

        if (error) {
          console.error('Payment processing error:', error);
          toast.error('Error processing payment');
        } else {
          console.log('Payment processed successfully:', data);
          if (data?.policyNumber) {
            setPolicyNumber(data.policyNumber);
          }
          toast.success('Your warranty policy has been created successfully!');
          
          // Check if user enabled "Add Another Warranty" during checkout
          const addAnotherWarranty = searchParams.get('addAnotherWarranty');
          if (addAnotherWarranty === 'true') {
            // Set the localStorage flag for the 10% discount ONLY when user actively clicked the component
            localStorage.setItem('addAnotherWarrantyDiscount', 'true');
            
            // Redirect to step 1 after a short delay
            setTimeout(() => {
              const url = new URL(window.location.origin);
              url.searchParams.set('step', '1');
              window.location.href = url.toString();
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Payment processing failed:', error);
        toast.error('Failed to process payment');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();

    // Trigger confetti animation on load
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 0,
      scalar: 2.5, // Make confetti pieces much larger
      gravity: 0.6,
      drift: 0.1,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'] // Vibrant colors
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [sessionId, plan, paymentType, source]);

  const handleReturnHome = () => {
    window.location.href = 'https://www.buyawarranty.co.uk';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-orange-50 min-h-screen flex flex-col">
      <SEOHead 
        title="Thank You! | Warranty Purchase Complete"
        description="Your car warranty purchase is complete! Access your policy documents and manage your coverage through your customer dashboard."
        keywords="warranty purchase complete, policy confirmation, warranty documents"
      />
      {/* Trustpilot header */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <TrustpilotHeader />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left column - Main content */}
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="flex justify-center mb-4">
                  <img 
                    src={bawLogo}
                    alt="BuyAWarranty Logo" 
                    className="h-10 sm:h-12 w-auto"
                  />
                </div>
                <div className="text-4xl mb-3">🎉</div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Thanks for your purchase!
                </h1>
                <h2 className="text-lg md:text-xl font-semibold text-blue-600 mb-4">
                  Your warranty is successfully registered
                </h2>
                
                {isProcessing ? (
                  <div className="space-y-3">
                    <TrophySpinner />
                    <h3 className="text-base text-gray-600">
                      Processing your warranty registration...
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-base text-gray-600 max-w-md mx-auto leading-relaxed mb-3">
                      Check your inbox for your plan details and terms & conditions.
                    </h3>
                    {policyNumber && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto">
                        <p className="text-sm text-green-800 font-semibold">
                          {source === 'bumper' ? 'BAW Policy Number:' : 'Policy Number:'}
                        </p>
                        <p className="text-base text-green-900 font-mono">{policyNumber}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {paymentType && !isProcessing && (
                  <p className="text-sm text-gray-500">
                    {paymentType === 'monthly' && 'Monthly billing cycle activated'}
                    {paymentType === 'yearly' && 'Annual billing cycle activated'}
                    {paymentType === 'two_yearly' && '2-year billing cycle activated'}
                    {paymentType === 'three_yearly' && '3-year billing cycle activated'}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                {searchParams.get('addAnotherWarranty') === 'true' ? (
                  <div className="text-center">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                      <p className="text-orange-800 font-bold text-lg mb-1">
                        🎉 Redirecting you to add your next vehicle
                      </p>
                      <p className="text-orange-700 font-semibold text-base">
                        with 10% discount applied!
                      </p>
                    </div>
                    <CarDrivingSpinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Professional CTA Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Need coverage for another vehicle?
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Protect your other vehicles with the same comprehensive warranty coverage.
                      </p>
                      <Button
                        onClick={() => {
                          // Set the localStorage flag for the 10% discount on next warranty
                          localStorage.setItem('addAnotherWarrantyDiscount', 'true');
                          
                          const url = new URL(window.location.origin);
                          url.searchParams.set('step', '1');
                          window.location.href = url.toString();
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 text-sm font-medium rounded-lg mb-3"
                      >
                        Get Quote for Another Vehicle
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleReturnHome}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 text-sm font-medium"
                    >
                      Return to BuyAWarranty.co.uk
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column - Car image */}
            <div className="hidden md:flex justify-center items-center">
              <img 
                src={pandaFamilySuccess}
                alt="Happy family loading luggage with panda mascot" 
                className="w-full max-w-48 h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
