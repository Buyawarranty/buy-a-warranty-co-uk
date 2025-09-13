import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Car, Truck, Battery, Bike, Menu, Phone, FileCheck, Settings, Globe, Wrench } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import WebsiteFooter from '@/components/WebsiteFooter';
import { SEOHead } from '@/components/SEOHead';
import TrustpilotHeader from '@/components/TrustpilotHeader';

// Import panda mascot images
import pandaVehicles from '@/assets/panda-vehicles.png';
import pandaMechanic from '@/assets/panda-mechanic.png';
import pandaSavings from '@/assets/panda-savings.png';
import pandaService from '@/assets/panda-service.png';
import pandaThumbsUp from '@/assets/panda-thumbs-up.png';

const Protected = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <SEOHead
        title="What's Covered - Buy A Warranty"
        description="Comprehensive vehicle warranty coverage for cars, vans, and motorbikes. Clear protection with no hidden catches or confusing clauses."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
                </Link>
              </div>
              
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <Link to="/" className="text-gray-700 hover:text-primary font-medium">Warranty Plans</Link>
                <Link to="/protected" className="text-primary font-medium">What's Covered</Link>
                <Link to="/claims" className="text-gray-700 hover:text-primary font-medium">Make a Claim</Link>
                <Link to="/faq" className="text-gray-700 hover:text-primary font-medium">FAQs</Link>
                <Link to="/contact-us" className="text-gray-700 hover:text-primary font-medium">Contact Us</Link>
              </nav>

              <div className="hidden lg:flex items-center space-x-3">
                <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851]">
                    WhatsApp Us
                  </Button>
                </a>
                <Link to="/">
                  <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                    Get my quote
                  </Button>
                </Link>
              </div>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <nav className="flex flex-col space-y-6 pt-6">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Warranty Plans</Link>
                    <Link to="/protected" onClick={() => setIsMobileMenuOpen(false)}>What's Covered</Link>
                    <Link to="/claims" onClick={() => setIsMobileMenuOpen(false)}>Make a Claim</Link>
                    <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
                    <Link to="/contact-us" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between py-20 lg:py-32 gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Clear, Straightforward
                  <span className="block text-accent"> Vehicle Protection</span>
                </h1>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">No confusing packages or sneaky rejections</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">One solid plan for cars, vans, and motorbikes</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4">
                    See What's Covered
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Link to="/">
                    <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4">
                      Get Your Quote
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex-1">
                <img src={pandaVehicles} alt="Warranty coverage for all vehicle types" className="w-full h-auto max-w-md mx-auto drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Trustpilot */}
        <section className="bg-white py-6">
          <TrustpilotHeader className="max-w-7xl mx-auto" />
        </section>

        {/* What's Included */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What's Included in Your Coverage</h2>
              <p className="text-xl text-gray-600">Our Platinum Plan gives you top-level protection as standard</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">All Mechanical & Electrical Parts</h3>
                <p className="text-gray-600">From engine to electrics - comprehensive coverage for all systems</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Labour Costs Included</h3>
                <p className="text-gray-600">No surprise bills at the garage - all labour costs are covered</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fault Diagnostics</h3>
                <p className="text-gray-600">Professional diagnostic services to identify issues quickly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Claims Process with Panda */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Fast & Easy Claims Process</h2>
                <p className="text-xl text-gray-600 mb-8">Making a claim should be simple and hassle-free.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
                      <p className="text-gray-600">Call us on 0330 229 5045 or complete our quick online form</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <img src={pandaService} alt="Fast warranty service" className="w-full h-auto max-w-md mx-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Protect Your Vehicle?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of drivers who trust us for reliable, transparent vehicle protection.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4">
                  Get Your Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <WebsiteFooter />
      </div>
    </>
  );
};

export default Protected;