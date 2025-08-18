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
        
        {/* SUV/Sports Car positioned in middle of road */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-[car-progress_3s_ease-in-out_infinite]">
          <div className="relative w-16 h-8">
            {/* Main car body - SUV style with higher profile */}
            <div className="absolute bottom-1.5 w-16 h-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg relative shadow-xl">
              {/* Sport grille */}
              <div className="absolute top-1 left-0 w-1 h-3 bg-gray-600 rounded-r"></div>
              <div className="absolute top-1.5 left-0.5 w-0.5 h-2 bg-gray-400"></div>
              
              {/* Side mirror */}
              <div className="absolute top-0 left-2 w-1 h-1 bg-gray-700 rounded-full"></div>
              <div className="absolute top-0 right-2 w-1 h-1 bg-gray-700 rounded-full"></div>
              
              {/* Sport stripe */}
              <div className="absolute top-2 left-1 right-1 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded"></div>
              
              {/* Chrome details */}
              <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded"></div>
            </div>
            
            {/* Windshield and roof - higher SUV profile */}
            <div className="absolute bottom-3.5 left-1.5 w-13 h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg relative">
              {/* Front windshield */}
              <div className="absolute top-0.5 left-0.5 w-4 h-2 bg-gradient-to-b from-sky-100 to-sky-200 rounded-sm opacity-80"></div>
              {/* Rear windshield */}
              <div className="absolute top-0.5 right-0.5 w-4 h-2 bg-gradient-to-b from-sky-100 to-sky-200 rounded-sm opacity-80"></div>
              {/* Side windows */}
              <div className="absolute top-0.5 left-5 w-3 h-2 bg-gradient-to-b from-sky-100 to-sky-200 rounded-sm opacity-80"></div>
              
              {/* Roof rails */}
              <div className="absolute top-0 left-1 right-1 h-0.5 bg-gray-400 rounded"></div>
            </div>
            
            {/* Modern LED headlights */}
            <div className="absolute bottom-2.5 left-0 w-1 h-1.5 bg-gradient-to-b from-white to-blue-100 rounded-r shadow-lg animate-pulse"></div>
            {/* LED taillights */}
            <div className="absolute bottom-2.5 right-0 w-1 h-1.5 bg-gradient-to-b from-red-400 to-red-600 rounded-l shadow-lg"></div>
            
            {/* Larger SUV wheels with detailed rims */}
            <div className="absolute -bottom-0.5 left-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600 animate-spin shadow-lg">
              <div className="absolute inset-0.5 w-2 h-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
              <div className="absolute inset-1 w-1 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div className="absolute -bottom-0.5 right-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600 animate-spin shadow-lg">
              <div className="absolute inset-0.5 w-2 h-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
              <div className="absolute inset-1 w-1 h-1 bg-gray-700 rounded-full"></div>
            </div>
            
            {/* Exhaust smoke effect */}
            <div className="absolute bottom-1 right-0 w-2 h-1 bg-gray-400/30 rounded-full animate-pulse"></div>
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