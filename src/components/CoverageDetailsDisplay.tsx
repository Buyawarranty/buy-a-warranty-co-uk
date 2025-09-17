import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface CoverageDetailsProps {
  mot_fee?: boolean;
  tyre_cover?: boolean;
  wear_tear?: boolean;
  europe_cover?: boolean;
  transfer_cover?: boolean;
  breakdown_recovery?: boolean;
  vehicle_rental?: boolean;
  mot_repair?: boolean;
  lost_key?: boolean;
  consequential?: boolean;
  claim_limit?: number;
}

const CoverageDetailsDisplay: React.FC<CoverageDetailsProps> = ({
  mot_fee,
  tyre_cover,
  wear_tear,
  europe_cover,
  transfer_cover,
  breakdown_recovery,
  vehicle_rental,
  mot_repair,
  lost_key,
  consequential,
  claim_limit
}) => {
  const coverageItems = [
    { label: 'MOT Fee Coverage', value: mot_fee, icon: '🔧' },
    { label: 'Tyre Cover', value: tyre_cover, icon: '🛞' },
    { label: 'Wear & Tear', value: wear_tear, icon: '🛠️' },
    { label: 'Europe Cover', value: europe_cover, icon: '🇪🇺' },
    { label: 'Transfer Cover', value: transfer_cover, icon: '🔁' },
    { label: 'Breakdown Recovery', value: breakdown_recovery, icon: '🚗' },
    { label: 'Vehicle Rental', value: vehicle_rental, icon: '🚙' },
    { label: 'MOT Repair', value: mot_repair, icon: '🔧' },
    { label: 'Lost Key Cover', value: lost_key, icon: '🗝️' },
    { label: 'Consequential Loss', value: consequential, icon: '⚠️' }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Coverage Details</h4>
      {claim_limit && (
        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-orange-800">Claim Limit</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              £{claim_limit.toLocaleString()}
            </Badge>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {coverageItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <span className="text-sm flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <div className="flex items-center gap-1">
              {item.value ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary" className="text-xs">Y</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="outline" className="text-xs">N</Badge>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoverageDetailsDisplay;