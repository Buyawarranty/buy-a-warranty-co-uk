
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Car, Info, User, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RegistrationFormProps {
  onNext: (data: { regNumber: string; mileage: string; email?: string; phone?: string }) => void;
  onBack?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNext, onBack }) => {
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleFound, setVehicleFound] = useState(false);

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNumber && mileage) {
      setVehicleFound(true);
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ regNumber, mileage, email: email || undefined, phone: phone || undefined });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setVehicleFound(false);
  };

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

  if (currentStep === 1) {
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

        <form onSubmit={handleRegSubmit} className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <label className="form-label">Car registration number</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="help-icon" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter your vehicle's registration number as shown on your number plate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Swinton-style Registration Plate */}
            <div className="reg-plate-container">
              <div className="reg-plate-box">
                <div className="flag">
                  <span className="text-white text-xs font-bold">GB</span>
                </div>
                <Input
                  id="regNumber"
                  type="text"
                  value={regNumber}
                  onChange={handleRegChange}
                  placeholder="AB12 CDE"
                  className="reg-input"
                  required
                />
              </div>
            </div>

            <button 
              type="button" 
              className="btn-primary w-full"
              onClick={() => setVehicleFound(true)}
              disabled={!regNumber}
            >
              Find my car
            </button>
          </div>

          {vehicleFound && (
            <div className="vehicle-found-card">
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-5 h-5 text-[#00a3e0]" />
                <span className="font-semibold text-[#00a3e0]">We found the following car</span>
              </div>
              <p className="vehicle-details">AUDI A3 SE TDI 105 - 3 door - 1598cc - Diesel - Manual (2012-2014)</p>
              <button className="btn-secondary w-full">
                This is not my car
              </button>
            </div>
          )}

          {vehicleFound && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <label className="form-label">What's your approximate mileage?</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="help-icon" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter your current mileage as shown on your odometer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="32000"
                className="form-input"
                max="150000"
                required
              />
              <p className="field-hint">
                We can only provide warranty for vehicles with a maximum mileage of 150,000
              </p>
            </div>
          )}

          {vehicleFound && (
            <button 
              type="submit" 
              className="btn-cta w-full"
              disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
            >
              Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    );
  }

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

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="form-label">Email Address</label>
            <span className="optional-label">(Optional)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="help-icon" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>We'll send your quote and any special offers to this email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="form-input"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="form-label">Phone Number</label>
            <span className="optional-label">(Optional)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="help-icon" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>For quick updates about your warranty application</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07123 456789"
            className="form-input"
          />
        </div>

        <div className="skip-notice">
          <p>
            Prefer to skip? No problem — you can still see your prices and complete your purchase.
          </p>
        </div>

        <div className="button-group">
          <button 
            type="button" 
            onClick={handleBackToStep1}
            className="btn-secondary flex-1"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </button>
          <button 
            type="button" 
            onClick={() => handleFinalSubmit(new Event('submit') as any)}
            className="btn-secondary flex-1"
          >
            Skip for now
          </button>
          <button 
            type="submit" 
            className="btn-cta flex-1"
          >
            Get My Quote
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
