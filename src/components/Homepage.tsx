import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap } from 'lucide-react';

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
                Warranty Log in
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
                <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  We've Got You
                  <br />
                  Covered
                  <br />
                  <span className="text-orange-500">In 60 Seconds!</span>
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
                <div className="flex items-center bg-yellow-400 text-gray-900 font-bold text-xl px-6 py-4 rounded-lg border-2 border-black shadow-sm max-w-md">
                  <img 
                    src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
                    alt="UK Flag" 
                    className="w-8 h-6 mr-4 object-cover rounded-sm"
                  />
                  <input
                    type="text"
                    value={regNumber}
                    onChange={handleRegChange}
                    placeholder="ENTER REG"
                    className="bg-transparent border-none outline-none text-xl text-gray-900 flex-1 font-bold placeholder:text-gray-700"
                    maxLength={8}
                  />
                </div>

                <Button 
                  onClick={handleGetQuote}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-lg"
                  disabled={!regNumber.trim()}
                >
                  Get My Quote
                </Button>
              </div>

              {/* Trustpilot */}
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png" 
                  alt="Trustpilot 5 stars" 
                  className="h-8 w-auto"
                />
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/2fb08882-4b90-4c73-b8b1-7d270c83aa5f.png" 
                alt="Panda mascot with cars and motorcycle" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Extended Warranty Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Video/Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/cacd3333-06fb-4bfb-b8f8-32505122c11d.png" 
                alt="Video thumbnail showing people" 
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Extended Warranty.
                  <br />
                  <span className="text-orange-500">Avoid Costly Repairs</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Protect your vehicle from unexpected repairs with flexible, 
                  affordable warranty plans. Get covered in under 60 seconds. No 
                  hidden fees. No nonsense.
                </p>
              </div>

              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg"
              >
                Get My Cover
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Panda with badges */}
            <div className="relative text-center">
              <div className="relative inline-block">
                {/* Panda mascot */}
                <img 
                  src="/lovable-uploads/2d9a5fef-db12-4eb3-927b-bb28108b055c.png" 
                  alt="Panda mascot" 
                  className="w-80 h-auto mx-auto"
                />
                
                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
                  Monthly
                </div>
                <div className="absolute -top-8 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
                  Yearly
                </div>
                <div className="absolute top-8 -right-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-6">
                  1,2,3 Years
                </div>
              </div>
            </div>

            {/* Right - Benefits list */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Why Choose <span className="text-orange-500">Buy a Warranty?</span>
              </h2>
              
              <p className="text-gray-600 mb-6">Never leave pay a penny towards repairs.</p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Unlimited Claims:</span>
                    <span className="text-gray-600 ml-1">Claim as many times as you need.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Comprehensive Coverage:</span>
                    <span className="text-gray-600 ml-1">From engine to electrics.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Free MOT Test:</span>
                    <span className="text-gray-600 ml-1">We pay your MOT test fee.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Recovery:</span>
                    <span className="text-gray-600 ml-1">Claim-back recovery costs.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Nationwide Repairs:</span>
                    <span className="text-gray-600 ml-1">Repairs at trusted garages nationwide, ATS, Kwik Fit.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Flexible Plans:</span>
                    <span className="text-gray-600 ml-1">Available on 1, 2, or 3 year plans and monthly 0% APR Options.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Do We Cover Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                What Do We <span className="text-orange-500">Cover?</span>
              </h2>
              
              <p className="text-gray-600 mb-6">Our warranty includes:</p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Mechanical & Electrical Components:</span>
                    <span className="text-gray-600 ml-1">Engine, gearbox, clutch, turbo, drivetrain, suspension, steering, braking systems, fuel, cooling, emissions systems, ECUs, electrical, driver assistance tech, oil conditioning, aircon, multimedia systems.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Diagnostics & Fault-Finding:</span>
                    <span className="text-gray-600 ml-1">Comprehensive diagnostic coverage.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Consequential Damage:</span>
                    <span className="text-gray-600 ml-1">Protection against related damages.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Labour Costs:</span>
                    <span className="text-gray-600 ml-1">Labour costs covered.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Claim Limits:</span>
                    <span className="text-gray-600 ml-1">£2000 or £5,000 per claim.</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Protect Your Vehicle <span className="text-orange-500">Today!</span>
                </h3>
                <p className="text-gray-600 text-sm">
                  Whether you drive an old or more reliable breakdown, Buy a Warranty offers the 
                  protection you need. Get covered in 1 minute and enjoy peace of mind on 
                  the road.
                </p>
              </div>
            </div>

            {/* Right - Panda with car and warranty badge */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/9e567a00-ce64-4eeb-912d-29deacaf4568.png" 
                alt="Panda with car and warranty active badge" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400">Home</a></li>
                <li><a href="#" className="hover:text-orange-400">Make a Claim</a></li>
                <li><a href="#" className="hover:text-orange-400">Warranty for Car</a></li>
                <li><a href="#" className="hover:text-orange-400">Warranty for Van</a></li>
                <li><a href="#" className="hover:text-orange-400">Warranty for Motorbikes UK</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Need Help */}
            <div>
              <h3 className="font-bold text-lg mb-4">Need Help?</h3>
              <div className="space-y-2 text-sm">
                <p>Call us:</p>
                <p className="text-orange-400 font-bold text-lg">0330 229 5040</p>
                <p>or</p>
                <p className="text-orange-400 font-bold text-lg">0330 229 5045</p>
                <p>Email us directly:</p>
                <a href="mailto:info@buyawarranty.co.uk" className="text-orange-400 hover:underline">
                  info@buyawarranty.co.uk
                </a>
              </div>
            </div>

            {/* Looking for new warranty provider */}
            <div>
              <h3 className="font-bold text-lg mb-4">Looking for a new warranty provider?</h3>
              <p className="text-sm text-gray-300">
                We make vehicle warranty simple, fast, and more affordable. With us you can find 
                different types of comprehensive car and van warranty insurance, so whether you 
                drive an older, SUV, or motorcycle - if it's under 15 years old, 
                we've got you covered.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;