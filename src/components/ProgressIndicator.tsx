
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex items-center">
                  {/* Step Circle */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isActive 
                      ? 'bg-[#0066cc] text-white' 
                      : isCompleted 
                      ? 'bg-[#28a745] text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  
                  {/* Step Label */}
                  <span className={`
                    ml-3 text-sm font-medium
                    ${isActive 
                      ? 'text-[#0066cc]' 
                      : isCompleted 
                      ? 'text-[#28a745]' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-px mx-4
                    ${isCompleted 
                      ? 'bg-[#28a745]' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
