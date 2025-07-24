import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuoteDeliveryStepProps {
  vehicleData: {
    regNumber: string;
    mileage: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
  };
  onNext: (data: { email: string; phone: string; fullName: string }) => void;
  onBack: () => void;
  onSkip: () => void;
}

const QuoteDeliveryStep: React.FC<QuoteDeliveryStepProps> = ({ vehicleData, onNext, onBack, onSkip }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSkipClick = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Small delay to let confetti start before navigating
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const handleEmailQuoteClick = () => {
    setShowContactForm(true);
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && phone) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Small delay to let confetti start before navigating
      setTimeout(() => {
        onNext({ fullName, email, phone });
      }, 300);
    }
  };

  const isFormValid = fullName && email && phone;

  return (
    <section className="bg-[#e8f4fb] py-4 sm:py-10 min-h-screen px-3 sm:px-0 relative">
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-12 relative">
        {!showContactForm ? (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight px-2">
                How would you like to receive your quote?
              </h1>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
              <button 
                onClick={handleSkipClick}
                className="w-full flex items-center justify-center text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-xl transition-all duration-200 relative shadow-lg"
                style={{ backgroundColor: '#224380' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a3460';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#224380';
                }}
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 sm:left-8" />
                <div className="text-center px-8 sm:px-12">
                  <div className="text-base sm:text-xl leading-tight">
                    View my quote now
                  </div>
                </div>
                <span className="text-xl sm:text-2xl absolute right-4 sm:right-8">→</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 sm:px-6 py-2 text-gray-700 text-base sm:text-lg font-semibold border border-gray-300 rounded-full">
                    or
                  </span>
                </div>
              </div>

              <div>
                <button 
                  onClick={handleEmailQuoteClick}
                  className="w-full flex items-center justify-center text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-xl transition-all duration-200 relative shadow-lg"
                  style={{ backgroundColor: '#eb4b00' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d43f00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#eb4b00';
                  }}
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 absolute left-4 sm:left-8" />
                  <div className="text-center px-8 sm:px-12">
                    <div className="text-base sm:text-xl leading-tight">
                      Email me my quote
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl absolute right-4 sm:right-8">→</span>
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-2">
                  Unsubscribe at any time
                </p>
              </div>
            </div>

          </>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">One last step - this won't take long</h2>
            </div>

            <form onSubmit={handleSubmitContactForm}>
              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#224380';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johnsmith@email.com"
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#224380';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block font-semibold mb-2 sm:mb-3 text-gray-700 text-lg sm:text-xl">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07953866662"
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[12px] sm:px-[16px] py-[10px] sm:py-[12px] focus:outline-none transition-all duration-200 text-base"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#224380';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => setShowContactForm(false)}
                  className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium py-3 sm:py-3 px-6 sm:px-8 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: '#f3f4f6',
                  borderColor: '#f3f4f6',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="flex items-center justify-center gap-2 text-white text-base sm:text-lg font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    backgroundColor: isFormValid ? '#eb4b00' : '#eb4b00',
                    borderColor: isFormValid ? '#eb4b00' : '#eb4b00'
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor = '#d43f00';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor = '#eb4b00';
                    }
                  }}
                >
                  View my quote now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* Grey back button at bottom */}
        <div className="mt-8 flex justify-center">
          <button 
            type="button" 
            onClick={onBack}
            className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium py-3 sm:py-3 px-6 sm:px-8 rounded-lg border-2 transition-all duration-200"
            style={{
              backgroundColor: '#f3f4f6',
              borderColor: '#f3f4f6',
              color: '#374151'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuoteDeliveryStep;