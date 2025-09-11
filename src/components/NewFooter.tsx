
import React from 'react';
import { Phone, Mail, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewFooter = () => {
  return (
    <div className="bg-white border-t border-gray-200">

      {/* Main footer section */}
      <div className="bg-[#224380] text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-6">
            Need help? Our team of warranty experts are here to help.
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <a 
              href="tel:08000014990" 
              className="flex items-center gap-2 text-[#eb4b00] hover:text-orange-400 transition-colors font-medium"
            >
              <Phone size={18} />
              Call us: 0800 001 4990
            </a>
            
            <a 
              href="mailto:info@warrantywise.co.uk" 
              className="flex items-center gap-2 text-[#eb4b00] hover:text-orange-400 transition-colors font-medium"
            >
              <Mail size={18} />
              Email us: info@warrantywise.co.uk
            </a>

            <Link 
              to="/blog" 
              className="flex items-center gap-2 text-[#eb4b00] hover:text-orange-400 transition-colors font-medium"
            >
              <BookOpen size={18} />
              Drive Smarter
            </Link>
          </div>
        </div>
      </div>

      {/* Legal footer */}
      <div className="bg-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 text-xs text-gray-600 leading-relaxed">
          <p className="mb-2">
            Warrantywise and Warrantywise Logo are trademarks of Warrantywise. The website "
            <span className="font-medium">www.warrantywise.co.uk</span>
            " and contains herein are for information purposes only. This does not form part of any contract or protection. Any and all Warranty Plan confirmation including Warranty Plan Documents and Application Forms will be issued upon purchase. It is important that you read all information supplied and then make your own choice of warranty cover together with any plan additions that you may need as a vehicle owner.
          </p>
          <p className="mb-2">
            We cannot be responsible for your vehicle warranty requirements as this may occur in the foreseeable future. Terms and Conditions apply and as provided by Warranty Plans available by us via administration by calling 0800 169 7881. Warrantywise Limited Reg 07025969 | and Warrantywise UK Limited Reg 10776246 both trading as Warrantywise are companies registered in England and Wales at The Reward Centre, 1 Trevelyan Way, Blackburn, Lancashire, BB1 3NJ and are both part of Wise Group Holdings Limited Company Reg 9563170. Warrantywise Limited VAT registration number 266 8963 77 | and Warrantywise UK Limited VAT registration number 637 8876 30, are VAT registered companies. All prices and monetary figures quoted are inclusive of VAT where applicable.
          </p>
          <p>
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="#" className="text-[#224380] hover:underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="#" className="text-[#224380] hover:underline">Terms of Service</a>
            {' '}apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewFooter;
