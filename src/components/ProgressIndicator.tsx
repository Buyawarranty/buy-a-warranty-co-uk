
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Centered Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/d825510b-f9c3-4b0d-ad87-4aaa8ab2c3c2.png" 
            alt="Buy a Warranty" 
            className="h-16 w-auto"
          />
        </div>

        {/* Progress Steps Text */}
        <div className="text-center text-sm text-gray-500 font-medium mb-6">
          Step {currentStep} of {totalSteps}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          {/* Background Progress Track */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Active Progress Fill */}
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${
                    isActive ? 'text-blue-600 font-semibold' : 
                    isCompleted ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {/* Step Circle */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      isActive ? 'bg-blue-500 text-white' :
                      isCompleted ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  
                  {/* Step Label */}
                  <span className="text-sm font-medium">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
