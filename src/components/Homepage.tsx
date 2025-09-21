import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap, Car, Truck, Battery, Bike, Menu, X, Phone, FileCheck, Settings, Key, Globe, ArrowRightLeft, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import HomepageFAQ from './HomepageFAQ';
import WebsiteFooter from './WebsiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { VoucherBanner } from './VoucherBanner';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MileageSlider from './MileageSlider';
import trustpilotLogo from '@/assets/trustpilot-excellent-box.webp';
import whatsappIconNew from '@/assets/whatsapp-icon-new.png';
import pandaVehicleCollection from '@/assets/panda-vehicle-collection-hero.png';
import pandaCelebratingCar from '@/assets/panda-celebrating-orange-car.png';

interface VehicleData {
  regNumber: string;
  mileage: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
  blocked?: boolean;
  blockReason?: string;
}

interface HomepageProps {
  onRegistrationSubmit: (vehicleData: VehicleData) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onRegistrationSubmit }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('0');
  const [sliderMileage, setSliderMileage] = useState(0);
  const [showMileageField, setShowMileageField] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [mileageError, setMileageError] = useState('');
  const [vehicleAgeError, setVehicleAgeError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showVoucherBanner, setShowVoucherBanner] = useState(false);

  useEffect(() => {
    // Check if user is returning from a successful purchase
    const urlParams = new URLSearchParams(window.location.search);
    const fromSuccess = urlParams.get('from_success');
    
    if (fromSuccess === 'true') {
      setShowVoucherBanner(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const scrollToQuoteForm = () => {
    const quoteSection = document.getElementById('quote-form');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        if (data.blocked) {
          vehicleData.blocked = true;
          vehicleData.blockReason = data.blockReason;
        }
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm py-1 sm:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                  alt="Buy a Warranty" 
                  className="h-6 sm:h-8 w-auto"
                />
              </Link>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/what-is-covered" className="relative text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">What's Covered</Link>
              <Link to="/make-a-claim" className="relative text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Make a Claim</Link>
              <Link to="/faq" className="relative text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">FAQs</Link>
              <Link to="/contact-us" className="relative text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Contact Us</Link>
              
              {/* Call Us Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-orange-500 hover:text-orange-600 font-semibold text-sm xl:text-base p-2 h-auto flex items-center gap-1">
                    <Phone className="h-4 w-4 text-orange-500" />
                    Call Us
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-4 bg-white border shadow-lg z-50">
                  <div className="space-y-3">
                    <div className="text-left text-base font-medium text-gray-600 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Mon-Fri 9am to 5:30pm
                    </div>
                    <DropdownMenuItem asChild>
                      <a href="tel:03302295040" className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-none focus:outline-none">
                        <Phone className="h-5 w-5 mr-3 text-orange-500" />
                        <div>
                          <div className="font-semibold text-base text-black">Get a Quote</div>
                          <div className="text-orange-500 font-semibold text-base">0330 229 5040</div>
                        </div>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="tel:03302295045" className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-none focus:outline-none">
                        <Phone className="h-5 w-5 mr-3 text-orange-500" />
                        <div>
                          <div className="font-semibold text-base text-black">Make a Claim</div>
                          <div className="text-orange-500 font-semibold text-base">0330 229 5045</div>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/customer-dashboard" className="relative text-gray-700 hover:text-gray-900 font-semibold text-sm xl:text-base after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-orange-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Login</Link>
            </nav>

            {/* Desktop CTA Buttons - Show on desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-[#00B67A] text-white border-[#00B67A] hover:bg-[#008C5A] hover:border-[#008C5A] px-3 text-sm"
                >
                  WhatsApp Us
                </Button>
              </a>
              <Button 
                size="sm"
                onClick={scrollToQuoteForm}
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
                  size="lg"
                  className="lg:hidden p-3 min-w-[48px] min-h-[48px]"
                >
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <div className="flex flex-col h-full max-h-screen">
                  {/* Header with logo */}
                  <div className="flex items-center justify-between pb-4 flex-shrink-0">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-4 flex-1 overflow-y-auto pb-4">
                     <Link 
                      to="/what-is-covered" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      What's Covered
                    </Link>
                     <Link 
                      to="/make-a-claim" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </Link>
                     <Link 
                      to="/faq" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                       FAQs
                    </Link>
                     <Link 
                      to="/contact-us" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-base py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                    
                    {/* Call Us Section in Mobile */}
                    <div className="py-3 border-b border-gray-200">
                      <div className="text-orange-500 font-semibold text-base mb-3 flex items-center gap-1">
                        <Phone className="h-5 w-5 text-orange-500" />
                        Call Us
                      </div>
                      <div className="text-left text-base font-medium text-gray-600 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        Mon-Fri 9am to 5:30pm
                      </div>
                      <div className="space-y-2">
                        <a href="tel:03302295040" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                          <Phone className="h-5 w-5 mr-3 text-orange-500" />
                          <div>
                            <div className="font-semibold text-base text-black">Get a Quote</div>
                            <div className="text-orange-500 font-semibold text-base">0330 229 5040</div>
                          </div>
                        </a>
                        <a href="tel:03302295045" className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                          <Phone className="h-5 w-5 mr-3 text-orange-500" />
                          <div>
                            <div className="font-semibold text-base text-black">Make a Claim</div>
                            <div className="text-orange-500 font-semibold text-base">0330 229 5045</div>
                          </div>
                        </a>
                      </div>
                    </div>
                    
                     <Link 
                      to="/customer-dashboard" 
                      className="text-gray-700 hover:text-gray-900 font-semibold text-base py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </nav>

                  {/* CTA Buttons */}
                  <div className="space-y-4 pt-4 mt-auto flex-shrink-0">
                    <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer" className="block">
                       <Button 
                        variant="outline" 
                        className="w-full bg-[#00B67A] text-white border-[#00B67A] hover:bg-[#008C5A] hover:border-[#008C5A] text-base py-4 min-h-[48px] flex items-center justify-center gap-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <img 
                          src={whatsappIconNew} 
                          alt="WhatsApp" 
                          className="w-5 h-5"
                        />
                        WhatsApp Us
                      </Button>
                    </a>
                     <Button 
                      className="w-full bg-primary text-white hover:bg-primary/90 text-base py-4 min-h-[48px]"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToQuoteForm();
                      }}
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

      {/* Voucher Banner for returning customers */}
      {showVoucherBanner && (
        <div className="bg-green-50 border-b border-green-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-green-800">🎉 Welcome back!</span>
              <VoucherBanner placement="homepage" animate={true} />
              <span className="text-sm text-green-700 font-medium">Use code for your 2nd vehicle discount</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="quote-form" className="bg-white py-6 sm:py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-4 px-1 sm:px-0 flex flex-col justify-center">

              {/* Main Headline */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
                  We{"'"}ve got you
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>covered
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span><span className="text-brand-orange">in 60 seconds!</span>
                </h1>
              </div>

              {/* Benefits */}
              <div className="mb-6 sm:mb-8 text-gray-700 text-xs sm:text-sm md:text-base space-y-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="font-medium">From just 80p a day • Unlimited claims • Fast payouts</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="font-medium">Reliable cover you can trust • Save £££ on repairs</span>
                </div>
              </div>

              {/* Registration Input */}
              <div className="space-y-3 w-full max-w-lg">
                <div className="flex items-stretch rounded-lg overflow-hidden shadow-lg border-2 border-black w-full">
                  {/* UK Section with flag */}
                  <div className="bg-blue-600 text-white font-bold px-2 sm:px-3 md:px-4 py-3 sm:py-4 flex items-center justify-center min-w-[50px] sm:min-w-[70px] md:min-w-[80px] h-[56px] sm:h-[60px] md:h-[66px]">
                    <div className="flex flex-col items-center">
                      <div className="text-sm sm:text-base md:text-lg leading-tight mb-1">🇬🇧</div>
                      <div className="text-xs sm:text-sm md:text-base font-bold leading-none">UK</div>
                    </div>
                  </div>
                  {/* Registration Input */}
                  <input
                    type="text"
                    value={regNumber}
                    onChange={handleRegChange}
                    placeholder="Enter reg"
                    className="bg-yellow-400 border-none outline-none text-xl sm:text-2xl md:text-3xl text-black flex-1 font-black placeholder:text-black/70 px-2 sm:px-3 md:px-4 py-3 sm:py-4 uppercase tracking-wider h-[56px] sm:h-[60px] md:h-[66px] min-w-0"
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
                      className={`w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 rounded-lg focus:outline-none min-w-0 ${
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
                    className={`w-full px-4 sm:px-6 md:px-12 h-[56px] sm:h-[60px] md:h-[66px] text-base sm:text-lg md:text-xl font-bold rounded-lg transition-all min-w-0 ${
                      isLookingUp
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-brand-orange hover:bg-brand-orange/90 text-white btn-slow-pulsate'
                    }`}
                    disabled={isLookingUp}
                  >
                    <span className="hidden sm:inline">{isLookingUp ? 'Looking up vehicle...' : 'Get my quote'}</span>
                    <span className="sm:hidden">{isLookingUp ? 'Looking up...' : 'Get my quote'}</span>
                  </Button>
                  {!mileageError && !vehicleAgeError && (
                    <p className="text-sm text-gray-400 text-center">
                      Protection for vehicles up to 150,000 miles and 15 years.
                    </p>
                  )}
                </div>
              </div>
            </div>

 {/* Right Content - Hero Image */}
            <div className="relative">
              <img 
                src={pandaVehicleCollection} 
                alt="Panda mascot with vehicle collection including cars, van, and motorcycle" 
                className="w-full h-auto"
              />
              {/* Trustpilot Logo positioned to align with van */}
              <div className="absolute top-2 left-4 z-10">
                <a 
                  href="https://uk.trustpilot.com/review/buyawarranty.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={trustpilotLogo} 
                    alt="Trustpilot Excellent Rating" 
                    className="h-12 sm:h-15 w-auto"
                  />
                </a>
              </div>
              {/* Halfords Logo positioned to the right */}
              <div className="absolute top-4 right-0 z-10">
                <img 
                  src="/lovable-uploads/d5f9a604-cacf-42fd-9ab5-a387dedf8a3b.png" 
                  alt="Halfords Autocentre - Free MOT Test with Warranty plan" 
                  className="h-16 w-auto"
                />
              </div>
              
              {/* Vehicle Types positioned underneath the panda's feet */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 sm:translate-y-8 w-full px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 flex-wrap">
                <div className="flex items-center space-x-1 min-w-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Cars</span>
                </div>
                <div className="flex items-center space-x-1 min-w-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Vans</span>
                </div>
                <div className="flex items-center space-x-1 min-w-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Hybrid</span>
                </div>
                <div className="flex items-center space-x-1 min-w-0">
                  <Battery className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">EV</span>
                </div>
                <div className="flex items-center space-x-1 min-w-0">
                  <Bike className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Motorbikes</span>
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

              <button 
                onClick={scrollToQuoteForm}
                className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto"
              >
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
                <div className="text-green-600 text-sm font-semibold uppercase tracking-wide mb-3 md:mb-4">
                  Unlimited Claims
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
                src={pandaCelebratingCar} 
                alt="Panda mascot celebrating with orange car" 
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
                <div className="text-green-600 text-sm font-semibold uppercase tracking-wide mb-3 md:mb-4">
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
                     <strong>Save an Extra 20% with our longer term plans</strong>
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
      <section className="py-16 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
              <div className="mb-4 md:mb-6">
                <div className="text-green-600 text-sm font-semibold uppercase tracking-wide mb-3 md:mb-4">
                  High Mileage, No Problem!
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

              <button 
                onClick={scrollToQuoteForm}
                className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto"
              >
                Get Instant Quote
              </button>
            </div>

            {/* Right - Panda with warranty active */}
            <div className="relative text-center order-1 lg:order-2">
              <img 
                src="/lovable-uploads/panda-celebrating-new.png" 
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


      {/* Coverage Showcase Section */}
      <section className="py-12 md:py-20 bg-brand-gray-bg text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* CTA Button */}
          <button 
            onClick={scrollToQuoteForm}
            className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl rounded-lg shadow-lg transition-colors w-full sm:w-auto"
          >
            Get Instant Quote
          </button>
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
                    <h3 className="text-lg font-bold text-brand-dark-text">24/7 Vehicle Recovery</h3>
                    <p className="text-brand-dark-text">Help whenever you need it.</p>
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
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Europe Cover</h3>
                    <p className="text-brand-dark-text">Drive with confidence across Europe.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Vehicle Rental</h3>
                    <p className="text-brand-dark-text">Replacement vehicle when yours is off the road.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Transfer Cover</h3>
                    <p className="text-brand-dark-text">Coverage continues when you change ownership.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark-text">Wear and Tear</h3>
                    <p className="text-brand-dark-text">Extra peace of mind for ageing parts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomepageFAQ />

      {/* Mobile Floating Action Buttons */}
      {isMobile && (
        <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-50">
          {/* WhatsApp Button */}
          <a 
            href="https://wa.me/message/SPQPJ6O3UBF5B1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <img 
              src={whatsappIconNew} 
              alt="WhatsApp" 
              className="w-8 h-8"
            />
          </a>
          
          {/* Call Button */}
          <a 
            href="tel:03302295040"
            className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Phone className="w-7 h-7 text-white" />
          </a>
        </div>
      )}
    </div>
  );
};

export default Homepage;
