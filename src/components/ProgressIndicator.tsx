
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm overflow-x-hidden">
      {/* Orange Top Progress Bar - Using official brand orange */}
      <div className="w-full h-1 bg-gray-200">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${progressPercentage}%`,
            backgroundColor: '#eb4b00' // Official brand orange
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Centered Logo */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <img 
            src="/lovable-uploads/ce43a78c-28ec-400b-8a16-1e98b15e0185.png" 
            alt="Buy a Warranty" 
            className="h-12 sm:h-16 w-auto"
          />
        </div>

        {/* Progress Bar */}
        <div className="relative">
          {/* Background Progress Track */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Active Progress Fill - Using official brand blue */}
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: '#224380' // Official brand blue
              }}
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
                  className={`flex flex-col items-center text-center ${
                    isActive ? 'font-semibold' : 
                    isCompleted ? '' : 'text-gray-400'
                  }`}
                  style={{
                    color: isActive || isCompleted ? '#224380' : undefined
                  }}
                >
                  {/* Step Circle */}
                  <div 
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-2 ${
                      isActive || isCompleted ? 'text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: isCompleted ? '#10b981' : isActive ? '#224380' : undefined
                    }}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  
                  {/* Step Label */}
                  <span className="text-xs sm:text-sm font-medium px-1">{step}</span>
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
