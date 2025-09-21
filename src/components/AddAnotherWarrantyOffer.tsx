import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check } from 'lucide-react';

interface AddAnotherWarrantyOfferProps {
  onAddAnotherWarranty: () => void;
}

const AddAnotherWarrantyOffer: React.FC<AddAnotherWarrantyOfferProps> = ({ onAddAnotherWarranty }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission or page jumping
    e.stopPropagation(); // Stop event bubbling
    
    if (!isSelected) {
      setIsSelected(true);
      onAddAnotherWarranty();
    }
  };

  return (
    <Card className="border border-gray-200 bg-gray-50 mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          10% off a 2nd Vehicle Today after checkout
        </h3>
        
        <Button
          type="button"
          onClick={handleClick}
          className={isSelected 
            ? "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4" 
            : "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4"
          }
          disabled={isSelected}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Selected for after checkout
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Another Warranty
            </>
          )}
        </Button>
        
        {isSelected && (
          <p className="text-sm text-gray-600 mt-2">
            ✓ You'll get 10% off your next warranty after completing this purchase
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AddAnotherWarrantyOffer;