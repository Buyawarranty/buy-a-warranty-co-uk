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
    <div className="w-full max-w-4xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg">

      {/* Main Journey Container */}
      <div className="relative">
        {/* Road Background */}
        <div className="relative h-32 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-lg overflow-hidden">
          {/* Road Markings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 border-t-4 border-dashed border-yellow-300 opacity-80"></div>
          </div>
          
          {/* Moving Car */}
          <div 
            className="absolute top-4 transition-all duration-1000 ease-in-out transform"
            style={{ 
              left: getCarPosition(),
              transform: 'translateX(-50%)'
            }}
          >
            {/* Car Body */}
            <div className="relative">
              {/* Car Shadow */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black opacity-20 rounded-full blur-sm"></div>
              
              {/* Car Main Body */}
              <svg width="60" height="40" viewBox="0 0 60 40" className="drop-shadow-lg">
                {/* Car Body */}
                <rect x="5" y="15" width="50" height="15" rx="3" fill="#3B82F6" />
                <rect x="10" y="8" width="40" height="12" rx="4" fill="#60A5FA" />
                
                {/* Windows */}
                <rect x="12" y="10" width="15" height="8" rx="2" fill="#E0F2FE" opacity="0.8" />
                <rect x="33" y="10" width="15" height="8" rx="2" fill="#E0F2FE" opacity="0.8" />
                
                {/* Wheels */}
                <circle cx="15" cy="28" r="6" fill="#374151" />
                <circle cx="15" cy="28" r="4" fill="#6B7280" />
                <circle cx="45" cy="28" r="6" fill="#374151" />
                <circle cx="45" cy="28" r="4" fill="#6B7280" />
                
                {/* Headlights */}
                <circle cx="55" cy="20" r="3" fill="#FEF3C7" opacity="0.9" />
                <circle cx="55" cy="25" r="3" fill="#FEF3C7" opacity="0.9" />
              </svg>
              
              {/* Speed Lines */}
              {animatedStep > 1 && (
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-0.5 bg-blue-300 mb-1 opacity-60 animate-pulse"
                      style={{ 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.5s'
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scenery Elements */}
          <div className="absolute bottom-0 left-4">
            <div className="w-8 h-12 bg-green-500 rounded-t-full opacity-60"></div>
          </div>
          <div className="absolute bottom-0 right-8">
            <div className="w-6 h-10 bg-green-400 rounded-t-full opacity-60"></div>
          </div>
          
          {/* Clouds */}
          <div className="absolute top-2 left-16 w-12 h-6 bg-white rounded-full opacity-40"></div>
          <div className="absolute top-1 right-20 w-10 h-5 bg-white rounded-full opacity-30"></div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-start mt-8 relative">
          {/* Connection Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000 ease-in-out"
              style={{ width: `${Math.max((currentStep - 1) / 3 * 100, 0)}%` }}
            ></div>
          </div>

          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 transform
                    ${isCompleted 
                      ? 'bg-green-500 text-white scale-110 shadow-lg' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white scale-110 shadow-lg animate-pulse' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="mt-4 text-center max-w-32">
                  <h3 className={`
                    font-semibold text-sm mb-1 transition-colors duration-300
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>

                {/* Active Step Glow */}
                {isCurrent && (
                  <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 animate-ping"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Percentage */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {Math.round((currentStep / 4) * 100)}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarJourneyProgress;