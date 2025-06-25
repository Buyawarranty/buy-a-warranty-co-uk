
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={index} className={`text-xs text-center transition-all duration-300 ${
              index + 1 === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
