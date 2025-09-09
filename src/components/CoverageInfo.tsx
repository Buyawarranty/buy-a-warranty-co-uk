import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CoverageInfoProps {
  planType?: string;
}

export const CoverageInfo: React.FC<CoverageInfoProps> = ({ planType }) => {
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">MOT Fee Coverage:</span>
        <Badge variant={getCoverageStatus('motFee') ? 'default' : 'secondary'} className="text-xs">
          {getCoverageStatus('motFee') ? 'Yes' : 'No'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Tyre Cover:</span>
        <Badge variant={getCoverageStatus('tyreCover') ? 'default' : 'secondary'} className="text-xs">
          {getCoverageStatus('tyreCover') ? 'Yes' : 'No'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Wear & Tear:</span>
        <Badge variant={getCoverageStatus('wearTear') ? 'default' : 'secondary'} className="text-xs">
          {getCoverageStatus('wearTear') ? 'Yes' : 'No'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Europe Cover:</span>
        <Badge variant={getCoverageStatus('europeCover') ? 'default' : 'secondary'} className="text-xs">
          {getCoverageStatus('europeCover') ? 'Yes' : 'No'}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Transfer Cover:</span>
        <Badge variant="default" className="text-xs">Yes</Badge>
      </div>
    </div>
  );
};