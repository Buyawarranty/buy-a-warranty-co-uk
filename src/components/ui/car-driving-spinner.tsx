import React from 'react';

export const CarDrivingSpinner = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-80 h-20 overflow-hidden">
        {/* Progress bar background */}
        <div className="absolute bottom-0 w-full h-4 bg-gray-300 rounded-full">
          {/* Progress bar fill */}
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-[progress-fill_3s_ease-in-out_infinite]" style={{ width: '70%' }}></div>
          
          {/* Road markings on progress bar */}
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-0.5">
            <div className="flex justify-between px-4">
              <div className="w-4 h-0.5 bg-white rounded animate-pulse"></div>
              <div className="w-4 h-0.5 bg-white rounded animate-pulse delay-150"></div>
              <div className="w-4 h-0.5 bg-white rounded animate-pulse delay-300"></div>
              <div className="w-4 h-0.5 bg-white rounded animate-pulse delay-450"></div>
            </div>
          </div>
        </div>
        
        {/* Car positioned in middle of road */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-[car-progress_3s_ease-in-out_infinite]">
          <div className="relative w-12 h-6">
            {/* Car body */}
            <div className="w-12 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg relative shadow-lg">
              {/* Car windows */}
              <div className="absolute top-0.5 left-1.5 w-2 h-1.5 bg-blue-100 rounded-sm"></div>
              <div className="absolute top-0.5 right-1.5 w-2 h-1.5 bg-blue-100 rounded-sm"></div>
              
              {/* Car headlights */}
              <div className="absolute top-1 left-0 w-0.5 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="absolute top-3 left-0 w-0.5 h-1 bg-red-400 rounded-full"></div>
            </div>
            
            {/* Wheels */}
            <div className="absolute -bottom-0.5 left-0.5 w-2 h-2 bg-gray-700 rounded-full border border-gray-600 animate-spin">
              <div className="absolute inset-0.5 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute -bottom-0.5 right-0.5 w-2 h-2 bg-gray-700 rounded-full border border-gray-600 animate-spin">
              <div className="absolute inset-0.5 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Wind effect lines coming towards car */}
        <div className="absolute top-2 right-8 w-8 h-0.5 bg-gray-400/60 rounded animate-[wind-lines_1.5s_linear_infinite]"></div>
        <div className="absolute top-4 right-12 w-6 h-0.5 bg-gray-400/40 rounded animate-[wind-lines_1.5s_linear_infinite_0.3s]"></div>
        <div className="absolute top-6 right-6 w-10 h-0.5 bg-gray-400/50 rounded animate-[wind-lines_1.5s_linear_infinite_0.6s]"></div>
        <div className="absolute top-8 right-16 w-4 h-0.5 bg-gray-400/30 rounded animate-[wind-lines_1.5s_linear_infinite_0.9s]"></div>
      </div>
    </div>
  );
};