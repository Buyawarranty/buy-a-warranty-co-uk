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
      <section className="py-12 md:py-20 bg-brand-gray-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Video */}
            <div className="relative aspect-video">
              <iframe 
                src="https://www.youtube.com/embed/G9QuVoxckbw" 
                title="Extended warranty explainer video"
                className="w-full h-full rounded-md shadow-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight mb-4 md:mb-6">
                  Extended Warranty.
                  <br />
                  <span className="text-brand-orange">Avoid Costly Repairs</span>
                </h2>
                <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                  Protect your vehicle from unexpected repairs with our comprehensive warranty plans. 
                  No hidden fees. No nonsense.
                </p>
              </div>

              <button className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto">
                Start Cover
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 - Enter Your Reg Plate */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="mb-4 md:mb-6">
                <div className="inline-block bg-brand-orange text-white px-3 md:px-4 py-2 rounded text-sm font-bold mb-3 md:mb-4">
                  Step 1
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  Enter Your <span className="text-brand-orange">Reg Plate!</span>
                </h2>
              </div>
              
              <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                Get an instant quote by entering your vehicle registration number. 
                Our system will automatically look up your vehicle details and show 
                you available warranty options tailored to your car.
              </p>
            </div>

            {/* Right - Panda with vehicles */}
            <div className="relative text-center order-1 lg:order-2">
              <img 
                src="/lovable-uploads/53a6f4f0-3302-4124-9cf6-ba1915daa8f1.png" 
                alt="Panda mascot with various vehicles" 
                className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 - Choose Your Plan */}
      <section className="py-12 md:py-20 bg-brand-gray-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Panda with plan badges */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/c7cd8118-a835-41a0-befa-88809afcde40.png" 
                alt="Panda mascot with Monthly, Yearly, 1,2,3 Years options" 
                className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="mb-4 md:mb-6">
                <div className="inline-block bg-brand-orange text-white px-3 md:px-4 py-2 rounded text-sm font-bold mb-3 md:mb-4">
                  Step 2
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  <span className="text-brand-orange">Choose Your Plan</span>
                </h2>
              </div>
              
              <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                Select from our range of flexible protection plans. Choose between 
                different claim limits and decide whether to pay monthly or 
                annually. All plans include comprehensive coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 - Drive With Confidence */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="mb-4 md:mb-6">
                <div className="inline-block bg-brand-orange text-white px-3 md:px-4 py-2 rounded text-sm font-bold mb-3 md:mb-4">
                  Step 3
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  Drive With Confidence –
                  <br />
                  <span className="text-brand-orange">You're Covered</span>
                </h2>
                <div className="mt-3 md:mt-4 text-lg md:text-2xl font-bold text-brand-deep-blue">
                  Up To 150,000 Miles And <span className="text-brand-orange">15 Years Old</span>
                </div>
              </div>
              
              <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                Once you're covered, drive with complete peace of mind. If something 
                goes wrong, simply call our claims team and we'll take care of everything. 
                No upfront costs, no hassle.
              </p>

              <button className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto">
                Get Instant Quote
              </button>
            </div>

            {/* Right - Panda with warranty active */}
            <div className="relative text-center order-1 lg:order-2">
              <img 
                src="/lovable-uploads/dac1df61-e069-48d7-bfb0-6cc26bc3e816.png" 
                alt="Panda with EV charging station - Warranty Active" 
                className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Showcase Section */}
      <section className="py-12 md:py-20 bg-brand-gray-bg text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trustpilot Rating */}
          <div className="flex justify-center items-center mb-6 md:mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-base md:text-lg font-bold">★ Trustpilot</span>
              <div className="flex text-green-500">
                <span>★★★★★</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-5xl font-bold text-brand-deep-blue mb-4 md:mb-6 px-4">
            Up To 150,000 Miles And <span className="text-brand-orange">15 Years Old.</span>
          </h2>

          {/* CTA Button */}
          <button className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-lg shadow-lg transition-colors mb-8 md:mb-16 w-full sm:w-auto">
            Get Instant Quote
          </button>

          {/* Warranty Quote Mockup */}
          <div className="relative max-w-2xl md:max-w-3xl mx-auto">
            <img 
              src="/lovable-uploads/8ed3b647-1683-4655-834b-40c98ddea286.png" 
              alt="Warranty quote interface with panda mascot and car" 
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Get Help With A Repair Section */}
      <section className="py-12 md:py-20 bg-brand-deep-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">
            Get Help With A <span className="text-brand-orange">Repair</span>
          </h2>
          
          <button className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto">
            Make A Claim
          </button>
        </div>
      </section>

      {/* Big Repairs, Low Monthly Cost Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Panda with garage */}
            <div className="relative text-center">
              <img 
                src="/lovable-uploads/23670d98-259a-4eb2-82e6-8e55a7cfa9af.png" 
                alt="Panda mascot with repair garage" 
                className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                Big Repairs, Low Monthly Cost.
                <br />
                <span className="text-brand-orange">Shield Your Car From Costly Repairs</span>
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-base md:text-lg text-brand-dark-text">Instantly Activated:</span>
                    <span className="text-brand-dark-text ml-2 text-base md:text-lg">Coverage starts immediately</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-base md:text-lg text-brand-dark-text">Unlimited Claims:</span>
                    <span className="text-brand-dark-text ml-2 text-base md:text-lg">Claim as many times as you need</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-base md:text-lg text-brand-dark-text">Fast Claims:</span>
                    <span className="text-brand-dark-text ml-2 text-base md:text-lg">Quick approval and payment process</span>
                  </div>
                </div>
              </div>

              <button className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto">
                See How Much I Can Save
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomepageFAQ />
    </div>
  );
};

export default Homepage;