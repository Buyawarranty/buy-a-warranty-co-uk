
import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';

interface ContactDetailsStepProps {
  onNext: (data: { email?: string; phone?: string }) => void;
  onBack: () => void;
}

const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({ onNext, onBack }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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
        <div className="step-circle">
          <span className="step-number">2</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-[#00a3e0]" />
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
            <span className="help-icon" title="We'll send your quote and any special offers to this email">?</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="form-input"
          />
        </div>

        {/* Phone Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Phone Number</label>
            <span className="optional-label">(Optional)</span>
            <span className="help-icon" title="For quick updates about your warranty application">?</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="form-input"
          />
        </div>

        {/* Skip Notice */}
        <div className="skip-notice mb-8">
          <p>
            Prefer to skip? No problem — you can still see your prices and complete your purchase.
          </p>
        </div>

        {/* Button Group */}
        <div className="button-group">
          <button 
            type="button" 
            onClick={onBack}
            className="btn-secondary flex-1"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </button>
          <button 
            type="button" 
            onClick={handleSkip}
            className="btn-secondary flex-1"
          >
            Skip for now
          </button>
          <button 
            type="submit" 
            className="btn-cta flex-1"
          >
            Get My Quote
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactDetailsStep;
