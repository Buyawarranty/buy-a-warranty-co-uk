import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calculator, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ReliabilityData {
  reliability_score: number;
  tier: number;
  tier_label: string;
  pricing: {
    "12M": number;
    "24M": number;
    "36M": number;
  };
  calculation_details: {
    failure_rate: number;
    critical_failures: number;
    mileage_factor: number;
    total_tests: number;
    failed_tests: number;
    vehicle_age_years: number;
  };
}

interface VehicleInfo {
  registration: string;
  make?: string;
  model?: string;
  age_years: number;
}

interface VehicleReliabilityScoreProps {
  registrationNumber?: string;
  onPricingUpdate?: (pricing: { "12M": number; "24M": number; "36M": number }) => void;
}

export const VehicleReliabilityScore: React.FC<VehicleReliabilityScoreProps> = ({ 
  registrationNumber, 
  onPricingUpdate 
}) => {
  const [reliabilityData, setReliabilityData] = useState<ReliabilityData | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const calculateReliability = async () => {
    if (!registrationNumber) {
      toast.error('Registration number is required');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-vehicle-reliability', {
        body: { registration: registrationNumber }
      });

      if (error) throw error;

      if (data?.success) {
        setReliabilityData(data.data);
        setVehicleInfo(data.vehicle_info);
        
        // Call the pricing update callback if provided
        if (onPricingUpdate) {
          onPricingUpdate(data.data.pricing);
        }
        
        toast.success('Reliability score calculated successfully');
      } else {
        toast.error(data?.error || 'Failed to calculate reliability score');
      }
    } catch (error) {
      console.error('Error calculating reliability:', error);
      toast.error('Failed to calculate reliability score');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-green-400';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-blue-400';
      case 5: return 'bg-yellow-500';
      case 6: return 'bg-orange-500';
      case 7: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <TrendingUp className="w-5 h-5 text-blue-600" />;
    return <AlertCircle className="w-5 h-5 text-orange-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Vehicle Reliability Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reliabilityData ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Calculate reliability score and get tiered pricing for {registrationNumber}
            </p>
            <Button 
              onClick={calculateReliability} 
              disabled={loading || !registrationNumber}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Calculator className="w-4 h-4 animate-pulse" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Reliability Score
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vehicle Info */}
            {vehicleInfo && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Vehicle Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Registration:</span>
                    <span className="ml-2 font-mono">{vehicleInfo.registration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2">{vehicleInfo.age_years} years</span>
                  </div>
                  {vehicleInfo.make && (
                    <>
                      <div>
                        <span className="text-gray-500">Make:</span>
                        <span className="ml-2">{vehicleInfo.make}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Model:</span>
                        <span className="ml-2">{vehicleInfo.model}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reliability Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {getScoreIcon(reliabilityData.reliability_score)}
                <div className="text-4xl font-bold text-primary">
                  {reliabilityData.reliability_score}
                  <span className="text-lg text-gray-500">/100</span>
                </div>
              </div>
              
              <Progress 
                value={reliabilityData.reliability_score} 
                className="w-full mb-4"
              />
              
              <Badge 
                className={`${getTierColor(reliabilityData.tier)} text-white px-4 py-2 text-lg`}
              >
                Tier {reliabilityData.tier}: {reliabilityData.tier_label}
              </Badge>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    £{reliabilityData.pricing["12M"]}
                  </div>
                  <div className="text-sm text-gray-600">12 Month</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    £{reliabilityData.pricing["24M"]}
                  </div>
                  <div className="text-sm text-gray-600">24 Month</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-primary">
                    £{reliabilityData.pricing["36M"]}
                  </div>
                  <div className="text-sm text-gray-600">36 Month</div>
                </CardContent>
              </Card>
            </div>

            {/* Details Toggle */}
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Calculation Details
            </Button>

            {/* Calculation Details */}
            {showDetails && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-3 text-blue-900">Calculation Breakdown</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total MOT Tests:</span>
                    <span className="ml-2 font-medium">{reliabilityData.calculation_details.total_tests}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Failed Tests:</span>
                    <span className="ml-2 font-medium">{reliabilityData.calculation_details.failed_tests}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Failure Rate:</span>
                    <span className="ml-2 font-medium">{reliabilityData.calculation_details.failure_rate}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Critical Failures:</span>
                    <span className="ml-2 font-medium">{reliabilityData.calculation_details.critical_failures}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700">Average Mileage/Year:</span>
                    <span className="ml-2 font-medium">{reliabilityData.calculation_details.mileage_factor.toLocaleString()} miles</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border text-xs">
                  <div className="font-medium text-blue-900 mb-2">Formula Used:</div>
                  <div className="font-mono text-blue-800">
                    Score = 100 - (failure_rate × 0.4 + critical_failures × 5 + (mileage_factor / 1000) × 2)
                  </div>
                </div>
              </div>
            )}

            {/* Recalculate Button */}
            <Button 
              variant="outline" 
              onClick={calculateReliability} 
              disabled={loading}
              className="w-full"
            >
              Recalculate Score
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};