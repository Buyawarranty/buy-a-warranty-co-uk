
import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface VehicleDetailsStepProps {
  onNext: (data: { regNumber: string; mileage: string }) => void;
  onBack: (step: number) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
  };
  onFormDataUpdate: (data: Partial<{ regNumber: string; mileage: string }>) => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ 
  onNext, 
  onBack, 
  initialData,
  onFormDataUpdate 
}) => {
  const [regNumber, setRegNumber] = useState(initialData?.regNumber || '');
  const [mileage, setMileage] = useState(initialData?.mileage || '');
  const isFormValid = !!regNumber && !!mileage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext({ regNumber, mileage });
    }
  };

  return (
    <div className="form-section-card">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-8">
        <div 
          className="flex items-center justify-center w-8 h-8 text-white rounded-full font-bold"
          style={{ backgroundColor: '#224380' }}
        >
          <span>1</span>
        </div>
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6" style={{ color: '#224380' }} />
          <h2 className="step-title">Your Car</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Registration Number Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label htmlFor="regNumber" className="form-label">Registration Number</label>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="Enter your vehicle's registration number as shown on your number plate"
            >
              ?
            </span>
          </div>
          <div className="reg-plate-container">
            <div className="reg-plate-box">
              <div className="british-flag-section">
                <div className="union-jack">
                  <div className="flag-background"></div>
                  <div className="cross-diagonal-1"></div>
                  <div className="cross-diagonal-2"></div>
                  <div className="cross-vertical"></div>
                  <div className="cross-horizontal"></div>
                </div>
                <div className="gb-identifier">GB</div>
              </div>
              <input
                id="regNumber"
                type="text"
                value={regNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length <= 8) {
                    setRegNumber(value);
                    onFormDataUpdate({ regNumber: value });
                  }
                }}
                placeholder="AB12 CDE"
                className="reg-input"
                required
              />
            </div>
          </div>
          {regNumber && (
            <div className="field-hint">
              Looking up vehicle details for <strong>{regNumber}</strong>...
            </div>
          )}
        </div>

        {/* Mileage Field */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <label htmlFor="mileage" className="form-label">Current Mileage</label>
            <span 
              className="inline-block ml-2 cursor-pointer text-sm w-5 h-5 rounded-full border-2 text-center leading-4 font-bold"
              style={{ 
                color: '#224380',
                borderColor: '#224380'
              }}
              title="Enter the current mileage shown on your odometer"
            >
              ?
            </span>
          </div>
          <input
            id="mileage"
            type="number"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value);
              onFormDataUpdate({ mileage: e.target.value });
            }}
            placeholder="e.g. 45000"
            className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none transition-all duration-200"
            onFocus={(e) => {
              e.target.style.borderColor = '#224380';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
            required
            min="0"
            max="999999"
          />
          <div className="field-hint">
            Enter your current mileage to get an accurate quote
          </div>
        </div>

        {/* Vehicle Found Card */}
        {regNumber && (
          <div className="vehicle-found-card mb-6">
            <h4 className="font-semibold mb-2" style={{ color: '#224380' }}>Vehicle Found</h4>
            <div className="vehicle-details">
              <p><strong>Registration:</strong> {regNumber}</p>
              <p><strong>Make:</strong> Volkswagen</p>
              <p><strong>Model:</strong> Golf</p>
              <p><strong>Year:</strong> 2019</p>
              <p><strong>Engine:</strong> 1.4L Petrol</p>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={!regNumber || !mileage}
            className="btn-cta animate-pulse-slow"
            style={{
              backgroundColor: isFormValid ? '#eb4b00' : '#ccc',
              borderColor: isFormValid ? '#eb4b00' : '#ccc',
              cursor: isFormValid ? 'pointer' : 'not-allowed'
            }}
          >
            Get My Quote
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleDetailsStep;
