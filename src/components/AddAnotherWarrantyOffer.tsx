import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface AddAnotherWarrantyOfferProps {
  onAddAnotherWarranty: () => void;
}

const AddAnotherWarrantyOffer: React.FC<AddAnotherWarrantyOfferProps> = ({ onAddAnotherWarranty }) => {
  return (
    <Card className="border border-gray-200 bg-gray-50 mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          10% off a 2nd Vehicle Today after checkout
        </h3>
        
        <Button
          onClick={onAddAnotherWarranty}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Warranty
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddAnotherWarrantyOffer;