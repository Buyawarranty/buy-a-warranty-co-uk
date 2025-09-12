import { CheckCircle, Shield, Clock, Wrench, Car, Zap, Battery, Bike, Phone, Mail, AlertTriangle, X, Check, Star, FileText, Users, Heart, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Protected = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <SEOHead
        title="What's Covered - Buy A Warranty"
        description="Discover comprehensive vehicle protection with fair, transparent warranty coverage. Quick repairs, trusted service centers, and stress-free claims process."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header with Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <div className="flex items-center">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
                </a>
              </div>
              
              {/* Navigation - Hidden on mobile, visible on lg+ */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">BUY PROTECTION</Link>
                <Link to="/protected" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">SERVICE A COMPLAINT</Link>
                <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">MAKE A CLAIM</Link>
                <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQs</Link>
                <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">CONTACT US</Link>
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
                  className="bg-orange-500 text-white hover:bg-orange-600 px-3 text-sm"
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
                        href="/" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Warranty Plans
                      </a>
                      <a 
                        href="/protected" 
                        className="text-orange-500 hover:text-orange-600 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        What's Covered
                      </a>
                      <a 
                        href="/make-a-claim" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Make a Claim
                      </a>
                      <a 
                        href="/faq" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                         FAQs
                      </a>
                      <a 
                        href="/contact-us" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact Us
                      </a>
                    </nav>

                    {/* Mobile CTA Buttons */}
                    <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        WhatsApp Us
                      </Button>
                      <Button 
                        className="bg-orange-500 text-white hover:bg-orange-600 w-full"
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
        <div className="bg-gradient-to-br from-[#eb4b00] to-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                If it breaks, We'll fix it!
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8" />
                <p className="text-xl md:text-2xl">We're here to make vehicle protection simple, fair, and stress-free.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Main Coverage Info */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Our Warranty Plans offer <strong>mechanical and electrical repair cover</strong> for eligible vehicles, 
              including cars, motorcycles, and vans, whether used for personal or business purposes. 
              It applies to combustion engines, hybrid systems, and electric powertrains.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-4 text-lg">Eligibility at plan start:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-blue-800 font-medium">Vehicles up to 15 years old</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-blue-800 font-medium">Vehicles up to 150,000 miles</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-blue-800 font-medium">Plans for 12, 24, or 36 months</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium text-lg">We aim to keep things fair, transparent, and flexible.</span>
            </div>
          </section>

          {/* What Happens When You Have a Problem */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-8 h-8 text-[#eb4b00]" />
              <h2 className="text-2xl font-bold text-gray-900">What happens when you have a problem?</h2>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-orange-900 mb-4">Quick & Easy Support</h3>
              <p className="text-orange-800 mb-4">If your vehicle develops a fault:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="bg-[#eb4b00] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-gray-800">Contact us directly on <strong>0330 229 5045</strong> or complete our quick online form</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="bg-[#eb4b00] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-gray-800">We'll work quickly to get your repair sorted</span>
                </div>
              </div>
            </div>
          </section>

          {/* Fair & Fast Decisions */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Fair & Fast Decisions</h2>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <p className="text-green-800 mb-2">We believe in doing what's fair every time you need a repair. Our goal is to get you back on the road as quickly as possible.</p>
                  <p className="text-green-800 font-semibold">If your claim is within our simple terms, we'll pay it - no excuses, no delays.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting You Up and Running ASAP */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Getting you up and running ASAP</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">No Stress. No Hassle.</h3>
              <p className="text-blue-800 mb-4">Once approved:</p>
              <div className="space-y-3">
                {[
                  "The garage gets paid directly",
                  "Or we can pay you with proof of repair", 
                  "You choose your own garage or we can recommend the best"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Your Coverage at a Glance */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Coverage at a Glance</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included:</h3>
                <div className="space-y-3">
                  {[
                    "'All' mechanical & electrical repairs",
                    "MOT fee paid",
                    "Fault diagnostics",
                    "Labour costs",
                    "Breakdown recovery claim back",
                    "Trusted repair centres",
                    "Zero excess option",
                    "0% APR interest free options"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Extras:</h3>
                <div className="space-y-3">
                  {[
                    "UK-wide breakdown recovery",
                    "Zero excess",
                    "Wear & tear cover",
                    "MOT repair costs",
                    "Tyre replacement cover",
                    "Lost key cover"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* What We Don't Cover */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <X className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">What we don't cover</h2>
            </div>
            
            <p className="text-gray-700 mb-6">We like to keep things straightforward. Here's what's not covered:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Pre-existing faults",
                "Routine servicing & maintenance (e.g., tyres, brake pads)",
                "Accident or collision damage",
                "Vehicles used for hire or reward (e.g., courier, taxi or rental)"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cancellation Rights */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Cancellation Rights</h2>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <p className="text-orange-800 mb-4">
                You can cancel within 14 days of purchase for a full refund (if no repairs have been made). 
                After this period, our standard cancellation policy applies.
              </p>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">No pressure - you have time to change your mind.</span>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <p className="text-blue-800 mb-4 font-medium">Have questions? We're here to help:</p>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Email: <strong>support@buyawarranty.co.uk</strong></span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Friendly support whenever you need us.</span>
              </div>
            </div>
          </section>

          {/* Support Promise */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Support Promise</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              All repair requests are reviewed on a case-by-case basis and approved at the sole assessment of 
              Buyawarranty.co.uk, based on fairness and the warranty terms.
            </p>
            
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium text-lg">We're here to help, even when things don't go exactly to plan.</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Protected;