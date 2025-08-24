import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Star, Shield, Clock, Award } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface PricingData {
  totalPrice: number;
  monthlyPrice: number;
  voluntaryExcess: number;
  selectedAddOns: {[addon: string]: boolean};
}

interface PricingTableBProps {
  vehicleData: any;
  onPlanSelected: (planId: string, paymentType: string, planName?: string, pricingData?: PricingData) => void;
  onBack: () => void;
  selectedPlan?: string;
  initialPricingData?: PricingData;
}

const PricingTableB: React.FC<PricingTableBProps> = ({
  vehicleData,
  onPlanSelected,
  onBack,
  selectedPlan,
  initialPricingData
}) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateFullPrice = (monthlyPrice: number) => {
    const fullPrice = monthlyPrice * 12;
    const discountedPrice = fullPrice * 0.95; // 5% discount
    return {
      fullPrice,
      discountedPrice,
      savings: fullPrice - discountedPrice
    };
  };

  useEffect(() => {
    // Simulate API call for pricing data
    const fetchPlans = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockPlans = [
          {
            id: 'basic',
            name: 'Essential Cover',
            monthlyPrice: 29.99,
            features: ['Engine Protection', 'Gearbox Cover', '24/7 Breakdown', 'UK Wide Coverage'],
            popular: false,
            color: 'from-gray-500 to-gray-600'
          },
          {
            id: 'standard',
            name: 'Comprehensive Cover',
            monthlyPrice: 45.99,
            features: ['Everything in Essential', 'Air Con & Heating', 'Electrical Components', 'Suspension Cover', 'Recovery Service'],
            popular: true,
            color: 'from-blue-600 to-purple-600'
          },
          {
            id: 'premium',
            name: 'Ultimate Protection',
            monthlyPrice: 69.99,
            features: ['Everything in Comprehensive', 'Wear & Tear Items', 'High Tech Components', 'Courtesy Car', 'European Cover'],
            popular: false,
            color: 'from-emerald-600 to-teal-600'
          }
        ];
        setPlans(mockPlans);
      } catch (error) {
        toast({
          title: "Error loading plans",
          description: "Please try again later",
          variant: "destructive"
        });
      }
      setLoading(false);
    };

    fetchPlans();
  }, [vehicleData, toast]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section - Variant B */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
            <Award className="w-4 h-4 mr-1" />
            Instant Approval
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
            <Shield className="w-4 h-4 mr-1" />
            5★ Rated Service
          </Badge>
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
          Choose Your Perfect Coverage
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-xl text-gray-600 mb-4">
            Tailored warranty options for your {vehicleData?.make} {vehicleData?.model}
          </p>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Instant Quote</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>No Hidden Fees</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>5% Discount Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Enhanced Variant B Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {plans.map((plan, index) => {
          const priceInfo = calculateFullPrice(plan.monthlyPrice);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-xl scale-105' 
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 inline mr-1" />
                  MOST POPULAR
                </div>
              )}
              
              <CardHeader className={`text-center pb-4 ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </CardTitle>
                
                {/* Enhanced Pricing Display */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      £{plan.monthlyPrice}
                      <span className="text-lg font-normal text-gray-500">/month</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      12 months minimum term
                    </div>
                  </div>
                  
                  {/* Full Payment Option with Highlight */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Save 5% • Pay in Full
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-green-700">
                          £{priceInfo.discountedPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          was £{priceInfo.fullPrice.toFixed(2)}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          You save £{priceInfo.savings.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => onPlanSelected(plan.id, 'monthly', plan.name, {
                      totalPrice: priceInfo.fullPrice,
                      monthlyPrice: plan.monthlyPrice,
                      voluntaryExcess: 150,
                      selectedAddOns: {}
                    })}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    Pay Monthly - £{plan.monthlyPrice}
                  </Button>
                  
                  <Button
                    onClick={() => onPlanSelected(plan.id, 'full', plan.name, {
                      totalPrice: priceInfo.discountedPrice,
                      monthlyPrice: plan.monthlyPrice,
                      voluntaryExcess: 150,
                      selectedAddOns: {}
                    })}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-200"
                  >
                    Pay Full Amount - £{priceInfo.discountedPrice.toFixed(2)}
                    <Badge className="ml-2 bg-white/20 text-white border-0">
                      SAVE 5%
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Indicators - Variant B */}
      <div className="text-center py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Protected by Warranty</h3>
            <p className="text-sm text-gray-600">Full coverage backed by leading insurers</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Instant Approval</h3>
            <p className="text-sm text-gray-600">Get covered in under 5 minutes</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">5★ Service</h3>
            <p className="text-sm text-gray-600">Rated excellent by 10,000+ customers</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl"
        >
          Back to Vehicle Details
        </Button>
      </div>
    </div>
  );
};

export default PricingTableB;