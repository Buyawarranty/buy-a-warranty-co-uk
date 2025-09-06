import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap, Car, Truck, Battery, Bike } from 'lucide-react';
import HomepageFAQ from './HomepageFAQ';
import WebsiteFooter from './WebsiteFooter';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MileageSlider from './MileageSlider';

interface VehicleData {
  regNumber: string;
  mileage: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
}

interface HomepageProps {
  onRegistrationSubmit: (vehicleData: VehicleData) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onRegistrationSubmit }) => {
  const { toast } = useToast();
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('0');
  const [sliderMileage, setSliderMileage] = useState(0);
  const [showMileageField, setShowMileageField] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [mileageError, setMileageError] = useState('');
  const [vehicleAgeError, setVehicleAgeError] = useState('');

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

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d,]/g, '');
    setMileage(value);
    
    // Update slider to match text input
    const numericValue = parseInt(value.replace(/,/g, ''));
    if (!isNaN(numericValue)) {
      setSliderMileage(numericValue);
    }
    
    // Validate mileage
    if (value && numericValue > 150000) {
      setMileageError('We can only cover vehicles up to 150,000 miles');
    } else {
      setMileageError('');
    }
  };

  const handleMileageFocus = () => {
    setMileage('');
    setSliderMileage(0);
  };

  const handleSliderChange = (value: number) => {
    setSliderMileage(value);
    setMileage(value.toLocaleString());
    
    // Validate mileage
    if (value > 150000) {
      setMileageError('We can only cover vehicles up to 150,000 miles');
    } else {
      setMileageError('');
    }
  };

  const handleEnterReg = () => {
    if (regNumber.trim()) {
      // This function is not used in the current flow
      // We go directly through handleGetQuote
    }
  };

  const handleGetQuote = async () => {
    // Check if registration number is entered
    if (!regNumber.trim()) {
      toast({
        title: "Registration Required",
        description: "Please enter your vehicle registration number.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if mileage is entered
    if (!mileage.trim()) {
      toast({
        title: "Mileage Required", 
        description: "Please enter your vehicle's mileage to continue.",
      });
      return;
    }
    
    // Check mileage validation before proceeding
    const numericMileage = parseInt(mileage.replace(/,/g, ''));
    if (numericMileage > 150000) {
      setMileageError('We can only cover vehicles up to 150,000 miles');
      return;
    }
    
    setIsLookingUp(true);
    
    try {
      console.log('Looking up vehicle:', regNumber);
      
      const { data, error } = await supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: regNumber }
      });

      if (error) {
        console.error('DVSA lookup error:', error);
        throw error;
      }

      console.log('DVSA lookup result:', data);
      
      // Check vehicle age if data found
      if (data?.found && data.yearOfManufacture) {
        const currentYear = new Date().getFullYear();
        const vehicleYear = parseInt(data.yearOfManufacture);
        const vehicleAge = currentYear - vehicleYear;
        
        if (vehicleAge > 15) {
          setVehicleAgeError('We cannot offer warranties for vehicles over 15 years old');
          setIsLookingUp(false);
          return;
        } else {
          setVehicleAgeError('');
        }
      }
      
      // Prepare vehicle data
      const vehicleData: VehicleData = {
        regNumber: regNumber,
        mileage: mileage.replace(/,/g, ''), // Remove commas for storage
      };

      // Add DVLA data if found
      if (data?.found) {
        vehicleData.make = data.make;
        vehicleData.model = data.model;
        vehicleData.fuelType = data.fuelType;
        vehicleData.transmission = data.transmission;
        vehicleData.year = data.yearOfManufacture;
        vehicleData.vehicleType = data.vehicleType || 'car';
      }

      // Submit to parent component
      onRegistrationSubmit(vehicleData);
      
    } catch (error: any) {
      console.error('Error looking up vehicle:', error);
      
      toast({
        title: "Lookup Failed",
        description: "Unable to find vehicle details, but you can still continue to get your quote.",
        variant: "destructive",
      });
      
      // Continue with basic vehicle data even if lookup fails
      const vehicleData: VehicleData = {
        regNumber: regNumber,
        mileage: mileage.replace(/,/g, ''),
      };
      
      onRegistrationSubmit(vehicleData);
    } finally {
      setIsLookingUp(false);
    }
  };

  const isFormValid = regNumber.trim() && mileage.trim() && !mileageError && !vehicleAgeError;

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
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Warranty Plans</a>
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
                Get my quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">


              {/* Main Headline */}
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
                  We{"'"}ve got you
                  <br />
                  covered
                  <br />
                  <span className="text-orange-500">in 60 seconds!</span>
                </h1>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-700">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium">From only £12/month</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium">Unlimited claims</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium">Fast payout</span>
                </div>
              </div>

              {/* Registration Input */}
              <div className="space-y-4 max-w-lg">
                <div className="flex items-stretch rounded-lg overflow-hidden shadow-lg border-2 border-black">
                  {/* UK Section with flag */}
                  <div className="bg-blue-600 text-white font-bold text-lg px-4 py-4 flex items-center justify-center min-w-[80px] h-[64px]">
                    <div className="flex flex-col items-center">
                      <div className="text-lg leading-tight mb-1">🇬🇧</div>
                      <div className="text-base font-bold leading-none">UK</div>
                    </div>
                  </div>
                  {/* Registration Input */}
                  <input
                    type="text"
                    value={regNumber}
                    onChange={handleRegChange}
                    placeholder="Enter reg"
                    className="bg-yellow-400 border-none outline-none text-xl text-black flex-1 font-bold placeholder:text-black/70 px-4 py-4 uppercase tracking-wider h-[64px]"
                    maxLength={8}
                  />
                </div>

                {/* Mileage Options - Always Visible */}
                <div className="space-y-4">
                  {/* Text Input Option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter approximate mileage
                    </label>
                    <input
                      type="text"
                      value={mileage}
                      onChange={handleMileageChange}
                      onFocus={handleMileageFocus}
                      placeholder="Enter mileage (e.g. 32,000)"
                      className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none ${
                        mileageError ? 'border-blue-400 focus:border-blue-500' : 'border-gray-300 focus:border-orange-500'
                      }`}
                    />
                  </div>


                  {/* Slider Option */}
                  <div>
                    <MileageSlider
                      value={sliderMileage}
                      onChange={handleSliderChange}
                      min={0}
                      max={150000}
                    />
                  </div>

                  {/* Error Messages */}
                  {mileageError && (
                    <p className="text-sm text-blue-600 font-medium">
                      {mileageError}
                    </p>
                  )}
                  {vehicleAgeError && (
                    <p className="text-sm text-blue-600 font-medium">
                      {vehicleAgeError}
                    </p>
                  )}
                </div>

{/* Get Quote Button */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleGetQuote}
                    className={`w-full px-12 h-[64px] text-xl font-bold rounded-lg transition-all animate-float-slow ${
                      isLookingUp
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                    disabled={isLookingUp}
                  >
                    {isLookingUp ? 'Looking up vehicle...' : 'Get my quote'}
                  </Button>
                  {!mileageError && !vehicleAgeError && (
                    <p className="text-sm text-gray-400 text-center">
                      Protection for vehicles up to 150,000 miles or 15 years.
                    </p>
                  )}
                </div>

                {/* Trustpilot */}
                <div className="flex items-center mt-6">
                  <span className="text-green-600 text-lg font-bold mr-2">★</span>
                  <span className="font-medium text-gray-700">Trustpilot</span>
                </div>
              </div>
            </div>

{/* Right Content - Hero Image */}
            <div className="relative">
              <img 
                src="/lovable-uploads/c9993cb7-e55a-47a3-936b-d5bb733e4d87.png" 
                alt="Panda mascot with cars and motorcycle" 
                className="w-full h-auto"
              />
              {/* Halfords Logo positioned to the right */}
              <div className="absolute top-4 right-0 z-10">
                <img 
                  src="/lovable-uploads/d5f9a604-cacf-42fd-9ab5-a387dedf8a3b.png" 
                  alt="Halfords Autocentre - Free MOT Test with Warranty plan" 
                  className="h-16 w-auto"
                />
              </div>
              
              {/* Vehicle Types positioned underneath the panda's feet */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center space-x-1">
                    <Car className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700 text-base">Cars</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700 text-base">Vans</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700 text-base">Hybrid</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700 text-base">EV</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bike className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-700 text-base">Motorbikes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Slogan Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            🔧 If it breaks, we'll fix it
          </h2>
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
                  Reliable extended warranty
                  <br />
                  <span className="text-brand-orange">If it breaks, we{"'"}ll fix it 🔧</span>
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

      {/* What's Included Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-brand-deep-blue">
              What's <span className="text-brand-orange">Included?</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl font-bold text-brand-dark-text leading-relaxed">
                Rest assured everything is covered. If it breaks, We'll fix it, No excuses.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark-text">Complete Protection</h3>
                <p className="text-brand-dark-text">Comprehensive coverage for all major components</p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark-text">Instant Claims</h3>
                <p className="text-brand-dark-text">Quick and hassle-free claims process</p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark-text">24/7 Support</h3>
                <p className="text-brand-dark-text">Round-the-clock assistance when you need it</p>
              </div>
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
              src="/lovable-uploads/7fe5ce8a-d5a6-422c-b391-f67e26229445.png" 
              alt="Warranty quote interface with panda mascot and car" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Get Help With A Repair Section */}
      <section className="py-12 md:py-20 bg-brand-deep-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-white">
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