
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import { CarDrivingSpinner } from '@/components/ui/car-driving-spinner';
import { TrophySpinner } from '@/components/ui/trophy-spinner';
import { SEOHead } from '@/components/SEOHead';
import { ArrowRight, Check, Shield, Star, Users, Clock } from 'lucide-react';
import pandaCelebratingOrangeCar from '@/assets/panda-celebrating-orange-car.png';
import { trackPurchaseComplete, trackButtonClick } from '@/utils/analytics';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const paymentType = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const source = searchParams.get('source');
  const [isProcessing, setIsProcessing] = useState(true);
  const [policyNumber, setPolicyNumber] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate 24-hour expiry time
  useEffect(() => {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const processPayment = async () => {
      // For Bumper payments, we get data from URL params
      if (source === 'bumper') {
        // Bumper flow already processed - just show success
        setIsProcessing(false);
        
        // Extract policy number if available
        const policyNum = searchParams.get('policy_number') || searchParams.get('warranty_number');
        if (policyNum) {
          setPolicyNumber(policyNum);
          toast.success('Your warranty policy has been created successfully!');
        }
        
        // Track purchase
        const email = searchParams.get('email');
        const finalAmountStr = searchParams.get('final_amount');
        if (finalAmountStr && sessionId) {
          trackPurchaseComplete(
            parseFloat(finalAmountStr),
            sessionId,
            {
              email: email || undefined,
              phone: searchParams.get('mobile') || undefined,
              firstName: searchParams.get('first_name') || undefined,
              lastName: searchParams.get('last_name') || undefined,
              address: searchParams.get('street') || undefined
            }
          );
        }
        
        return;
      }
      
      // For Stripe payments, we need the session ID
      if (!sessionId) {
        console.error('Missing Stripe session ID', { sessionId, source });
        toast.error('Missing payment session information');
        setIsProcessing(false);
        return;
      }

      try {
        // Process Stripe payment - the edge function will get plan/payment type from session metadata
        console.log('Processing Stripe payment...', { sessionId });
        
        const result = await supabase.functions.invoke('process-stripe-success', {
          body: {
            sessionId
          }
        });
        
        const data = result.data;
        const error = result.error;

        if (error) {
          console.error('Payment processing error:', error);
          toast.error('Error processing payment');
        } else {
          console.log('Payment processed successfully:', data);
          // Check both top-level policyNumber and nested data.policyNumber
          const warrantyNumber = data?.policyNumber || data?.data?.policyNumber;
          if (warrantyNumber) {
            setPolicyNumber(warrantyNumber);
          }
          toast.success('Your warranty policy has been created successfully!');
          
          // Track Google Ads purchase conversion with enhanced data
          const transactionId = data?.policyNumber || sessionId || `ORDER_${Date.now()}`;
          const finalAmount = searchParams.get('final_amount') 
            ? parseFloat(searchParams.get('final_amount')!) 
            : data?.amount || 0;
          
          trackPurchaseComplete(
            finalAmount,
            transactionId,
            {
              email: searchParams.get('email') || data?.customerEmail,
              phone: searchParams.get('mobile') || data?.customerPhone,
              firstName: searchParams.get('first_name') || data?.firstName,
              lastName: searchParams.get('last_name') || data?.lastName,
              address: searchParams.get('street') || data?.address
            }
          );
          
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

    // Trigger elegant confetti animation on load (5 seconds like Canva)
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 20, 
      spread: 360, 
      ticks: 80, 
      zIndex: 0,
      scalar: 1.8,
      gravity: 0.5,
      drift: 0,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 30 * (timeLeft / duration);
      
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
    }, 300);

    return () => clearInterval(interval);
  }, [sessionId, plan, paymentType, source]);

  const handleGetSecondWarranty = () => {
    // Track CTA click
    trackButtonClick('second_warranty_cta', {
      page: 'thank_you',
      discount: '10%'
    });
    
    // Set the localStorage flag for the 10% discount
    localStorage.setItem('addAnotherWarrantyDiscount', 'true');
    
    const url = new URL(window.location.origin);
    url.searchParams.set('step', '1');
    window.location.href = url.toString();
  };

  const handleReturnHome = () => {
    trackButtonClick('return_home', { page: 'thank_you' });
    window.location.href = 'https://www.buyawarranty.co.uk';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 min-h-screen">
      <SEOHead 
        title="You're All Set! | Warranty Purchase Complete"
        description="Your car warranty is active and ready to protect you. Access your policy documents and explore additional coverage options."
        keywords="warranty purchase complete, policy confirmation, car warranty active"
      />
      
      {/* Trustpilot header */}
      <div className="w-full px-4 pt-4 pb-2">
        <div className="max-w-5xl mx-auto">
          <TrustpilotHeader />
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            🎉 You're All Set – and Covered!
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Your warranty is active. We've sent your plan details to your inbox.
          </p>
          
          {isProcessing ? (
            <div className="mt-6 space-y-3">
              <TrophySpinner />
              <p className="text-gray-600">Processing your warranty registration...</p>
            </div>
          ) : policyNumber && (
            <div className="mt-6 inline-block bg-green-50 border-2 border-green-500 rounded-lg px-6 py-4">
              <p className="text-sm text-green-700 font-medium mb-1">
                {source === 'bumper' ? 'BAW Policy Number' : 'Policy Number'}
              </p>
              <p className="text-2xl font-bold text-green-900 font-mono">{policyNumber}</p>
            </div>
          )}
        </div>

        {/* Image - Max 30-35% vertical space */}
        <div className="flex justify-center mb-8">
          <img 
            src={pandaCelebratingOrangeCar}
            alt="Celebrating panda with orange car" 
            className="w-full max-w-md h-auto object-contain"
            style={{ maxHeight: '35vh' }}
          />
        </div>

        {/* Check if redirecting to second warranty */}
        {searchParams.get('addAnotherWarranty') === 'true' ? (
          <div className="text-center mb-8">
            <Card className="bg-orange-50 border-2 border-orange-500">
              <CardContent className="p-6">
                <p className="text-orange-900 font-bold text-xl mb-2">
                  🎉 Redirecting you to add your next vehicle
                </p>
                <p className="text-orange-800 text-lg mb-4">
                  with 10% discount applied!
                </p>
                <CarDrivingSpinner />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Second Purchase Offer */}
            <Card className="mb-8 border-2 border-blue-500 shadow-lg">
              <CardContent className="p-6 md:p-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  🚗 Got Another Vehicle?
                </h2>
                <p className="text-lg text-gray-700 mb-3">
                  Get <span className="font-bold text-orange-600">10% off</span> a second warranty – valid for 24 hours!
                </p>
                <p className="text-orange-600 font-semibold mb-6 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {timeRemaining && timeRemaining !== 'Expired' 
                    ? `Offer expires in ${timeRemaining}` 
                    : 'Limited time offer'}
                </p>
                <Button
                  onClick={handleGetSecondWarranty}
                  size="lg"
                  className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Get 10% off a 2nd warranty
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Trust Section */}
            <Card className="mb-8 bg-white shadow-md">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                  🔒 Why Choose Us Again?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Trusted by thousands</p>
                      <p className="text-sm text-gray-600">Join our community of satisfied customers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">UK-based support</p>
                      <p className="text-sm text-gray-600">Expert help when you need it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">No hidden fees</p>
                      <p className="text-sm text-gray-600">Transparent pricing, always</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Rated ★★★★★</p>
                      <p className="text-sm text-gray-600">Excellent customer reviews</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center">
              <Button
                onClick={handleReturnHome}
                variant="outline"
                size="lg"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                🔁 Return to Buy-A-Warranty.co.uk
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThankYou;
