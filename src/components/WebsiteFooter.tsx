
import React from 'react';

const WebsiteFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/" className="hover:text-[#eb4b00] transition-colors">Home</a></li>
              <li><a href="/claim" className="hover:text-[#eb4b00] transition-colors">Make a Claim</a></li>
              <li><a href="/warranty-car-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Car United Kingdom</a></li>
              <li><a href="/warranty-van-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Van United Kingdom</a></li>
              <li><a href="/warranty-ev-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for EVs United Kingdom</a></li>
              <li><a href="/warranty-motorbike-uk" className="hover:text-[#eb4b00] transition-colors">Warranty for Motorbikes UK</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/privacy" className="hover:text-[#eb4b00] transition-colors">Privacy policy</a></li>
              <li><a href="/terms" className="hover:text-[#eb4b00] transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Need Help */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium">Call us directly</p>
              <p className="text-lg font-bold text-[#eb4b00]">0300 445 678</p>
              <p className="font-medium mt-4">Email us directly</p>
              <p className="text-[#eb4b00]">info@buyawarranty.co.uk</p>
            </div>
          </div>

          {/* Looking for a new warranty provider */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Looking for a new warranty provider?</h3>
            <p className="text-gray-600 text-sm">
              We make vehicle warranty simple, fast, and affordable to get vehicle warranty coverage 
              that suits your needs. Whether you drive a car, van, SUV, or motorbike — if it's under 12 years 
              old and has less than 150,000 miles, we've got you covered.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
