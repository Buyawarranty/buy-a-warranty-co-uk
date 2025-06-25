
import React, { useState, useEffect } from 'react';
import { User, ArrowLeft } from 'lucide-react';

interface ContactDetailsStepProps {
  onNext: (data: { email: string; phone: string; fullName: string; address: string }) => void;
  onBack: () => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
    fullName?: string;
    address?: string;
  };
}

const ContactDetailsStep: React.FC<ContactDetailsStepProps> = ({ onNext, onBack, initialData }) => {
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [address, setAddress] = useState(initialData?.address || '');

  useEffect(() => {
    // Load Google Places API
    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBeDTodaQuqY9MdfKBSJK1Y1ieyfn3HoTs&libraries=places`;
      script.async = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      const addressInput = document.getElementById('address-input') as HTMLInputElement;
      if (addressInput && window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
          types: ['address'],
          componentRestrictions: { country: 'GB' }
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
          }
        });
      }
    };

    loadGooglePlaces();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && phone && fullName && address) {
      onNext({ 
        email, 
        phone,
        fullName,
        address
      });
    }
  };

  const isFormValid = email && phone && fullName && address;

  return (
    <div className="form-section-card">
      {/* Step Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6" style={{ color: '#224380' }} />
          <h2 className="step-title text-left">Now, let's find out about you 🤔</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="section-subtitle">Your personal details</h3>
        <p className="section-description">
          We need these details to provide you with your personalized quote and warranty information.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Full Name</label>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="Your full name as it appears on official documents"
            >
              ?
            </span>
          </div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
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

        {/* Address Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Address</label>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="Your home address for warranty registration"
            >
              ?
            </span>
          </div>
          <input
            id="address-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Start typing your address..."
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

        {/* Email Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Email Address</label>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="We'll send your quote and warranty documents to this email"
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
            required
          />
        </div>

        {/* Phone Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label className="form-label">Phone Number</label>
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
            required
          />
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
            type="submit" 
            disabled={!isFormValid}
            className="flex-1 text-white text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isFormValid ? '#eb4b00' : '#e5e7eb',
              borderColor: isFormValid ? '#eb4b00' : '#d1d5db'
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
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactDetailsStep;
