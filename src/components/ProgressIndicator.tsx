
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, steps }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Centered Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/d825510b-f9c3-4b0d-ad87-4aaa8ab2c3c2.png" 
            alt="Buy a Warranty" 
            className="h-16 w-auto"
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
                  className={`flex flex-col items-center ${
                    isActive ? 'font-semibold' : 
                    isCompleted ? '' : 'text-gray-400'
                  }`}
                  style={{
                    color: isActive || isCompleted ? '#224380' : undefined
                  }}
                >
                  {/* Step Circle */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      isActive || isCompleted ? 'text-white' : 'bg-gray-200 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: isActive || isCompleted ? '#224380' : undefined
                    }}
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
