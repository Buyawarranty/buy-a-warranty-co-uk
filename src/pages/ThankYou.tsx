
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import { CarDrivingSpinner } from '@/components/ui/car-driving-spinner';
import { TrophySpinner } from '@/components/ui/trophy-spinner';

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
            // Redirect to step 1 with 10% discount after a short delay
            setTimeout(() => {
              const url = new URL(window.location.origin);
              url.searchParams.set('step', '1');
              url.searchParams.set('discount', '10');
              url.searchParams.set('discountMessage', 'Your 10% discount has been applied! Add your next vehicle warranty now.');
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
      {/* Trustpilot header */}
      <div className="w-full px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          <TrustpilotHeader />
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
                alt="BuyAWarranty Logo" 
                className="h-16 w-auto"
              />
            </div>
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thanks for your purchase!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
            Your warranty is successfully registered
          </h2>
          
          {isProcessing ? (
            <div className="space-y-4">
              <TrophySpinner />
              <h3 className="text-lg text-gray-600">
                Processing your warranty registration...
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-4">
                Check your inbox for your plan details and terms & conditions.
              </h3>
              {policyNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-green-800 font-semibold">
                    {source === 'bumper' ? 'BAW Policy Number:' : 'Policy Number:'}
                  </p>
                  <p className="text-lg text-green-900 font-mono">{policyNumber}</p>
                </div>
              )}
            </div>
          )}
          
          {paymentType && !isProcessing && (
            <p className="text-base text-gray-500">
              {paymentType === 'monthly' && 'Monthly billing cycle activated'}
              {paymentType === 'yearly' && 'Annual billing cycle activated'}
              {paymentType === 'two_yearly' && '2-year billing cycle activated'}
              {paymentType === 'three_yearly' && '3-year billing cycle activated'}
            </p>
          )}
        </div>
        
          <div className="space-y-6">
            {searchParams.get('addAnotherWarranty') === 'true' ? (
              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <p className="text-blue-800 font-bold text-xl mb-2">
                    🎉 Redirecting you to add your next vehicle
                  </p>
                  <p className="text-blue-700 font-semibold text-lg">
                    with 10% discount applied!
                  </p>
                </div>
                <CarDrivingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Add Another Warranty Offer */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🚗💚</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Got Another Vehicle?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Save <span className="font-bold text-green-600">10% instantly</span> on your next warranty!
                  </p>
                  <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Limited time offer:</p>
                    <p className="font-semibold text-green-700">
                      🎯 10% OFF • 🚀 Instant Savings • ⏰ Available Now
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const url = new URL(window.location.origin);
                      url.searchParams.set('step', '1');
                      url.searchParams.set('discount', '10');
                      url.searchParams.set('discountMessage', 'Your 10% discount has been applied! Add your next vehicle warranty now.');
                      window.location.href = url.toString();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold mr-4 mb-2"
                  >
                    ✨ Add Another Warranty (10% OFF)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Discount automatically applied at checkout
                  </p>
                </div>
                
                <Button 
                  onClick={handleReturnHome}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
                >
                  Return to BuyAWarranty.co.uk
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
