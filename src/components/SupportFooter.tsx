
import React from 'react';

const SupportFooter = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Angled orange stripe - folded paper style */}
      <div className="relative h-8 bg-[#eb4b00] overflow-hidden">
        <div 
          className="absolute inset-0 bg-[#eb4b00]"
          style={{ 
            clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)',
          }}
        />
        {/* Shadow effect for depth */}
        <div 
          className="absolute inset-0 bg-black opacity-10"
          style={{ 
            clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)',
          }}
        />
      </div>
      
      {/* Main footer content */}
      <div className="bg-[#224380] px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/62854118-6cac-435e-9c23-eebc80100549.png" 
              alt="Buy a Warranty" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Support text and phone */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-white text-center sm:text-left">
            <span className="text-base sm:text-lg font-medium">
              Need help or have a question?
            </span>
            <a 
              href="tel:03302291111" 
              className="text-lg sm:text-xl font-bold hover:text-orange-200 transition-colors"
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
