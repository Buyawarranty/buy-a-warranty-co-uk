
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, Mail } from 'lucide-react';

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
    onSkip();
  };

  const handleEmailQuoteClick = () => {
    setShowContactForm(true);
  };

  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && phone) {
      onNext({ fullName, email, phone });
    }
  };

  const isFormValid = fullName && email && phone;

  return (
    <section className="bg-[#e8f4fb] py-6 sm:py-10 min-h-screen px-4 sm:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-12">
        {!showContactForm ? (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                How would you like to receive your quote?
              </h1>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center gap-2 text-base sm:text-lg">
                  <span className="w-5 h-5 text-gray-400">⏰</span>
                  Get accurate pricing in under 30 seconds
                </p>
                <p className="flex items-center justify-center gap-2 text-base sm:text-lg">
                  <span className="w-5 h-5 text-gray-400">🛡️</span>
                  Zero spam guarantee - pricing only
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <button 
                onClick={handleSkipClick}
                className="w-full flex items-center justify-center gap-3 text-white text-lg sm:text-xl font-semibold py-4 sm:py-5 px-6 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
                style={{ backgroundColor: '#3b82f6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                <Zap className="w-5 h-5" />
                See my pricing instantly (no email required)
                <span className="ml-auto">→</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 py-2 text-gray-900 font-medium border border-gray-300 rounded-full">
                    or
                  </span>
                </div>
              </div>

              <button 
                onClick={handleEmailQuoteClick}
                className="w-full flex items-center justify-center gap-3 text-white text-lg sm:text-xl font-semibold py-4 sm:py-5 px-6 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
                style={{ backgroundColor: '#ea580c' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ea580c';
                }}
              >
                <Mail className="w-5 h-5" />
                Email me a detailed breakdown with pricing
                <span className="ml-auto">→</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button 
                type="button" 
                onClick={onBack}
                className="flex items-center justify-center gap-2 text-blue-600 text-lg font-medium py-3 px-8 rounded-lg border-2 border-blue-600 transition-all duration-200 hover:bg-blue-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">One last step - this won't take long</h2>
            </div>

            <form onSubmit={handleSubmitContactForm}>
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center mb-2 sm:mb-3">
                  <label className="block font-semibold mb-1 sm:mb-2 text-gray-700 text-lg sm:text-xl">Full Name</label>
                  <span 
                    className="cursor-pointer text-sm ml-1" 
                    style={{ color: '#224380' }} 
                    title="Your full name as it appears on official documents"
                  >
                    ?
                  </span>
                </div>
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
                <div className="flex items-center mb-2 sm:mb-3">
                  <label className="block font-semibold mb-1 sm:mb-2 text-gray-700 text-lg sm:text-xl">Email Address</label>
                  <span 
                    className="cursor-pointer text-sm ml-1" 
                    style={{ color: '#224380' }} 
                    title="We'll send your quote to this email"
                  >
                    ?
                  </span>
                </div>
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
                <div className="flex items-center mb-2 sm:mb-3">
                  <label className="block font-semibold mb-1 sm:mb-2 text-gray-700 text-lg sm:text-xl">Phone Number</label>
                  <span 
                    className="cursor-pointer text-sm ml-1" 
                    style={{ color: '#224380' }} 
                    title="For quick updates about your warranty"
                  >
                    ?
                  </span>
                </div>
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

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 flex items-center justify-center gap-2 text-[15px] font-medium py-[12px] px-[20px] rounded-[12px] border-2 transition-all duration-200"
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
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="flex-1 flex items-center justify-center gap-3 text-white text-[22px] font-bold py-[18px] px-[24px] rounded-[12px] border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Get My Quote
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default QuoteDeliveryStep;
