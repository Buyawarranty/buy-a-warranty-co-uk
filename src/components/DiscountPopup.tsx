import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface DiscountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountPopup: React.FC<DiscountPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Trigger confetti when popup opens
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate discount code
      const { data: discountData, error: discountError } = await supabase.functions.invoke('auto-generate-discount', {
        body: { 
          customerEmail: email,
          orderAmount: 25 // £25 discount
        }
      });

      if (discountError) throw discountError;

      console.log('Discount response:', discountData);
      
      // The auto-generate-discount function returns the full discount object
      // Extract just the code string for display
      const codeString = discountData?.code || 'DISCOUNT25';

      setDiscountCode(codeString);
      setShowSuccess(true);

      // Trigger success confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#f97316', '#3b82f6']
      });

      // Send email with discount code
      const { error: emailError } = await supabase.functions.invoke('send-discount-email', {
        body: {
          email,
          discountCode: codeString,
          discountAmount: 25
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      } else {
        console.log('Discount email sent successfully');
      }

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error generating discount:', error);
      toast({
        title: "Error",
        description: "Failed to generate discount code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto bg-white rounded-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src="/lovable-uploads/d30b22f7-d176-417c-b227-abdfc0fd84cf.png" 
                  alt="BuyaWarranty" 
                  className="h-8 mx-auto"
                />
              </div>
              
              {!showSuccess ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Hey! Want £25 off your warranty?
                  </h2>
                  
                  <p className="text-gray-600 text-sm">
                    Just pop your email below and we'll give you an instant discount code - no strings attached!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">✅</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">
                    Discount code sent!
                  </h2>
                  
                  <p className="text-gray-600 text-sm">
                    Check your email for your £25 discount code. Use it at checkout to save money on your warranty!
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {!showSuccess && (
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-4 pr-4 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Get My Discount Code'}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We'll occasionally send you useful warranty tips. Unsubscribe anytime - no worries!
              </p>
            </div>
          )}

          {showSuccess && (
            <div className="px-6 pb-6 text-center">
              <p className="text-sm text-gray-500">
                This window will close automatically in a few seconds.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};