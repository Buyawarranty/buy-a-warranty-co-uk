import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Crown, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WarrantyDurationStepProps {
  vehicleData: any;
  planId: string;
  planName?: string;
  pricingData?: {
    totalPrice: number;
    monthlyPrice: number;
    voluntaryExcess: number;
    selectedAddOns: {[addon: string]: boolean};
    protectionAddOns?: {[key: string]: boolean};
    claimLimit?: number;
  };
  onNext: (paymentType: string) => void;
  onBack: () => void;
}

const WarrantyDurationStep: React.FC<WarrantyDurationStepProps> = ({
  vehicleData,
  planId,
  planName,
  pricingData,
  onNext,
  onBack
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('24months');
  const navigate = useNavigate();

  const durationOptions = [
    {
      id: '12months',
      title: '1 Year',
      subtitle: 'Premium Plan',
      description: 'Comprehensive coverage',
      features: ['Drive now, pay later', 'UK & EU breakdown cover', 'Guaranteed approval'],
      monthlyPrice: pricingData ? Math.round(pricingData.totalPrice / 12) : 0,
      totalPrice: pricingData?.totalPrice || 0,
      isPopular: false
    },
    {
      id: '24months',
      title: '2 Years',
      subtitle: 'Most Popular',
      description: 'Best value for money',
      features: ['Drive now, pay later', 'UK & EU breakdown cover', 'Guaranteed approval', '15% discount'],
      monthlyPrice: pricingData ? Math.round((pricingData.totalPrice * 1.8) / 24) : 0,
      totalPrice: pricingData ? Math.round(pricingData.totalPrice * 1.8) : 0,
      isPopular: true
    },
    {
      id: '36months',
      title: '3 Years',
      subtitle: 'Best Value',
      description: 'Maximum protection period',
      features: ['Drive now, pay later', 'UK & EU breakdown cover', 'Guaranteed approval', '20% discount'],
      monthlyPrice: pricingData ? Math.round((pricingData.totalPrice * 2.4) / 36) : 0,
      totalPrice: pricingData ? Math.round(pricingData.totalPrice * 2.4) : 0,
      isPopular: false
    }
  ];

  const handleContinue = () => {
    onNext(selectedPaymentType);
  };

  return (
    <div className="bg-[#e8f4fb] min-h-screen py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Warranty Duration</h1>
          <p className="text-gray-600">Select the coverage period that works best for you</p>
        </div>

        {/* Vehicle Info Banner */}
        <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1 text-center">
              <span className="font-semibold">{vehicleData.regNumber}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{vehicleData.make} {vehicleData.model}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{vehicleData.year}</span>
            </div>
            <div className="flex-1 text-center">
              <span>{planName}</span>
            </div>
          </div>
        </div>

        {/* Duration Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Choose Warranty Duration and Price
            </h3>
          </div>

          {/* Complete Protection Button */}
          <div className="mb-6">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors duration-200 font-medium">
              <span>Complete Protection</span>
              <div className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                i
              </div>
              <span className="text-sm">What's Included?</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {durationOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedPaymentType(option.id)}
                className={`p-4 sm:p-6 rounded-lg transition-all duration-200 text-left w-full cursor-pointer ${
                  selectedPaymentType === option.id 
                    ? 'bg-orange-500/10 border-2 border-orange-500 shadow-lg shadow-orange-500/30' 
                    : 'bg-white border border-gray-200 shadow-lg shadow-black/15 hover:shadow-xl hover:shadow-orange-500/20'
                }`}
              >
                {option.isPopular && (
                  <div className="mb-2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-gray-900">{option.title}</h4>
                    <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                      <Crown className="w-3 h-3" />
                      {option.subtitle}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                
                <div className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-orange-600">
                    £{option.monthlyPrice}
                    <span className="text-sm font-normal text-gray-600 ml-1">/month</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: £{option.totalPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button 
              onClick={handleContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-4 text-lg rounded-lg"
            >
              Continue to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyDurationStep;