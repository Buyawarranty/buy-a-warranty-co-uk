import React from 'react';

export const CarDrivingSpinner = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-20 overflow-hidden">
        {/* Road */}
        <div className="absolute bottom-0 w-full h-4 bg-gray-400">
          {/* Road markings */}
          <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-white">
            <div className="flex space-x-4 animate-pulse">
              <div className="w-6 h-0.5 bg-white animate-[slide-right_1s_linear_infinite]"></div>
              <div className="w-6 h-0.5 bg-white animate-[slide-right_1s_linear_infinite_0.2s]"></div>
              <div className="w-6 h-0.5 bg-white animate-[slide-right_1s_linear_infinite_0.4s]"></div>
              <div className="w-6 h-0.5 bg-white animate-[slide-right_1s_linear_infinite_0.6s]"></div>
            </div>
          </div>
        </div>
        
        {/* Car */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-[car-drive_3s_ease-in-out_infinite]">
          <div className="relative w-16 h-8">
            {/* Car body */}
            <div className="w-16 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg relative shadow-lg">
              {/* Car windows */}
              <div className="absolute top-1 left-2 w-3 h-2.5 bg-blue-100 rounded-sm"></div>
              <div className="absolute top-1 right-2 w-3 h-2.5 bg-blue-100 rounded-sm"></div>
              
              {/* Car headlights */}
              <div className="absolute top-2 left-0 w-1 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="absolute top-4 left-0 w-1 h-1.5 bg-red-400 rounded-full"></div>
              
              {/* Car highlights for 3D effect */}
              <div className="absolute top-0 left-1 right-1 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-lg"></div>
            </div>
            
            {/* Wheels */}
            <div className="absolute -bottom-1 left-1 w-3 h-3 bg-gray-700 rounded-full border border-gray-600 animate-spin">
              <div className="absolute inset-0.5 w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute -bottom-1 right-1 w-3 h-3 bg-gray-700 rounded-full border border-gray-600 animate-spin">
              <div className="absolute inset-0.5 w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Motion clouds/dust */}
        <div className="absolute bottom-2 left-4 w-2 h-1 bg-gray-300/60 rounded-full animate-[fade-drift_2s_ease-out_infinite]"></div>
        <div className="absolute bottom-3 left-2 w-1.5 h-0.5 bg-gray-300/40 rounded-full animate-[fade-drift_2s_ease-out_infinite_0.5s]"></div>
        <div className="absolute bottom-1 left-6 w-1 h-0.5 bg-gray-300/30 rounded-full animate-[fade-drift_2s_ease-out_infinite_1s]"></div>
      </div>
      
      {/* Processing text */}
      <div className="text-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};