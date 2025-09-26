import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import MileageSlider from '../MileageSlider';
import { trackButtonClick } from '@/utils/analytics';

interface VehicleData {
  regNumber: string;
  mileage: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
  blocked?: boolean;
  blockReason?: string;
}

interface HeroSectionProps {
  regNumber: string;
  mileage: string;
  sliderMileage: number;
  showMileageField: boolean;
  isLookingUp: boolean;
  mileageError: string;
  vehicleAgeError: string;
  showSecondWarrantyDiscount: boolean;
  discountCode: string;
  isFormValid: boolean;
  onRegChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMileageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMileageFocus: () => void;
  onSliderChange: (value: number) => void;
  onGetQuote: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  regNumber,
  mileage,
  sliderMileage,
  showMileageField,
  isLookingUp,
  mileageError,
  vehicleAgeError,
  showSecondWarrantyDiscount,
  discountCode,
  isFormValid,
  onRegChange,
  onMileageChange,
  onMileageFocus,
  onSliderChange,
  onGetQuote
}) => {
  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-blue-50 to-orange-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 md:space-y-8">
          {/* Second warranty discount banner */}
          {showSecondWarrantyDiscount && (
            <div className="mx-auto mb-8 p-4 bg-green-100 border-2 border-green-300 rounded-lg max-w-2xl">
              <div className="text-green-800 font-semibold text-lg">
                🎉 Special Offer: Save 10% on Your Second Warranty!
              </div>
              <div className="text-green-700 text-sm mt-1">
                Use code: <span className="font-mono font-bold">{discountCode}</span>
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-brand-dark-text mb-4 md:mb-6">
              Get Your <span className="text-brand-orange">Car Warranty</span>
              <br />
              Quote in <span className="text-brand-orange">30 Seconds</span>
            </h1>
            
            <p className="text-lg md:text-xl text-brand-dark-text max-w-2xl mx-auto mb-8">
              Fast, transparent, and trusted by thousands. Enter your reg and get an instant quote.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-8">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">4.8/5 Trustpilot</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                FCA Regulated
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                UK Based
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <div id="quote-form" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-brand-dark-text mb-6">
                Get Your Instant Quote
              </h2>
              
              <div className="space-y-6">
                {/* Registration Plate Input */}
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                    Vehicle Registration
                  </label>
                  <div className="reg-plate-container">
                    <div className="reg-plate-box">
                      <div className="flag-section">
                        <div className="eu-stars">★★★★★★</div>
                        <div className="gb-text">GB</div>
                      </div>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={onRegChange}
                        placeholder="AB12 CDE"
                        className="reg-input"
                        maxLength={8}
                      />
                    </div>
                  </div>
                </div>

                {/* Mileage Input */}
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                    Vehicle Mileage
                  </label>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={mileage}
                      onChange={onMileageChange}
                      onFocus={onMileageFocus}
                      placeholder="Enter mileage"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg font-semibold"
                    />
                    
                    <div className="px-2">
                      <MileageSlider
                        value={sliderMileage}
                        onChange={onSliderChange}
                        max={150000}
                      />
                    </div>
                  </div>
                  
                  {mileageError && (
                    <p className="text-red-500 text-sm mt-2">{mileageError}</p>
                  )}
                </div>

                {vehicleAgeError && (
                  <div className="bg-red-50 border border-red-300 rounded-md p-4">
                    <p className="text-red-700 text-sm">{vehicleAgeError}</p>
                  </div>
                )}

                {/* Get Quote Button */}
                <Button
                  onClick={onGetQuote}
                  disabled={!isFormValid || isLookingUp}
                  className="w-full btn-cta text-lg font-bold py-4 animate-breathing disabled:animate-none"
                  size="lg"
                >
                  {isLookingUp ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Looking up vehicle...
                    </div>
                  ) : (
                    'Get My Instant Quote'
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  By clicking "Get My Instant Quote", you agree to our{' '}
                  <Link to="/terms" className="text-brand-orange hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-brand-orange hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;