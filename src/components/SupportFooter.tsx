
import React from 'react';

const SupportFooter = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="relative bg-[#224380] px-4 py-8 overflow-hidden">
        {/* Diagonal orange stripe with curved edges */}
        <div 
          className="absolute inset-0 bg-[#eb4b00]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 70%)',
          }}
        />
        
        {/* Content over the background */}
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo - 5x bigger */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/ce43a78c-28ec-400b-8a16-1e98b15e0185.png" 
              alt="Buy a Warranty" 
              className="h-50 w-auto"
            />
          </div>
          
          {/* Support text and phone - 5x bigger text */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-12 text-white text-center sm:text-left">
            <span className="text-5xl sm:text-6xl font-medium">
              Need help or have a question?
            </span>
            <a 
              href="tel:03302291111" 
              className="text-6xl sm:text-7xl font-bold hover:text-orange-200 transition-colors"
            >
              0330 229 1111
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportFooter;
