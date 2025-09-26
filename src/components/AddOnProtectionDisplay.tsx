import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { getAutoIncludedAddOns } from '@/lib/addOnsUtils';

interface AddOnProtectionDisplayProps {
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
  voluntary_excess?: number;
  payment_type?: string;
  className?: string;
}

const AddOnProtectionDisplay: React.FC<AddOnProtectionDisplayProps> = ({
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
  claim_limit,
  voluntary_excess,
  payment_type = '12months',
  className = ''
}) => {
  // Get auto-included add-ons based on payment type
  const autoIncludedAddOnKeys = getAutoIncludedAddOns(payment_type);
  
  const addOnItems = [
    { 
      key: 'mot_fee', 
      label: 'MOT Test Fee Cover', 
      value: mot_fee, 
      icon: '🔧',
      description: 'Covers the cost of MOT test fees'
    },
    { 
      key: 'tyre_cover', 
      label: 'Tyre & Alloy Cover', 
      value: tyre_cover, 
      icon: '🛞',
      description: 'Protection for tyres and alloy wheels'
    },
    { 
      key: 'wear_tear', 
      label: 'Wear & Tear Cover', 
      value: wear_tear, 
      icon: '🛠️',
      description: 'Covers general wear and tear components'
    },
    { 
      key: 'europe_cover', 
      label: 'European Breakdown Cover', 
      value: europe_cover, 
      icon: '🇪🇺',
      description: 'Breakdown assistance across Europe'
    },
    { 
      key: 'transfer_cover', 
      label: 'Warranty Transfer Cover', 
      value: transfer_cover, 
      icon: '🔁',
      description: 'Transfer warranty to new owner'
    },
    { 
      key: 'breakdown_recovery', 
      label: 'Vehicle Recovery Service', 
      value: breakdown_recovery, 
      icon: '🚗',
      description: 'Recovery and roadside assistance'
    },
    { 
      key: 'vehicle_rental', 
      label: 'Hire Car Provision', 
      value: vehicle_rental, 
      icon: '🚙',
      description: 'Replacement vehicle during repairs'
    },
    { 
      key: 'mot_repair', 
      label: 'MOT Failure Repair Cover', 
      value: mot_repair, 
      icon: '🔧',
      description: 'Covers repairs needed for MOT failure'
    },
    { 
      key: 'lost_key', 
      label: 'Lost Key Cover', 
      value: lost_key, 
      icon: '🗝️',
      description: 'Replacement of lost or stolen keys'
    },
    { 
      key: 'consequential', 
      label: 'Consequential Loss Cover', 
      value: consequential, 
      icon: '⚠️',
      description: 'Additional costs from covered breakdowns'
    }
  ];

  // Separate active and inactive add-ons
  const activeAddOns = addOnItems.filter(item => item.value);
  const inactiveAddOns = addOnItems.filter(item => !item.value);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Add-On Protection Packages
        </CardTitle>
        <CardDescription>
          Coverage options selected and automatically included in this warranty
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Policy Limits */}
        {(claim_limit || voluntary_excess) && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Policy Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {claim_limit && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Maximum Claim Limit:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                    £{claim_limit.toLocaleString()}
                  </Badge>
                </div>
              )}
              {voluntary_excess && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Voluntary Excess:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                    £{voluntary_excess.toLocaleString()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Add-Ons */}
        {activeAddOns.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Protection ({activeAddOns.length})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {activeAddOns.map((item) => {
                const isAutoIncluded = autoIncludedAddOnKeys.includes(item.key);
                const statusLabel = isAutoIncluded ? 'FREE' : 'PAID';
                const statusColor = isAutoIncluded 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-blue-100 text-blue-800 border-blue-200';
                
                return (
                  <div 
                    key={item.key} 
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-green-900">{item.label}</div>
                        <div className="text-xs text-green-700 mt-1">{item.description}</div>
                      </div>
                    </div>
                    <Badge className={`text-xs font-semibold ${statusColor} border`}>
                      {statusLabel}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactive Add-Ons */}
        {inactiveAddOns.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Not Included ({inactiveAddOns.length})
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {inactiveAddOns.map((item) => (
                <div 
                  key={item.key} 
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md opacity-60"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg grayscale">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold text-gray-500 bg-gray-100">
                    NOT COVERED
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Add-Ons Message */}
        {activeAddOns.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No additional protection packages selected</p>
            <p className="text-xs text-gray-400 mt-1">Only standard warranty coverage applies</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddOnProtectionDisplay;