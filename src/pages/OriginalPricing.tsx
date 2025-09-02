import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OriginalPricing = () => {
  const [selectedDuration, setSelectedDuration] = useState('24');
  const [selectedExcess, setSelectedExcess] = useState('50');
  const [selectedPlan, setSelectedPlan] = useState('advantage');

  const durationOptions = [
    { value: '12', label: '12 months', discount: null },
    { value: '24', label: '24 months', discount: '15% OFF' },
    { value: '36', label: '36 months', discount: '20% OFF' }
  ];

  const excessOptions = [
    { value: '0', label: '£0' },
    { value: '50', label: '£50' },
    { value: '100', label: '£100' },
    { value: '150', label: '£150' }
  ];

  const planOptions = [
    {
      id: 'essential',
      name: 'AutoCare Essential',
      claimLimit: '£750',
      claimsPerYear: '10 claims per year',
      description: 'Confidence for the everyday drive.',
      isPopular: false
    },
    {
      id: 'advantage',
      name: 'AutoCare Advantage',
      claimLimit: '£1,250',
      claimsPerYear: 'Unlimited claims',
      description: 'Balanced protection for life\'s bigger bumps.',
      isPopular: true
    },
    {
      id: 'elite',
      name: 'AutoCare Elite',
      claimLimit: '£2,000',
      claimsPerYear: 'Unlimited claims',
      description: 'Top-tier cover for total peace of mind.',
      isPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Trustpilot Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600">Trustpilot</div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Warranty Quote
            </h1>

            {/* Registration Plate */}
            <div className="inline-flex items-center bg-yellow-400 border-2 border-black rounded-lg px-4 py-2 mb-6">
              <img 
                src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                alt="UK Flag" 
                className="w-8 h-6 mr-3 object-cover rounded-sm"
              />
              <span className="text-2xl font-bold text-black">B11 CSD</span>
            </div>

            {/* Vehicle Details */}
            <div className="text-center text-gray-600 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">AUDI Q5</span>
                </div>
                <div>
                  <span className="font-medium">Fuel:</span> DIESEL
                </div>
                <div>
                  <span className="font-medium">Year:</span> 2018
                </div>
                <div>
                  <span className="font-medium">Mileage:</span> 33,333 miles
                </div>
              </div>
            </div>

            {/* Warranty Available Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-8">
              <div className="flex items-center justify-center text-green-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Warranty cover available for your vehicle</span>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedDuration === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  {option.discount && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      {option.discount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Voluntary Excess Amount */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4">Voluntary Excess Amount</h3>
            <div className="flex justify-center space-x-4">
              {excessOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedExcess(option.value)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedExcess === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-6">Choose Your Plan</h3>
            <div className="space-y-4">
              {planOptions.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-[#eb4b00] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#eb4b00] text-white px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-[#eb4b00] mr-4">
                          {plan.claimLimit}
                        </span>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">({plan.claimsPerYear})</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{plan.description}</p>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id 
                        ? 'border-[#eb4b00] bg-[#eb4b00]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button className="bg-[#eb4b00] hover:bg-[#d63f00] text-white font-bold px-12 py-4 text-lg rounded-lg w-full">
              Continue to Checkout
            </Button>
          </div>
        </div>

        {/* A/B Test Indicator */}
        <div className="text-center mt-4">
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Original Design (A/B Test)
          </span>
        </div>
      </div>
    </div>
  );
};

export default OriginalPricing;