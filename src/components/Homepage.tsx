import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Zap, Car, Truck, Battery, Bike, Menu, X, Phone, FileCheck, Settings, Key, Globe, ArrowRightLeft, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { VoucherBanner } from './VoucherBanner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackButtonClick, trackEvent } from '@/utils/analytics';

// Lazy load heavy components
const HeroSection = lazy(() => import('./homepage/HeroSection'));
const BenefitsSection = lazy(() => import('./homepage/BenefitsSection'));
const HomepageFAQ = lazy(() => import('./HomepageFAQ'));
const WebsiteFooter = lazy(() => import('./WebsiteFooter'));

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
  const [showSecondWarrantyDiscount, setShowSecondWarrantyDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    // Check if user is returning from a successful purchase
    const urlParams = new URLSearchParams(window.location.search);
    const fromSuccess = urlParams.get('from_success');
    
    if (fromSuccess === 'true') {
      setShowVoucherBanner(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user has discount for second warranty
    const hasSecondWarrantyDiscount = localStorage.getItem('addAnotherWarrantyDiscount');
    if (hasSecondWarrantyDiscount === 'true') {
      setShowSecondWarrantyDiscount(true);
      // Generate unique discount code for this session
      const code = `SECOND10-${Date.now().toString().slice(-6)}`;
      setDiscountCode(code);
      localStorage.setItem('secondWarrantyDiscountCode', code);
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
    trackButtonClick('scroll_to_quote_form');
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
    // Track main CTA button click
    trackButtonClick('get_quote_main', {
      has_reg_number: !!regNumber.trim(),
      has_mileage: !!mileage.trim(),
      mileage_value: mileage
    });
    
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
      {/* Voucher Banner */}
      {showVoucherBanner && <VoucherBanner />}
      
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
                  loading="eager"
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

            {/* Desktop CTA Buttons */}
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
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>
                  <nav className="flex flex-col space-y-4 flex-1">
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
                    
                    <div className="py-3 border-b border-gray-200">
                      <div className="text-orange-500 font-semibold text-base mb-3 flex items-center gap-1">
                        <Phone className="h-5 w-5 text-orange-500" />
                        Call Us
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
                      className="text-gray-700 hover:text-gray-900 font-semibold text-base py-3 min-h-[48px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="animate-pulse bg-gray-100 h-96" />}>
        {/* Hero Section */}
        <HeroSection
          regNumber={regNumber}
          mileage={mileage}
          sliderMileage={sliderMileage}
          showMileageField={showMileageField}
          isLookingUp={isLookingUp}
          mileageError={mileageError}
          vehicleAgeError={vehicleAgeError}
          showSecondWarrantyDiscount={showSecondWarrantyDiscount}
          discountCode={discountCode}
          isFormValid={isFormValid}
          onRegChange={handleRegChange}
          onMileageChange={handleMileageChange}
          onMileageFocus={handleMileageFocus}
          onSliderChange={handleSliderChange}
          onGetQuote={handleGetQuote}
        />

        {/* Step 1 - Get Instant Quote - Image optimized with lazy loading */}
        <section className="py-16 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                <div className="mb-4 md:mb-6">
                  <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide mb-3 md:mb-4">
                    Step 1: Vehicle Details
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold text-brand-dark-text leading-tight">
                    Get Your Instant Quote in <span className="text-brand-orange">30 Seconds</span>
                  </h2>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-base md:text-lg text-brand-dark-text">
                      <strong>Enter your reg number</strong> – We'll find your vehicle details.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-base md:text-lg text-brand-dark-text">
                      <strong>Add your mileage</strong> – Move the panda slider or type it in.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-base md:text-lg text-brand-dark-text">
                      <strong>Instant quote</strong> – See your tailored warranty options immediately.
                    </span>
                  </div>
                </div>

                <button 
                  onClick={scrollToQuoteForm}
                  className="bg-brand-deep-blue hover:bg-blue-800 text-white font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded shadow-lg transition-colors w-full sm:w-auto"
                >
                  Get My Quote Now
                </button>
              </div>

              <div className="relative text-center order-1 lg:order-2">
                <img 
                  src="/lovable-uploads/panda-vehicle-collection-hero.png" 
                  alt="Panda with various vehicles" 
                  className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 - Choose Your Plan */}
        <section className="py-16 md:py-28 bg-brand-gray-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="relative text-center order-1 lg:order-1">
                <img 
                  src="/lovable-uploads/panda-celebrating-orange-car.png" 
                  alt="Panda celebrating with car" 
                  className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
                  loading="lazy"
                />
              </div>
              
              <div className="space-y-6 md:space-y-8 order-2 lg:order-2">
                <div className="mb-4 md:mb-6">
                  <div className="text-orange-600 text-sm font-semibold uppercase tracking-wide mb-3 md:mb-4">
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

              <div className="relative text-center order-1 lg:order-2">
                <img 
                  src="/lovable-uploads/panda-celebrating-new.png" 
                  alt="Panda with EV charging station - Warranty Active" 
                  className="w-full h-auto max-w-sm md:max-w-lg mx-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <BenefitsSection />

        {/* FAQ Section */}
        <HomepageFAQ />
      </Suspense>

      {/* Mobile Floating Buttons */}
      {isMobile && (
        <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-50">
          <a 
            href="https://wa.me/message/SPQPJ6O3UBF5B1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </a>
          <a 
            href="tel:03302295040"
            className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label="Call us"
          >
            <Phone className="w-7 h-7 text-white" />
          </a>
        </div>
      )}

      {/* Footer */}
      <Suspense fallback={<div className="animate-pulse bg-gray-100 h-32" />}>
        <WebsiteFooter />
      </Suspense>
    </div>
  );
};

export default Homepage;
