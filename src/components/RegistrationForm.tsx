
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Car, Info, Phone, Mail } from 'lucide-react';
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
      // Simulate vehicle lookup
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
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full font-bold text-lg">
              1
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Car</h2>
              <p className="text-gray-600">Let's start with your vehicle details</p>
            </div>
            <Car className="w-8 h-8 text-blue-500 ml-auto" />
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleRegSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Label htmlFor="regNumber" className="text-lg font-semibold text-gray-700">
                      Car registration number
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter your vehicle's registration number as shown on your number plate</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {/* Yellow UK Number Plate Style */}
                  <div className="bg-yellow-400 border-2 border-yellow-500 rounded-lg p-4 text-center mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">GB</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">🇪🇺</div>
                      </div>
                      <Input
                        id="regNumber"
                        type="text"
                        value={regNumber}
                        onChange={handleRegChange}
                        placeholder="AB12 CDE"
                        className="bg-transparent border-none text-2xl font-bold text-center tracking-wider text-black placeholder:text-gray-600 focus:ring-0 focus:border-none"
                        style={{ boxShadow: 'none' }}
                        required
                      />
                      <div className="w-8"></div>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg"
                    onClick={() => setVehicleFound(true)}
                    disabled={!regNumber}
                  >
                    Find my car
                  </Button>
                </div>

                {vehicleFound && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Car className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-800">We found the following car</span>
                    </div>
                    <p className="text-gray-700 mb-3">AUDI A3 SE TDI 105 - 3 door - 1598cc - Diesel - Manual (2012-2014)</p>
                    <Button variant="outline" className="w-full">
                      This is not my car
                    </Button>
                  </div>
                )}

                {vehicleFound && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Label htmlFor="mileage" className="text-lg font-semibold text-gray-700">
                        What's your approximate mileage?
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-blue-500" />
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
                      className="text-lg p-4"
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
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-4"
                    disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full font-bold text-lg">
            2
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Contact Details</h2>
            <p className="text-gray-600">Stay connected for exclusive deals</p>
          </div>
          <Mail className="w-8 h-8 text-blue-500 ml-auto" />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <h3 className="text-xl font-bold">Want a copy of your quote?</h3>
            <p className="text-blue-100 text-sm">
              Get access to special discounts and your quote details. No spam. No sharing. Just real value.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label htmlFor="email" className="text-lg font-semibold text-gray-700">Email Address</Label>
                  <span className="text-sm text-gray-500">(Optional)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-blue-500" />
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
                  className="text-lg p-4"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">Phone Number</Label>
                  <span className="text-sm text-gray-500">(Optional)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-blue-500" />
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
                  className="text-lg p-4"
                />
              </div>

              <p className="text-sm text-gray-500 text-center bg-gray-50 p-4 rounded-lg">
                Prefer to skip? No problem — you can still see your prices and complete your purchase.
              </p>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackToStep1}
                  className="flex-1 py-3 text-lg"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleFinalSubmit(new Event('submit') as any)}
                  className="flex-1 py-3 text-lg"
                >
                  Skip for now
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-lg py-3"
                >
                  Get My Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationForm;
