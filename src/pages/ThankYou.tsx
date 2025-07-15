
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  const paymentType = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const [isProcessing, setIsProcessing] = useState(true);
  const [policyNumber, setPolicyNumber] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId || !plan || !paymentType) {
        toast.error('Missing payment information');
        setIsProcessing(false);
        return;
      }

      try {
        console.log('Processing successful payment...', { sessionId, plan, paymentType });
        
        // Create an edge function to retrieve session details from Stripe and process the payment
        const { data, error } = await supabase.functions.invoke('process-stripe-success', {
          body: {
            sessionId,
            planId: plan,
            paymentType
          }
        });

        if (error) {
          console.error('Payment processing error:', error);
          toast.error('Error processing payment');
        } else {
          console.log('Payment processed successfully:', data);
          if (data?.policyNumber) {
            setPolicyNumber(data.policyNumber);
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
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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
  }, [sessionId, plan, paymentType]);

  const handleReturnHome = () => {
    window.location.href = 'https://www.buyawarranty.co.uk';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 2rem)' }}>
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
            Thank you!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
            Your {plan && plan.charAt(0).toUpperCase() + plan.slice(1)} warranty is now active
          </h2>
          
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg text-gray-600">
                Processing your warranty registration...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-4">
                You'll receive your confirmation and login details by email shortly. We've got you covered.
              </p>
              {policyNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-green-800 font-semibold">Policy Number:</p>
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
        
        <div className="space-y-4">
          <Button 
            onClick={handleReturnHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Return to BuyAWarranty.co.uk
          </Button>
          <div className="text-sm text-gray-500">
            Check your email for login details to access your customer dashboard
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
