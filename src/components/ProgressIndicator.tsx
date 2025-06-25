
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={index} className="flex items-center relative">
                {/* Step Arrow Container */}
                <div className={`
                  relative px-8 py-3 text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-500'
                  }
                  ${index === 0 ? 'rounded-l-lg' : ''}
                  ${index === steps.length - 1 ? 'rounded-r-lg' : ''}
                `}>
                  
                  {/* Arrow pointing right (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute top-0 right-0 w-0 h-0 transform translate-x-full
                      border-t-[20px] border-b-[20px] border-l-[12px]
                      ${isActive 
                        ? 'border-l-blue-500 border-t-transparent border-b-transparent' 
                        : isCompleted 
                        ? 'border-l-blue-100 border-t-transparent border-b-transparent' 
                        : 'border-l-gray-100 border-t-transparent border-b-transparent'
                      }
                    `} />
                  )}
                  
                  {/* Arrow notch (except for first step) */}
                  {index > 0 && (
                    <div className={`
                      absolute top-0 left-0 w-0 h-0 transform -translate-x-full
                      border-t-[20px] border-b-[20px] border-r-[12px]
                      ${isActive 
                        ? 'border-r-blue-500 border-t-transparent border-b-transparent' 
                        : isCompleted 
                        ? 'border-r-blue-100 border-t-transparent border-b-transparent' 
                        : 'border-r-gray-100 border-t-transparent border-b-transparent'
                      }
                    `} />
                  )}
                  
                  <span className="relative z-10">{step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
