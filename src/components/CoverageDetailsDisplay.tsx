import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface CoverageDetailsProps {
  mot_fee?: boolean;
  tyre_cover?: boolean;
  wear_tear?: boolean;
  europe_cover?: boolean;
  transfer_cover?: boolean;
}

const CoverageDetailsDisplay: React.FC<CoverageDetailsProps> = ({
  mot_fee,
  tyre_cover,
  wear_tear,
  europe_cover,
  transfer_cover
}) => {
  const coverageItems = [
    { label: 'MOT Fee Coverage', value: mot_fee, icon: '🔧' },
    { label: 'Tyre Cover', value: tyre_cover, icon: '🛞' },
    { label: 'Wear & Tear', value: wear_tear, icon: '🛠️' },
    { label: 'Europe Cover', value: europe_cover, icon: '🇪🇺' },
    { label: 'Transfer Cover', value: transfer_cover, icon: '🔁' }
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Coverage Details</h4>
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