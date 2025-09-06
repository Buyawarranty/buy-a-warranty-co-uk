import React from 'react';
import { Star, Phone, Mail } from 'lucide-react';
import companyRegistrationImage from '@/assets/company-registration.webp';

const WebsiteFooter = () => {
  return (
    <div className="relative">
      {/* Trustpilot-style customer rating section */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-gray-700 font-medium">Excellent</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
              ))}
            </div>
            <span className="text-gray-700">4.8 out of 5 based on 2,847 reviews</span>
          </div>
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png" 
              alt="Trustpilot" 
              className="h-6 w-auto opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Get help when you need it most
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <a 
                href="tel:03302295040" 
                className="flex items-center text-lg font-semibold text-[#eb4b00] hover:text-[#d63f00] transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call us: 0330 229 5040
              </a>
              <a 
                href="mailto:info@buyawarranty.co.uk" 
                className="flex items-center text-lg font-semibold text-[#eb4b00] hover:text-[#d63f00] transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                info@buyawarranty.co.uk
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/" className="hover:text-[#eb4b00] transition-colors">Home</a></li>
                <li><a href="/make-a-claim" className="hover:text-[#eb4b00] transition-colors">Make a Claim</a></li>
                <li><a href="/contact-us" className="hover:text-[#eb4b00] transition-colors">Contact Us</a></li>
                <li><a href="/warranty-car-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Car</a></li>
                <li><a href="/warranty-van-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Van</a></li>
                <li><a href="/warranty-ev-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for EVs</a></li>
                <li><a href="/warranty-motorbike-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Motorbikes UK</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Legal</h3>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/privacy" className="hover:text-[#eb4b00] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-[#eb4b00] transition-colors">Terms & Conditions</a></li>
                <li><a href="/cookies" className="hover:text-[#eb4b00] transition-colors">Cookie Policy</a></li>
                <li><a href="/complaints" className="hover:text-[#eb4b00] transition-colors">Complaints Procedure</a></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Help</h3>
              <div className="space-y-3 text-gray-600">
                <div>
                  <a href="/faq" className="text-[#eb4b00] hover:text-[#d63f00] transition-colors font-semibold">
                    FAQ's
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sales Enquiries:</p>
                  <p className="text-lg font-bold text-[#eb4b00]">0330 229 5040</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Claims Hotline:</p>
                  <p className="text-lg font-bold text-[#eb4b00]">0330 229 5045</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Support:</p>
                  <p className="text-[#eb4b00]">support@buyawarranty.co.uk</p>
                </div>
              </div>
            </div>

            {/* About Our Service */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Looking for a new warranty provider?</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We make vehicle warranty simple, fast, and affordable to get vehicle warranty coverage 
                that suits your needs. Whether you drive a car, van, SUV, or motorbike — if it's under 15 years 
                old and has less than 150,000 miles, we've got you covered.
              </p>
              <div className="flex items-center">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <img 
                    src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                    alt="Buy a Warranty Logo" 
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center space-y-3">
              <p className="text-xs text-gray-500">© 2025 Buy A Warranty. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteFooter;
