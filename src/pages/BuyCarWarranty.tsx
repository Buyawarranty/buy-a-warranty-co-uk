import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Car, Phone, Menu, X, MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import HomepageFAQ from '@/components/HomepageFAQ';
import WebsiteFooter from '@/components/WebsiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackButtonClick } from '@/utils/analytics';
import carWarrantyHero from '@/assets/car-warranty-uk-diesel-car-warranty.png';
import pandaCarWarranty from '@/assets/car-warranty-uk-suv-warranty.png';
import pandaFastService from '@/assets/car-warranty-uk-affordable-warranty.png';
import trustpilotLogo from '@/assets/trustpilot-excellent-box.webp';
import whatsappIconNew from '@/assets/whatsapp-icon-new.png';
import companyRegistration from '@/assets/company-registration-footer.png';

const BuyCarWarranty: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToQuoteForm = () => {
    trackButtonClick('buy_car_warranty_get_quote');
    window.location.href = '/#quote-form';
  };

  return (
    <>
      <SEOHead
        title="Buy a Car Warranty Online - Trusted UK Cover for All Budgets | Buy A Warranty"
        description="Compare car warranty quotes and get extended cover for your vehicle. Best car warranty UK options for used cars, low monthly costs, and trusted protection. Get a quote today."
        keywords="buy a car warranty online, car warranty UK, extended car warranty, used car warranty, best car warranty provider, affordable car warranty UK, car warranty quotes, car warranty cover, cheap car warranty, car warranty cost, vehicle warranty UK"
        canonical="https://buyawarranty.co.uk/buy-a-warranty-for-my-car-uk-warranties"
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="text-[#1e40af]">buya</span>
              <span className="text-[#eb4b00]">warranty</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/faq" className="text-gray-700 hover:text-[#eb4b00] transition-colors">
              FAQ
            </Link>
            <Link to="/make-a-claim" className="text-gray-700 hover:text-[#eb4b00] transition-colors">
              Claims
            </Link>
            <Link to="/contact-us" className="text-gray-700 hover:text-[#eb4b00] transition-colors">
              Contact
            </Link>
            <Link to="/customer-dashboard">
              <Button variant="outline" className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af] hover:text-white">
                Customer Login
              </Button>
            </Link>
            <Button 
              onClick={scrollToQuoteForm}
              className="bg-[#eb4b00] hover:bg-[#d44400] text-white"
            >
              Get Quote
            </Button>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link 
                  to="/faq" 
                  className="text-lg text-gray-700 hover:text-[#eb4b00] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  to="/make-a-claim" 
                  className="text-lg text-gray-700 hover:text-[#eb4b00] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Claims
                </Link>
                <Link 
                  to="/contact-us" 
                  className="text-lg text-gray-700 hover:text-[#eb4b00] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/customer-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full border-[#1e40af] text-[#1e40af]">
                    Customer Login
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToQuoteForm();
                  }}
                  className="w-full bg-[#eb4b00] hover:bg-[#d44400] text-white"
                >
                  Get Quote
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <TrustpilotHeader />
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Protect your car with <span className="text-[#1e40af]">trusted UK</span> vehicle warranty cover
              </h1>
              
              <p className="text-xl text-gray-700">
                Affordable, flexible & reliable car warranty plans
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Best car warranty UK options for used and new vehicles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Extended car warranty plans with low monthly costs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Compare car warranty quotes instantly online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Transparent pricing with no hidden fees</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={scrollToQuoteForm}
                  size="lg"
                  className="bg-[#eb4b00] hover:bg-[#d44400] text-white text-lg px-8 py-6"
                >
                  Get Your Warranty Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  <Link to="/contact-us">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src={carWarrantyHero} 
                alt="Buy a car warranty online UK - trusted vehicle protection"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why choose <span className="text-[#1e40af]">Buy A Warranty</span>?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Shield className="h-12 w-12 text-[#1e40af] mb-4" />
              <h3 className="text-xl font-bold mb-2">Best Car Warranty UK</h3>
              <p className="text-gray-700">
                Options for used and new vehicles with comprehensive coverage you can trust
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <Clock className="h-12 w-12 text-[#eb4b00] mb-4" />
              <h3 className="text-xl font-bold mb-2">Extended Cover Plans</h3>
              <p className="text-gray-700">
                Extended car warranty plans with low monthly costs and flexible payment options
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <Star className="h-12 w-12 text-[#1e40af] mb-4" />
              <h3 className="text-xl font-bold mb-2">Compare Quotes Instantly</h3>
              <p className="text-gray-700">
                Compare car warranty quotes online in minutes and find the best deal
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <Check className="h-12 w-12 text-[#eb4b00] mb-4" />
              <h3 className="text-xl font-bold mb-2">Trusted Provider</h3>
              <p className="text-gray-700">
                Trusted independent car warranty provider with excellent customer reviews
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <Car className="h-12 w-12 text-[#1e40af] mb-4" />
              <h3 className="text-xl font-bold mb-2">All Vehicle Types</h3>
              <p className="text-gray-700">
                Cover for petrol, diesel, hybrid and electric cars across the UK
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg">
              <Shield className="h-12 w-12 text-[#eb4b00] mb-4" />
              <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
              <p className="text-gray-700">
                No hidden fees - clear, affordable car warranty UK pricing you can understand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={pandaFastService} 
                alt="Car warranty cover includes comprehensive protection"
                className="w-full max-w-md mx-auto h-auto"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                What's included in your <span className="text-[#1e40af]">car warranty</span>
              </h2>
              
              <p className="text-lg text-gray-700">
                Our warranties cover key mechanical and electrical components, including:
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Engine, gearbox, clutch and drivetrain</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Suspension, steering and braking systems</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Air conditioning and cooling systems</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Electrical components and infotainment</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Labour and parts up to your selected claim limit</span>
                </div>
              </div>

              <Button 
                asChild
                variant="outline"
                size="lg"
                className="mt-4"
              >
                <Link to="/warranty-plan">
                  See What's Covered
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Is It Worth It Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Is a car warranty <span className="text-[#eb4b00]">worth it</span> in the UK?
            </h2>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Absolutely. With rising repair costs and complex vehicle tech, a warranty gives you peace of mind and protects your budget. Whether you're buying a second-hand car or extending cover after your manufacturer warranty ends, our plans offer value for money and trusted protection.
            </p>

            <div className="bg-blue-50 p-8 rounded-lg mt-8">
              <h3 className="text-2xl font-bold mb-4">UK-wide vehicle warranty cover</h3>
              <p className="text-lg text-gray-700">
                We provide car warranties across England, Scotland, Wales and Northern Ireland. No matter where you're based, you can get a car warranty quote online and choose a plan that suits your vehicle and budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flexible Payment Options */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Flexible <span className="text-[#eb4b00]">payment options</span>
              </h2>
              
              <p className="text-lg text-gray-700">
                Choose the payment plan that works best for you:
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg mb-2">Pay Monthly</h4>
                  <p className="text-gray-700">Low-cost car warranty with affordable monthly payments</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg mb-2">One-Off Payment</h4>
                  <p className="text-gray-700">Pay upfront and save with exclusive discounts</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold text-lg mb-2">Flexible Terms</h4>
                  <p className="text-gray-700">Short-term and long-term cover (6, 12, 24 or 36 months)</p>
                </div>
              </div>

              <Button 
                onClick={scrollToQuoteForm}
                size="lg"
                className="bg-[#eb4b00] hover:bg-[#d44400] text-white"
              >
                Compare Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div>
              <img 
                src={pandaCarWarranty} 
                alt="Affordable car warranty UK with flexible payment options"
                className="w-full max-w-md mx-auto h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Compare Providers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Compare <span className="text-[#1e40af]">car warranty providers</span>
            </h2>

            <p className="text-xl text-center text-gray-700 mb-12">
              We're proud to be a trusted alternative to Warrantywise, RAC and AA warranties. Our customers rate us for:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3 bg-blue-50 p-6 rounded-lg">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-1">Clear Cover Options</h4>
                  <p className="text-gray-700">Easy to understand plans with transparent terms</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-orange-50 p-6 rounded-lg">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-1">Fast Claims Handling</h4>
                  <p className="text-gray-700">Quick and efficient claims process when you need it</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-blue-50 p-6 rounded-lg">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-1">UK-Based Support</h4>
                  <p className="text-gray-700">Friendly customer service team based in the UK</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-orange-50 p-6 rounded-lg">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-1">No Pushy Sales</h4>
                  <p className="text-gray-700">Honest advice without aggressive sales tactics</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <img 
                src={trustpilotLogo} 
                alt="Trustpilot excellent reviews for car warranty UK"
                className="h-16 mx-auto mb-4"
              />
              <p className="text-gray-600">Rated Excellent by our customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to buy a car warranty online?
          </h2>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Get started in minutes. Just enter your reg, choose your cover, and get protected.
          </p>

          <Button 
            onClick={scrollToQuoteForm}
            size="lg"
            className="bg-[#eb4b00] hover:bg-[#d44400] text-white text-xl px-12 py-8"
          >
            Get Your Car Warranty Quote Now
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>Instant quotes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>No obligation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5" />
              <span>UK-wide cover</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <HomepageFAQ />
        </div>
      </section>

      {/* Company Registration Footer */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <img 
              src={companyRegistration} 
              alt="Buy A Warranty company registration - FCA regulated"
              className="h-16 opacity-70"
            />
          </div>
        </div>
      </div>

      <WebsiteFooter />

      {/* Mobile Floating Buttons */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
          <a
            href="https://wa.me/447828324388"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
            onClick={() => trackButtonClick('whatsapp_float_buy_car_warranty')}
          >
            <img src={whatsappIconNew} alt="WhatsApp" className="h-6 w-6" />
          </a>
          
          <a
            href="tel:+447828324388"
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
            onClick={() => trackButtonClick('phone_float_buy_car_warranty')}
          >
            <Phone className="h-6 w-6" />
          </a>
        </div>
      )}
    </>
  );
};

export default BuyCarWarranty;
