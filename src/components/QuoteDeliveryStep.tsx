import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';

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
  onNext: (data: { email: string; phone: string; firstName: string; lastName: string; sendQuoteEmail?: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
}

const QuoteDeliveryStep: React.FC<QuoteDeliveryStepProps> = ({ vehicleData, onNext, onBack, onSkip }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false
  });
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    };

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track abandoned cart if email is provided
    if (email.trim()) {
      try {
        await supabase.functions.invoke('track-abandoned-cart', {
          body: {
            full_name: email, // Using email as the name since we don't have separate fields
            email: email,
            phone: '',
            vehicle_reg: vehicleData?.regNumber,
            vehicle_make: vehicleData?.make,
            vehicle_model: vehicleData?.model,
            vehicle_year: vehicleData?.year,
            mileage: vehicleData?.mileage,
            step_abandoned: 2
          }
        });
      } catch (error) {
        console.error('Error tracking abandoned cart:', error);
        // Don't block the flow if tracking fails
      }
    }
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Small delay to let confetti start before navigating
    setTimeout(() => {
      onNext({ firstName: '', lastName: '', email: email.trim(), phone: '', sendQuoteEmail: !!email.trim() });
    }, 300);
  };

  const handleFieldBlur = (field: 'firstName' | 'lastName' | 'email' | 'phone') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const isFormValid = email.trim() && !errors.email;
  const areRequiredFieldsFilled = true; // No longer needed but keeping for compatibility

  return (
    <section className="bg-[#e8f4fb] py-4 sm:py-10 min-h-screen px-3 sm:px-0">
      {/* Back button above the content box for both views */}
      <div className="max-w-4xl mx-auto mb-4">
        <button 
          type="button" 
          onClick={onBack}
          className="flex items-center gap-2 text-base font-medium py-3 px-6 rounded-lg border transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      
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
                className={`w-full flex items-center justify-center text-white font-bold py-4 sm:py-5 px-4 sm:px-8 rounded-xl transition-all duration-200 relative shadow-lg ${
                  areRequiredFieldsFilled ? '' : 'opacity-50'
                }`}
                style={{ backgroundColor: '#eb4b00' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d43f00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eb4b00';
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
                  style={{ backgroundColor: '#224380' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e3a70';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#224380';
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
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">See your prices instantly ⚡ & get them by email</h2>
            </div>

            <form onSubmit={handleSubmitContactForm}>
              <div className="mb-6 sm:mb-8">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full border-2 rounded-[6px] px-[12px] sm:px-[16px] py-[12px] sm:py-[14px] focus:outline-none transition-all duration-200 text-base ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onFocus={(e) => {
                    e.target.style.borderColor = touched.email && errors.email ? '#ef4444' : '#224380';
                  }}
                  onBlur={(e) => {
                    handleFieldBlur('email');
                    e.target.style.borderColor = touched.email && errors.email ? '#ef4444' : '#d1d5db';
                  }}
                  required
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="flex justify-end items-center">
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
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
                    }}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base font-medium py-3 sm:py-3 px-4 sm:px-6 rounded-lg border-2 transition-all duration-200 hover-scale"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#d1d5db',
                      color: '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#9ca3af';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    Skip this step
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={!!errors.email || sendingEmail}
                    title={sendingEmail ? "Processing..." : ""}
                    className="flex items-center justify-center gap-2 text-white text-base sm:text-lg font-bold py-3 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#224380' }}
                    onMouseEnter={(e) => {
                      if (!errors.email && !sendingEmail) {
                        e.currentTarget.style.backgroundColor = '#1e3a70';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!errors.email && !sendingEmail) {
                        e.currentTarget.style.backgroundColor = '#224380';
                      }
                    }}
                  >
                    {sendingEmail ? 'Processing...' : 'See prices'}
                    {!sendingEmail && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default QuoteDeliveryStep;