import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarJourneyProgressProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

const steps = [
  { id: 1, title: 'Your Reg Plate', description: 'Enter your vehicle details' },
  { id: 2, title: 'Receive Quote', description: 'Get your personalized quote' },
  { id: 3, title: 'Choose Your Plan', description: 'Select your coverage options' },
  { id: 4, title: 'Final Details', description: 'Complete your purchase' }
];

const CarJourneyProgress: React.FC<CarJourneyProgressProps> = ({ 
  currentStep, 
  onStepChange 
}) => {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const getCarPosition = () => {
    const progress = Math.min(Math.max((animatedStep - 1) / 3, 0), 1);
    return `${progress * 85 + 7.5}%`;
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          <span className="text-[#2563eb]">buya</span>
          <span className="text-[#ea580c]">warranty</span>
        </h1>
      </div>

      {/* Progress Container */}
      <div className="relative">
        {/* Progress Line */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-[#ea580c] rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${Math.max((currentStep - 1) / 3 * 100, 0)}%` }}
          ></div>
        </div>

        {/* Moving Car */}
        <div 
          className="absolute -top-4 transition-all duration-1000 ease-in-out transform"
          style={{ 
            left: getCarPosition(),
            transform: 'translateX(-50%)'
          }}
        >
          <svg width="32" height="20" viewBox="0 0 32 20" className="drop-shadow-sm">
            {/* Car Body */}
            <rect x="2" y="8" width="28" height="8" rx="2" fill="#ea580c" />
            <rect x="6" y="4" width="20" height="6" rx="2" fill="#fb923c" />
            
            {/* Windows */}
            <rect x="8" y="5" width="6" height="4" rx="1" fill="#fef3c7" opacity="0.9" />
            <rect x="18" y="5" width="6" height="4" rx="1" fill="#fef3c7" opacity="0.9" />
            
            {/* Wheels */}
            <circle cx="8" cy="15" r="3" fill="#374151" />
            <circle cx="24" cy="15" r="3" fill="#374151" />
            <circle cx="8" cy="15" r="2" fill="#6b7280" />
            <circle cx="24" cy="15" r="2" fill="#6b7280" />
          </svg>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-start mt-8">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-[#ea580c] text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="mt-3 text-center max-w-32">
                  <h3 className={`
                    font-medium text-sm mb-1 transition-colors duration-300
                    ${isCurrent ? 'text-[#ea580c]' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarJourneyProgress;