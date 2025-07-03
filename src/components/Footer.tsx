
import React from 'react';
import { Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { X } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2c5282] text-white relative overflow-hidden">
      {/* Owl character background */}
      <div className="absolute bottom-0 right-8 z-0">
        <img 
          src="/lovable-uploads/7a712a73-e863-4c30-864c-97ff50a30a0e.png" 
          alt="Buy a Warranty Owl Mascot" 
          className="h-64 w-auto opacity-20"
        />
      </div>
      
      {/* Main footer section */}
      <div className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Need help section */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">Need help?</h3>
            <p className="text-lg mb-6">Our customer support team are here to help.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <a 
                href="tel:0300456576" 
                className="flex items-center gap-2 text-[#eb4b00] hover:text-orange-400 transition-colors font-medium text-lg"
              >
                <Phone size={20} />
                Call us: 0300 456 576
              </a>
              
              <a 
                href="mailto:info@buyawarranty.co.uk" 
                className="flex items-center gap-2 text-[#eb4b00] hover:text-orange-400 transition-colors font-medium text-lg"
              >
                <Mail size={20} />
                Email us: info@buyawarranty.co.uk
              </a>
            </div>
          </div>

          {/* Orange divider line */}
          <div className="w-full h-px bg-[#eb4b00] my-8"></div>

          {/* Footer content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Logo section */}
            <div className="flex justify-center lg:justify-start">
              <img 
                src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
                alt="Buy a Warranty" 
                className="h-16 w-auto"
              />
            </div>

            {/* Navigation links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/" 
                className="text-white hover:text-[#eb4b00] transition-colors font-medium"
              >
                Home
              </a>
              <a 
                href="/faq" 
                className="text-white hover:text-[#eb4b00] transition-colors font-medium"
              >
                Frequently Asked Questions
              </a>
              <a 
                href="/contact" 
                className="text-white hover:text-[#eb4b00] transition-colors font-medium"
              >
                Contact
              </a>
            </div>

            {/* Social media links */}
            <div className="flex justify-center lg:justify-end gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#eb4b00] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#eb4b00] transition-colors"
              >
                <X size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#eb4b00] transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="bg-[#1a365d] py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Buy a Warranty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
