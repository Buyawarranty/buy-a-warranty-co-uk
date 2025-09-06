import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap, Car, Truck, Battery, Bike, Menu, X, Phone, FileCheck, Settings, Key, Globe } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    
    // Check if mileage is zero
    const numericMileage = parseInt(mileage.replace(/,/g, ''));
    if (numericMileage === 0) {
      toast({
        title: "Mileage Required",
        description: "Please select a mileage greater than 0 to get your quote.",
        variant: "destructive",
      });
      return;
    }
    
    // Check mileage validation before proceeding
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
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                  alt="Buy a Warranty" 
                  className="h-6 sm:h-8 w-auto"
                />
              </a>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Warranty Plans</a>
              <a href="/protected" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">How You're Protected</a>
              <a href="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</a>
              <a href="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQ</a>
              <a href="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</a>
            </nav>

            {/* Desktop CTA Buttons - Show on desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 px-3 text-sm"
              >
                WhatsApp Us
              </Button>
              <Button 
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 px-3 text-sm"
              >
                Get my quote
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Header with logo */}
                  <div className="flex items-center justify-between pb-6">
                    <a href="/" className="hover:opacity-80 transition-opacity">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </a>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-6 flex-1">
                    <a 
                      href="#" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Warranty Plans
                    </a>
                    <a 
                      href="/protected" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      How You're Protected
                    </a>
                    <a 
                      href="/make-a-claim" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </a>
                    <a 
                      href="#" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                    <a 
                      href="/contact-us" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </a>
                  </nav>

                  {/* CTA Buttons */}
                  <div className="space-y-4 pt-6 mt-auto">
                    <Button 
                      variant="outline" 
                      className="w-full bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 text-lg py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      WhatsApp Us
                    </Button>
                    <Button 
                      className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get my quote
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-4">

              {/* Main Headline */}
              <div className="space-y-3 mb-4 sm:mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
                  We{"'"}ve got you
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>covered
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span><span className="text-primary">in 60 seconds!</span>
                </h1>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium">From just 80p a day</span>
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
              <div className="space-y-3 max-w-lg">
                <div className="flex items-stretch rounded-lg overflow-hidden shadow-lg border-2 border-black">
                  {/* UK Section with flag */}
                  <div className="bg-blue-600 text-white font-bold px-2 sm:px-4 py-3 sm:py-4 flex items-center justify-center min-w-[60px] sm:min-w-[80px] h-[56px] sm:h-[64px]">
                    <div className="flex flex-col items-center">
                      <div className="text-base sm:text-lg leading-tight mb-1">🇬🇧</div>
                      <div className="text-sm sm:text-base font-bold leading-none">UK</div>
                    </div>
                  </div>
                  {/* Registration Input */}
                  <input
                    type="text"
                    value={regNumber}
                    onChange={handleRegChange}
                    placeholder="Enter reg"
                    className="bg-yellow-400 border-none outline-none text-lg sm:text-xl text-black flex-1 font-bold placeholder:text-black/70 px-3 sm:px-4 py-3 sm:py-4 uppercase tracking-wider h-[56px] sm:h-[66px]"
                    maxLength={8}
                  />
                </div>

                {/* Mileage Options - Always Visible */}
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Button 
                    onClick={handleGetQuote}
                    className={`w-full px-6 sm:px-12 h-[56px] sm:h-[66px] text-lg sm:text-xl font-bold rounded-lg transition-all ${
                      isLookingUp
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white btn-slow-pulsate'
                    }`}
                    disabled={isLookingUp}
                  >
                    <span className="hidden sm:inline">{isLookingUp ? 'Looking up vehicle...' : 'Get my quote'}</span>
                    <span className="sm:hidden">{isLookingUp ? 'Looking up...' : 'Get quote'}</span>
                  </Button>
                  {!mileageError && !vehicleAgeError && (
                    <p className="text-sm text-gray-400 text-center">
                      Protection for vehicles up to 150,000 miles or 15 years.
                    </p>
                  )}
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
              
              {/* Trustpilot Logo positioned between panda's feet and vehicle icons */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2" style={{transform: 'translateX(-50%) translateY(100px)'}}>
                <div className="text-center mb-4">
                  <img 
                    src="/lovable-uploads/39555042-4eb1-436c-a0b8-910fb79ac11c.png" 
                    alt="Trustpilot with 5 star rating" 
                    className="h-4 sm:h-5 mx-auto"
                  />
                </div>
              </div>

              {/* Vehicle Types positioned underneath the panda's feet */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-20">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center space-x-1">
                    <Car className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 text-base">Cars</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 text-base">Vans</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 text-base">Hybrid</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 text-base">EV</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bike className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 text-base">Motorbikes</span>
                  </div>
                </div>
              </div>
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
                  Reliable extended warranty
                  <br />
                  <span className="text-brand-orange">If it breaks, we{"'"}ll fix it 🔧</span>
                </h2>
                <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                  Enjoy complete peace of mind with our comprehensive cover. From vital mechanical components to essential electrical parts, we{"'"}ve got it all covered.
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
                  Unlimited claims
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  Complete <span className="text-brand-orange">vehicle protection</span>
                </h2>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-brand-dark-text">
                  Transparent Pricing. Trusted Protection.
                </h3>
                <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                  No hidden fees. No confusing jargon. Just clear cover options tailored to your vehicle and budget.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-base text-brand-dark-text"><strong>14-day</strong> money-back guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-base text-brand-dark-text"><strong>Rated</strong> Excellent by UK drivers</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-base text-brand-dark-text"><strong>Backed</strong> by trusted repair networks</span>
                  </div>
                </div>
              </div>
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
                  Easy Options
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  <span className="text-brand-orange">Flexible Warranty Plans</span>
                </h2>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-base md:text-lg text-brand-dark-text">
                    <strong>Pay Monthly or in Full</strong> – Choose what works for you.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-base md:text-lg text-brand-dark-text">
                    <strong>1, 2 or 3-Year Cover</strong> – Long-term protection, your choice.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-base md:text-lg text-brand-dark-text">
                    <strong>0% APR & No Hidden Fees</strong> – Interest-free, stress-free.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-base md:text-lg text-brand-dark-text">
                    <strong>Save an Extra 10%</strong> – When you pay in full.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-base md:text-lg text-brand-dark-text">
                    <strong>From Just £19/Month</strong> – Affordable peace of mind.
                  </span>
                </div>
              </div>
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
                  High mileage, No Problem!
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                  Drive With Confidence –
                  <br />
                  <span className="text-brand-orange">You're Covered</span>
                </h2>
              </div>
              
              <p className="text-base md:text-lg text-brand-dark-text leading-relaxed">
                Once you're covered, drive with complete peace of mind. If something 
                goes wrong, simply call our claims team and we'll take care of everything.
                <br />
                We want to get you back on the road as soon as possible.
              </p>

              <button className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto">
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
                <p className="text-brand-dark-text">Comprehensive cover for your engine, mechanical and electrical parts.</p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark-text">Instant Claims</h3>
                <p className="text-brand-dark-text">Fast, hassle-free claims process to get you back on the road quickly.</p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark-text">Clear Terms</h3>
                <p className="text-brand-dark-text">Simple, transparent conditions that make sense—no hidden surprises.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Instant Quote CTA */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button 
            className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl rounded-lg shadow-lg transition-colors"
            onClick={handleGetQuote}
          >
            Get Instant Quote
          </Button>
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

          {/* CTA Button */}
          <button className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-lg shadow-lg transition-colors mb-8 md:mb-16 w-full sm:w-auto">
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

      {/* Additional Cover Options Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-brand-deep-blue">
              Additional Cover <span className="text-brand-orange">Options</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12 max-w-6xl mx-auto">
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">24/7 Breakdown Recovery</h3>
                    <p className="text-brand-dark-text">Help whenever you need it.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">MOT Repair Cover</h3>
                    <p className="text-brand-dark-text">Stay road-legal without the stress.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Tyre Cover</h3>
                    <p className="text-brand-dark-text">Protection against unexpected punctures.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Wear & Tear</h3>
                    <p className="text-brand-dark-text">Extra peace of mind for ageing parts.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Lost Key Cover</h3>
                    <p className="text-brand-dark-text">No more panic if your keys go missing.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">European Cover</h3>
                    <p className="text-brand-dark-text">Drive with confidence across Europe.</p>
                  </div>
                </div>
              </div>
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
