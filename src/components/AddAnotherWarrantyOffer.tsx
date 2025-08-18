import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check } from 'lucide-react';

interface AddAnotherWarrantyOfferProps {
  onAddAnotherWarranty: () => void;
}

const AddAnotherWarrantyOffer: React.FC<AddAnotherWarrantyOfferProps> = ({ onAddAnotherWarranty }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    if (isClicked || showSuccess) return;

    setIsClicked(true);
    
    // Show bounce animation and success message
    setTimeout(() => {
      setShowSuccess(true);
      onAddAnotherWarranty();
    }, 300);
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-orange-50 mb-6">
      <CardContent className="p-6">
        {!showSuccess ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🔥</div>
              <h3 className="text-xl font-bold text-gray-900">
                Save 10% Instantly — Today Only!
              </h3>
            </div>
            
            <p className="text-gray-700 mb-3">
              Add another warranty to your order and get an extra 10% off right away.
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Don't miss out — this exclusive deal disappears after checkout!
            </p>

            <Button
              onClick={handleClick}
              disabled={isClicked}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base transition-all duration-300 ${
                isClicked ? 'transform scale-95' : 'hover:scale-105'
              }`}
            >
              <Plus className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                isClicked ? 'rotate-45' : ''
              }`} />
              Add Another Warranty
            </Button>
          </>
        ) : (
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 animate-bounce`}>
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-green-700 font-semibold text-lg mb-2">
              Awesome! Your 10% discount is live.
            </div>
            <div className="text-green-600 font-medium mb-4 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Complete your purchase now and add your other vehicle right after.
            </div>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowSuccess(false);
                  setIsClicked(false);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Remove Warranty
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Keep Warranty
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddAnotherWarrantyOffer;