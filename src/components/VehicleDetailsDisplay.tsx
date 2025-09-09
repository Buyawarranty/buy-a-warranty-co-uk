import React from 'react';
import { Badge } from '@/components/ui/badge';

interface VehicleDetailsDisplayProps {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  registrationPlate?: string;
  mileage?: string;
  planType?: string;
}

export const VehicleDetailsDisplay: React.FC<VehicleDetailsDisplayProps> = ({
  vehicleMake,
  vehicleModel,
  vehicleYear,
  registrationPlate,
  mileage,
  planType
}) => {
  const getCoverageStatus = (coverageType: string): boolean => {
    const lowerPlanType = planType?.toLowerCase() || '';
    
    switch (coverageType) {
      case 'motFee':
      case 'wearTear':
        return lowerPlanType.includes('platinum') || lowerPlanType.includes('gold');
      case 'tyreCover':
      case 'europeCover':
        return lowerPlanType.includes('platinum');
      case 'transferCover':
        return true; // Available for all plans
      default:
        return false;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Vehicle:</span>
        <span className="text-sm text-gray-900">
          {vehicleMake} {vehicleModel} ({vehicleYear})
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Registration:</span>
        <span className="text-sm text-gray-900 font-mono bg-yellow-400 px-2 py-1 rounded border-2 border-black">
          {registrationPlate}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Mileage:</span>
        <span className="text-sm text-gray-900">{mileage || 'N/A'}</span>
      </div>
      
      {/* Coverage Information */}
      <div className="border-t pt-3 mt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Coverage Details</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">MOT Fee:</span>
            <Badge variant={getCoverageStatus('motFee') ? 'default' : 'secondary'} className="text-xs">
              {getCoverageStatus('motFee') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tyre Cover:</span>
            <Badge variant={getCoverageStatus('tyreCover') ? 'default' : 'secondary'} className="text-xs">
              {getCoverageStatus('tyreCover') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Wear & Tear:</span>
            <Badge variant={getCoverageStatus('wearTear') ? 'default' : 'secondary'} className="text-xs">
              {getCoverageStatus('wearTear') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Europe Cover:</span>
            <Badge variant={getCoverageStatus('europeCover') ? 'default' : 'secondary'} className="text-xs">
              {getCoverageStatus('europeCover') ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between col-span-2">
            <span className="text-gray-600">Transfer Cover:</span>
            <Badge variant="default" className="text-xs">Yes</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};