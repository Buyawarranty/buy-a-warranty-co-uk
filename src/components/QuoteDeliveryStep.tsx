
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
    <section className="bg-[#e8f4fb] py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        {!showContactForm ? (
          <>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Where should we send your quote?</h2>
              <p className="text-lg text-gray-600 mb-2">Instant quote to your inbox</p>
              <p className="text-gray-600">No spam, just your personalised prices</p>
            </div>

            <div className="space-y-4 mb-8">
              <button 
                onClick={handleSkipClick}
                className="w-full flex items-center justify-center gap-3 text-white text-[18px] font-bold py-[18px] px-[24px] rounded-[12px] border-2 transition-all duration-200"
                style={{
                  backgroundColor: '#224380',
                  borderColor: '#224380'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a3460';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#224380';
                }}
              >
                No contact details, just show me what it costs now
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="text-center text-gray-500 text-sm">
                - or -
              </div>

              <button 
                onClick={handleEmailQuoteClick}
                className="w-full flex items-center justify-center gap-3 text-white text-[18px] font-bold py-[18px] px-[24px] rounded-[12px] border-2 transition-all duration-200"
                style={{
                  backgroundColor: '#eb4b00',
                  borderColor: '#eb4b00'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d43f00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eb4b00';
                }}
              >
                Email my quote and show me what it costs now
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onBack}
                className="flex-1 flex items-center justify-center gap-2 text-[15px] font-medium py-[12px] px-[20px] rounded-[12px] border-2 transition-all duration-200"
                style={{
                  backgroundColor: '#6b7280',
                  borderColor: '#6b7280',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555a63';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">One last step - this won't take long</h2>
            </div>

            <form onSubmit={handleSubmitContactForm}>
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <label className="block font-semibold mb-2 text-gray-700 text-xl">Full Name</label>
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
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#224380';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <label className="block font-semibold mb-2 text-gray-700 text-xl">Email Address</label>
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
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#224380';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <label className="block font-semibold mb-2 text-gray-700 text-xl">Phone Number</label>
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
                  className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
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
                    backgroundColor: '#6b7280',
                    borderColor: '#6b7280',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#555a63';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6b7280';
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className="flex-1 flex items-center justify-center gap-3 text-white text-[18px] font-bold py-[18px] px-[24px] rounded-[12px] border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
