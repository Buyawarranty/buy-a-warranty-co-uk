import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

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
              <div className="text-2xl">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900">
                Exclusive 10% Discount — Limited Time!
              </h3>
            </div>
            
            <p className="text-gray-700 mb-3">
              Protect another vehicle now and save 10% on your entire order instantly.
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              This special offer expires at checkout — secure your savings today!
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
          <div className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSuccess(false);
                setIsClicked(false);
              }}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div className="text-4xl mb-4">✅</div>
            <div className="text-green-700 font-semibold text-lg mb-2">
              Awesome! Your 10% discount is live.
            </div>
            <div className="text-green-600 font-medium mb-4">
              Complete your purchase now and<br />
              - add your other vehicle right after.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddAnotherWarrantyOffer;