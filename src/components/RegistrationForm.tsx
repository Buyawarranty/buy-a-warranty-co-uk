
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Car, Info, Phone, Mail, User } from 'lucide-react';
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
      <div className="bg-[#e8f4fb] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Step Header - Swinton Style */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-[#0066cc] text-white rounded-full font-bold text-lg">
                1
              </div>
              <div className="flex items-center gap-3">
                <Car className="w-6 h-6 text-[#0066cc]" />
                <h2 className="text-2xl font-normal text-gray-800">Your Car</h2>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleRegSubmit} className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Label htmlFor="regNumber" className="text-lg font-normal text-gray-700">
                    Car registration number
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-[#0066cc] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter your vehicle's registration number as shown on your number plate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Swinton-style Number Plate */}
                <div className="bg-[#ffd700] border border-[#d4af37] rounded-md p-4 mb-4 max-w-xs mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-4 bg-[#003399] rounded-sm flex items-center justify-center mb-1">
                        <span className="text-white text-xs font-bold">GB</span>
                      </div>
                      <div className="text-xs text-[#003399]">🇪🇺</div>
                    </div>
                    <Input
                      id="regNumber"
                      type="text"
                      value={regNumber}
                      onChange={handleRegChange}
                      placeholder="AB12 CDE"
                      className="bg-transparent border-none text-xl font-bold text-center tracking-widest text-black placeholder:text-gray-600 focus:ring-0 focus:border-none shadow-none"
                      required
                    />
                    <div className="w-6"></div>
                  </div>
                </div>

                <Button 
                  type="button" 
                  className="w-full bg-[#87ceeb] hover:bg-[#7bb8d4] text-black font-normal py-3 text-base border-none shadow-none"
                  onClick={() => setVehicleFound(true)}
                  disabled={!regNumber}
                >
                  Find my car
                </Button>
              </div>

              {vehicleFound && (
                <div className="bg-[#f0f8ff] border border-[#b3d9ff] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-5 h-5 text-[#0066cc]" />
                    <span className="font-medium text-[#0066cc]">We found the following car</span>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm">AUDI A3 SE TDI 105 - 3 door - 1598cc - Diesel - Manual (2012-2014)</p>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm font-normal border-[#0066cc] text-[#0066cc] hover:bg-[#f0f8ff]"
                  >
                    This is not my car
                  </Button>
                </div>
              )}

              {vehicleFound && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Label htmlFor="mileage" className="text-lg font-normal text-gray-700">
                      What's your approximate mileage?
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-[#0066cc] cursor-help" />
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
                    className="text-base p-4 border-gray-300 focus:border-[#0066cc] focus:ring-[#0066cc]"
                    max="150000"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We can only provide warranty for vehicles with a maximum mileage of 150,000
                  </p>
                </div>
              )}

              {vehicleFound && (
                <Button 
                  type="submit" 
                  className="w-full bg-[#ff6b35] hover:bg-[#e55a2e] text-white text-base font-normal py-4"
                  disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e8f4fb] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Header - Swinton Style */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 bg-[#0066cc] text-white rounded-full font-bold text-lg">
              2
            </div>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-[#0066cc]" />
              <h2 className="text-2xl font-normal text-gray-800">You</h2>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-800 mb-2">Want a copy of your quote?</h3>
            <p className="text-gray-600 text-sm">
              Get access to special discounts and your quote details. No spam. No sharing. Just real value.
            </p>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label htmlFor="email" className="text-base font-normal text-gray-700">Email Address</Label>
                <span className="text-sm text-gray-500">(Optional)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-[#0066cc] cursor-help" />
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
                className="text-base p-4 border-gray-300 focus:border-[#0066cc] focus:ring-[#0066cc]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Label htmlFor="phone" className="text-base font-normal text-gray-700">Phone Number</Label>
                <span className="text-sm text-gray-500">(Optional)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-[#0066cc] cursor-help" />
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
                className="text-base p-4 border-gray-300 focus:border-[#0066cc] focus:ring-[#0066cc]"
              />
            </div>

            <div className="bg-[#f8f9fa] rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                Prefer to skip? No problem — you can still see your prices and complete your purchase.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackToStep1}
                className="flex-1 py-3 text-base font-normal border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleFinalSubmit(new Event('submit') as any)}
                className="flex-1 py-3 text-base font-normal border-gray-300 hover:bg-gray-50"
              >
                Skip for now
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2e] text-white text-base font-normal py-3"
              >
                Get My Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
