
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentFallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const plan = searchParams.get('plan');
  const email = searchParams.get('email');

  const handleStripeCheckout = async () => {
    setLoading(true);
    
    try {
      console.log('=== FALLBACK TO STRIPE CHECKOUT ===');
      console.log('Plan:', plan);
      console.log('Email:', email);
      
      const vehicleData = {
        email: email || 'guest@buyawarranty.com',
        regNumber: searchParams.get('reg') || '',
        mileage: searchParams.get('mileage') || '',
        fullName: searchParams.get('name') || '',
        phone: searchParams.get('phone') || '',
        address: searchParams.get('address') || ''
      };

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan,
          paymentType: 'monthly',
          vehicleData: vehicleData
        }
      });

      console.log('=== STRIPE FALLBACK RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Stripe fallback error:', error);
        toast.error('Failed to create payment session: ' + error.message);
        return;
      }

      if (data?.url) {
        console.log('=== REDIRECTING TO STRIPE FALLBACK ===');
        console.log('Checkout URL:', data.url);
        
        setTimeout(() => {
          window.location.href = data.url;
        }, 100);
      } else {
        console.error('No checkout URL received:', data);
        toast.error('No payment URL received');
      }
    } catch (error) {
      console.error('Error creating fallback payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e8f4fb] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Alternative Payment Required
          </h1>
          <p className="text-gray-600 mb-6">
            We're unable to process your monthly payment with our preferred method. 
            Please continue with our secure alternative payment option.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleStripeCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? 'Processing...' : 'Continue to Secure Payment'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your payment will be processed securely. All personal information is encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFallback;
