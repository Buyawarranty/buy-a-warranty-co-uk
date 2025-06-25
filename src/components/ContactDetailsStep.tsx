
import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';

interface ContactDetailsStepProps {
  onNext: (data: { email?: string; phone?: string }) => void;
  onBack: () => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
  };
}

const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({ onNext, onBack, initialData }) => {
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ 
      email: email || undefined, 
      phone: phone || undefined 
    });
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="form-section-card">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-8">
        <div 
          className="flex items-center justify-center w-8 h-8 text-white rounded-full font-bold"
          style={{ backgroundColor: '#224380' }}
        >
          <span>2</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6" style={{ color: '#224380' }} />
          <h2 className="step-title">You</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="section-subtitle">Want a copy of your quote?</h3>
        <p className="section-description">
          Get access to special discounts and your quote details. No spam. No sharing. Just real value.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Email Address</label>
            <span className="optional-label">(Optional)</span>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="We'll send your quote and any special offers to this email"
            >
              ?
            </span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
            onFocus={(e) => {
              e.target.style.borderColor = '#224380';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        {/* Phone Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Phone Number</label>
            <span className="optional-label">(Optional)</span>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="For quick updates about your warranty application"
            >
              ?
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
            onFocus={(e) => {
              e.target.style.borderColor = '#224380';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        {/* Skip Notice */}
        <div className="skip-notice mb-8">
          <p>
            Prefer to skip? No problem — you can still see your prices and complete your purchase.
          </p>
        </div>

        {/* Button Group */}
        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] border-2 transition-all duration-200"
            style={{
              backgroundColor: 'white',
              borderColor: '#224380',
              color: '#224380'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button 
            type="button" 
            onClick={handleSkip}
            className="flex-1 text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] border-2 transition-all duration-200"
            style={{
              backgroundColor: 'white',
              borderColor: '#224380',
              color: '#224380'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            Skip for now
          </button>
          <button 
            type="submit" 
            className="flex-1 text-white text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] border-2 transition-all duration-200"
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
            Get My Quote
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactDetailsStep;
