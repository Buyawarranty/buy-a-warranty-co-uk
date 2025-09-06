import React, { useState, useRef, useEffect } from 'react';
// Using the panda head image from public uploads
const pandaHead = "/lovable-uploads/adc6403c-4ce7-46d3-8cbc-4bfff1125e1a.png";

interface MileageSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const MileageSlider: React.FC<MileageSliderProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 150000 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const formatMileage = (miles: number) => {
    return miles.toLocaleString();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateValue(e.touches[0].clientX);
    }
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = Math.round(min + percentage * (max - min));
    
    // Round to nearest 1000 for smoother experience
    const roundedValue = Math.round(newValue / 1000) * 1000;
    onChange(Math.max(min, Math.min(max, roundedValue)));
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      updateValue(e.clientX);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="px-4 py-6">
      {/* Slider Track */}
      <div 
        ref={sliderRef}
        className="relative h-6 bg-white rounded-full cursor-pointer border-2 border-gray-300"
        onClick={handleSliderClick}
      >
        {/* Selected Area (Orange) */}
        <div 
          className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Panda Head Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-grab ${
            isDragging ? 'cursor-grabbing scale-110' : ''
          } transition-all duration-150 ease-out`}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img 
            src={pandaHead} 
            alt="Panda slider handle" 
            className={`w-12 h-12 object-contain ${
              isDragging ? 'drop-shadow-lg' : 'hover:drop-shadow-md'
            } transition-all duration-150`}
            draggable={false}
          />
        </div>
      </div>

      {/* Range Numbers at Bottom */}
      <div className="flex justify-between text-sm text-gray-600 mt-3">
        <span>0</span>
        <span>150,000</span>
      </div>

      {/* Validation Message */}
      {value > 150000 && (
        <div className="text-center text-sm text-blue-600 font-medium mt-2">
          We can only cover vehicles up to 150,000 miles
        </div>
      )}
    </div>
  );
};

export default MileageSlider;