
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRight, Car } from 'lucide-react';

interface RegistrationFormProps {
  onNext: (data: { regNumber: string; mileage: string; email?: string; phone?: string }) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNext }) => {
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNumber && mileage) {
      setCurrentStep(2);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ regNumber, mileage, email: email || undefined, phone: phone || undefined });
  };

  const formatRegNumber = (value: string) => {
    // Remove spaces and convert to uppercase
    const formatted = value.replace(/\s/g, '').toUpperCase();
    // Add space before last 3 characters if length > 3
    if (formatted.length > 3) {
      return formatted.slice(0, -3) + ' ' + formatted.slice(-3);
    }
    return formatted;
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) { // UK reg format max length
      setRegNumber(formatted);
    }
  };

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3Crect width='60' height='30' fill='%23012169'/%3E%3Cpath d='M0 0l60 30M60 0L0 30' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 0l60 30M60 0L0 30' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23fff' stroke-width='10'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23C8102E' stroke-width='6'/%3E%3C/svg%3E" alt="UK Flag" className="w-8 h-5" />
              <Car className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Enter Your Reg</h1>
            <p className="text-blue-100">Get your warranty quote in seconds</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegSubmit} className="space-y-6">
              <div>
                <Label htmlFor="regNumber" className="text-lg font-semibold text-gray-700">
                  Registration Number
                </Label>
                <Input
                  id="regNumber"
                  type="text"
                  value={regNumber}
                  onChange={handleRegChange}
                  placeholder="AB12 CDE"
                  className="mt-2 text-lg text-center font-mono tracking-wider"
                  required
                />
              </div>

              <div>
                <Label htmlFor="mileage" className="text-lg font-semibold text-gray-700">
                  What's your approximate mileage?
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="32000"
                  className="mt-2 text-lg"
                  max="150000"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  We can only provide warranty for vehicles with a maximum mileage of 150,000
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">Stay Connected for Exclusive Deals</h2>
          <p className="text-blue-100 text-sm">
            Want a copy of your quote or access to special discounts? No spam. No sharing. Just real value.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07123 456789"
                className="mt-1"
              />
            </div>

            <p className="text-sm text-gray-500 text-center">
              Prefer to skip? No problem — you can still see your prices.
            </p>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleFinalSubmit(new Event('submit') as any)}
                className="flex-1"
              >
                Skip
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Get Quote
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
