
import React, { useState } from 'react';
import { Car } from 'lucide-react';

interface VehicleDetailsStepProps {
  onNext: (data: { regNumber: string; mileage: string }) => void;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ onNext }) => {
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [vehicleFound, setVehicleFound] = useState(false);

  const formatRegNumber = (value: string) => {
    const formatted = value.replace(/\s/g, '').toUpperCase();
    if (formatted.length > 3) {
      return formatted.slice(0, -3) + ' ' + formatted.slice(-3);
    }
    return formatted;
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) {
      setRegNumber(formatted);
    }
  };

  const handleFindCar = () => {
    if (regNumber) {
      setVehicleFound(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNumber && mileage) {
      onNext({ regNumber, mileage });
    }
  };

  return (
    <div className="form-section-card">
      {/* Step Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="step-circle">
          <span className="step-number">1</span>
        </div>
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-[#00a3e0]" />
          <h2 className="step-title">Your Car</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Registration Number Field */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <label className="form-label">Car registration number</label>
            <span className="help-icon" title="Enter your vehicle's registration number as shown on your number plate">?</span>
          </div>
          
          {/* UK Registration Plate - Exact Match */}
          <div className="reg-plate-container">
            <div className="reg-plate-box">
              <div className="flag-section">
                <div className="eu-stars">★★★★★★</div>
                <div className="eu-stars">★★★★★★</div>
                <div className="gb-text">GB</div>
              </div>
              <input
                type="text"
                value={regNumber || 'YOUR REG'}
                onChange={handleRegChange}
                placeholder="YOUR REG"
                className="reg-input"
                maxLength={8}
              />
            </div>
          </div>

          <button 
            type="button" 
            className="btn-primary w-full"
            onClick={handleFindCar}
            disabled={!regNumber}
          >
            Find my car
          </button>
        </div>

        {/* Vehicle Found Card */}
        {vehicleFound && (
          <div className="vehicle-found-card mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Car className="w-5 h-5 text-[#00a3e0]" />
              <span className="font-semibold text-[#00a3e0]">We found the following car</span>
            </div>
            <p className="vehicle-details">AUDI A3 SE TDI 105 - 3 door - 1598cc - Diesel - Manual (2012-2014)</p>
            <button type="button" className="btn-secondary w-full mt-3">
              This is not my car
            </button>
          </div>
        )}

        {/* Mileage Field */}
        {vehicleFound && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <label className="form-label">What's your approximate mileage?</label>
              <span className="help-icon" title="Enter your current mileage as shown on your odometer">?</span>
            </div>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="32000"
              className="form-input"
              max="150000"
            />
            <p className="field-hint">
              We can only provide warranty for vehicles with a maximum mileage of 150,000
            </p>
          </div>
        )}

        {/* Continue Button */}
        {vehicleFound && (
          <button 
            type="submit" 
            className="btn-cta w-full"
            disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
          >
            Continue
          </button>
        )}
      </form>
    </div>
  );
};

export default VehicleDetailsStep;
