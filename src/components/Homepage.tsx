import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap } from 'lucide-react';
import HomepageFAQ from './HomepageFAQ';
import WebsiteFooter from './WebsiteFooter';

interface HomepageProps {
  onRegistrationSubmit: (regNumber: string) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onRegistrationSubmit }) => {
  const [regNumber, setRegNumber] = useState('');

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

  const handleEnterReg = () => {
    if (regNumber.trim()) {
      onRegistrationSubmit(regNumber);
    }
  };

  const handleGetQuote = () => {
    if (regNumber.trim()) {
      onRegistrationSubmit(regNumber);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                alt="Buy a Warranty" 
                className="h-8 w-auto"
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">How it Works</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">What's Covered</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Make a Claim</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">FAQ</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Contact Us</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600"
              >
                WhatsApp Us
              </Button>
              <Button 
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Get My Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Indicators */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  <span>Reliable Protection</span>
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  <span>No Hidden Costs</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                  We've got you covered
                  <br />
                  <span className="text-orange-500">in 60 Seconds!</span>
                </h1>
              </div>

              {/* Benefits */}
              <div className="flex items-center space-x-6 text-gray-700">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>from only £12/month</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Unlimited claims</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>Fast payout</span>
                </div>
              </div>

              {/* Registration Input */}
              <div className="space-y-4">
                <div className="flex items-center bg-yellow-400 text-gray-900 font-bold text-xl px-6 py-4 rounded-lg border-2 border-black shadow-sm max-w-md animate-[breathing_12s_ease-in-out_infinite]">
                  <img 
                    src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                    alt="UK Flag" 
                    className="w-8 h-6 mr-4 object-cover rounded-sm"
                  />
                  <input
                    type="text"
                    value={regNumber}
                    onChange={handleRegChange}
                    placeholder="Enter your reg"
                    className="bg-transparent border-none outline-none text-xl text-gray-900 flex-1 font-bold placeholder:text-gray-600"
                    maxLength={8}
                  />
                </div>

                {/* Mileage Input */}
                <div className="space-y-2">
                  <label className="text-lg font-semibold text-gray-700">
                    What's your approximate mileage?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 32,000"
                    className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                  <p className="text-sm text-gray-600">
                    Cover for vehicles up to 150,000 miles and 15 years old
                  </p>
                </div>

                <Button 
                  onClick={handleGetQuote}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-lg w-full max-w-md"
                  disabled={!regNumber.trim()}
                >
                  Get my quote →
                </Button>
              </div>

              {/* Trustpilot */}
              <div className="flex items-center">
                <a 
                  href="https://uk.trustpilot.com/review/buyawarranty.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  <img 
                    src="/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png" 
                    alt="Trustpilot 5 stars" 
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/c125ffa7-1dbd-4dd3-9223-30e694c05b05.png" 
                alt="Panda mascot with cars and motorcycle" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Extended Warranty Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Video/Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/cacd3333-06fb-4bfb-b8f8-32505122c11d.png" 
                alt="Extended warranty explainer video" 
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Extended Warranty.
                  <br />
                  <span className="text-[#eb4b00]">Avoid Costly Repairs</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Protect your vehicle from unexpected repairs with our comprehensive warranty plans. 
                  Get covered quickly and easily with no hidden fees.
                </p>
              </div>

              <Button 
                className="bg-[#6B46C1] hover:bg-[#553C9A] text-white font-bold px-8 py-4 rounded-lg text-lg"
              >
                Start Cover
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 - Enter Your Reg Plate */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#eb4b00] text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Enter Your <span className="text-[#eb4b00]">Reg Plate!</span>
                </h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Get an instant quote by entering your vehicle registration number. 
                Our system will automatically look up your vehicle details and show 
                you available warranty options tailored to your car.
              </p>

              <div className="bg-[#eb4b00] text-white p-4 rounded-lg">
                <p className="font-semibold">Quick & Easy Process</p>
                <p className="text-sm">No lengthy forms - just your reg plate and mileage!</p>
              </div>
            </div>

            {/* Right - Panda with car */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" 
                alt="Panda mascot with vehicle" 
                className="w-full h-auto max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 - Choose Your Plan */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Panda with badges */}
            <div className="relative text-center">
              <div className="relative inline-block">
                <img 
                  src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" 
                  alt="Panda mascot" 
                  className="w-full h-auto max-w-md mx-auto"
                />
                
                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 bg-[#eb4b00] text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
                  Monthly
                </div>
                <div className="absolute -top-8 right-4 bg-[#eb4b00] text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
                  Yearly  
                </div>
                <div className="absolute top-8 -right-8 bg-[#eb4b00] text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-6">
                  1,2,3 Years
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#eb4b00] text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  <span className="text-[#eb4b00]">Choose Your Plan</span>
                </h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Select from our range of comprehensive warranty plans. Choose between 
                £2,000 or £5,000 claim limits, and decide whether to pay monthly or 
                annually. All plans include unlimited claims with no excess to pay.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Flexible payment options</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">No excess charges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited claims</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 - Drive With Confidence */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#eb4b00] text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Drive With Confidence –
                  <br />
                  <span className="text-[#eb4b00]">You're Covered</span>
                </h2>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Once you're covered, drive with complete peace of mind. If something 
                goes wrong, simply call our claims team and we'll take care of everything. 
                No upfront costs, no hassle.
              </p>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-green-800">You're Protected!</span>
                </div>
                <p className="text-green-700 text-sm">
                  Your warranty is now active and ready to protect your vehicle.
                </p>
              </div>
            </div>

            {/* Right - Panda with car and EV charger */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/9e567a00-ce64-4eeb-912d-29deacaf4568.png" 
                alt="Panda with car and EV charging station" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Up to 150,000 Miles Section */}
      <section className="py-16 bg-[#1E3A8A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">
              Up To 150,000 Miles And <span className="text-[#eb4b00]">15 Years Old.</span>
            </h2>
            
            <Button 
              className="bg-[#eb4b00] hover:bg-[#d63f00] text-white font-bold px-8 py-4 text-lg rounded-lg"
            >
              Get Instant Quote
            </Button>

            <div className="mt-12">
              <img 
                src="/lovable-uploads/c125ffa7-1dbd-4dd3-9223-30e694c05b05.png" 
                alt="Panda with laptop and car" 
                className="w-full h-auto max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Get Help With A Repair Section */}
      <section className="py-16 bg-[#1E1B4B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold">
              Get Help With A <span className="text-[#eb4b00]">Repair</span>
            </h2>
            
            <Button 
              className="bg-[#eb4b00] hover:bg-[#d63f00] text-white font-bold px-8 py-4 text-lg rounded-lg"
            >
              Make A Claim
            </Button>

            <div className="mt-12">
              <img 
                src="/lovable-uploads/c125ffa7-1dbd-4dd3-9223-30e694c05b05.png" 
                alt="Panda with repair services" 
                className="w-full h-auto max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Big Repairs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Big Repairs, Low Monthly Cost.
                <br />
                <span className="text-[#eb4b00]">Shield Your Car From Costly Repairs</span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                Don't let unexpected repair bills catch you off guard. Our warranty plans 
                provide comprehensive protection at an affordable monthly cost.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">No Excess:</span>
                    <span className="text-gray-600 ml-1">Never pay a penny towards covered repairs</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Unlimited Claims:</span>
                    <span className="text-gray-600 ml-1">Claim as many times as you need</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Fast Claims:</span>
                    <span className="text-gray-600 ml-1">Quick approval and payment process</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Nationwide Coverage:</span>
                    <span className="text-gray-600 ml-1">Repairs at approved garages across the UK</span>
                  </div>
                </div>
              </div>

              <Button 
                className="bg-[#eb4b00] hover:bg-[#d63f00] text-white font-bold px-8 py-4 text-lg rounded-lg"
              >
                See How Much I Can Save
              </Button>
            </div>

            {/* Right - Panda with garage */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" 
                alt="Panda mascot with repair garage" 
                className="w-full h-auto max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomepageFAQ />

      {/* Footer */}
      <WebsiteFooter />
    </div>
  );
};

export default Homepage;