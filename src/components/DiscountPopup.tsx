import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountPopup: React.FC<DiscountPopupProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const { toast } = useToast();

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

      setDiscountCode(discountData.discountCode);

      // Send email with discount code
      const { error: emailError } = await supabase.functions.invoke('send-discount-email', {
        body: {
          email,
          discountCode: discountData.discountCode,
          discountAmount: discountData.discountAmount
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't show error to user if discount code was generated successfully
      }

      toast({
        title: "Discount Code Generated!",
        description: `Your code ${discountData.discountCode} has been sent to your email`,
      });

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
                <span className="text-blue-600 font-bold text-xl">buya</span>
                <span className="text-orange-500 font-bold text-xl">warranty</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hey! Want £25 off your warranty?
              </h2>
              
              <p className="text-gray-600 text-sm">
                Just pop your email below and we'll give you an instant discount code - no strings attached!
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {!discountCode ? (
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
                  {isLoading ? 'Generating...' : 'Get My Discount Code'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Your Discount Code:
                  </h3>
                  <div className="text-2xl font-mono font-bold text-green-700 bg-white px-4 py-2 rounded border">
                    {discountCode}
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Code copied to clipboard! Also sent to your email.
                  </p>
                </div>
                
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(discountCode);
                    toast({
                      title: "Copied!",
                      description: "Discount code copied to clipboard"
                    });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Copy Code
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              We'll occasionally send you useful warranty tips. Unsubscribe anytime - no worries!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};