import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star, Shield, Clock, Car, Truck, Battery, Bike, Menu, Phone, FileCheck, Settings, Globe, Wrench, Users, CreditCard } from 'lucide-react';
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
                <Link to="/what-is-covered" className="text-primary font-medium">What's Covered</Link>
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
                    <Link to="/what-is-covered" onClick={() => setIsMobileMenuOpen(false)}>What's Covered</Link>
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
                  What's covered in 
                  <span className="block text-accent">my warranty</span>
                </h1>
                
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  At Buy-a-Warranty, we like to keep things straightforward. One solid plan that works for cars, vans, and motorbikes - whether you're driving electric, hybrid, petrol or diesel.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">No confusing packages</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">No sneaky rejections</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">Just hassle-free cover</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-white/90">Clear, easy-to-understand protection</p>
                  </div>
                </div>
                
                <p className="text-lg text-white/80 mb-8">
                  Because maintaining your vehicle shouldn't be a headache.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/">
                    <Button size="lg" className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4">
                      Get my quote
                      <ArrowRight className="ml-2 h-5 w-5" />
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

        {/* Eligibility Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Eligibility at plan start</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicles up to 15 years old</h3>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicles up to 150,000 miles</h3>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Plans for 12, 24, or 36 months</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Claims Process */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our fast and easy claims process</h2>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Is it Easy to Make a Claim and Get My Repair Done?</h3>
              <p className="text-xl text-gray-600 mb-8">Yes, absolutely - we've made it simple and hassle-free.</p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">Just follow a few quick steps to start your claim</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">We'll guide you through the process</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">Repairs are handled quickly and professionally</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">Our support team is here if you need help at any stage</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">Choose your own garage, or we can recommend one</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                  <span className="text-gray-900 font-medium">We aim to process pay-outs within 90 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-8">If your vehicle develops a fault:</h4>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Call 0330 229 5045</li>
                        <li>• Or complete our quick online form in the 'Make a claim' section</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">Fast Claims and Repairs</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• We will review your claim the same day (during office hours)</li>
                        <li>• Our goal is to get you back on the road promptly and with minimal fuss</li>
                        <li>• No stress. No hassle. Fast authorisation</li>
                      </ul>
                      <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                        <p className="font-semibold text-gray-900">Once your repair is approved:</p>
                        <p className="text-gray-600">The garage gets paid directly - no waiting around</p>
                      </div>
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

        {/* Do You Pay Out Claims */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <img src={pandaThumbsUp} alt="Trustworthy warranty claims" className="w-full h-auto max-w-md mx-auto" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Do you actually pay out claims?</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Wondering if our warranty really delivers when it matters? You're not alone – lots of people feel unsure about vehicle warranties. That's exactly why we created Buy-a-Warranty to be different.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  We're here to give you genuine peace of mind, not vague promises.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">Yes, we do pay out – and we're proud of it</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">No confusing small print or hoops to jump through</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">Straightforward, honest cover that makes sense</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">Trusted by real drivers who've seen it work</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">No-nonsense protection you can rely on</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="text-gray-900 font-medium">Confidence that your vehicle's covered when you need it most</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included in My Warranty */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What's included in my warranty?</h2>
              <p className="text-xl text-gray-600 mb-8">
                When you join Buy-a-Warranty, you get our Platinum Plan as standard - giving you top-level protection with:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">All mechanical and electrical parts covered - from engine to electrics</span>
                    <span className="text-sm text-gray-600 block mt-1">(see full list below)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">Labour costs included - no surprise bills at the garage</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">Fault diagnostics</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">Consequential damage cover - if one part breaks another, we'll fix it</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">Access to trusted repair centres or choose your own</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-gray-900 font-medium">Flexible 0% APR payment options</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Coverage List */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Full list of covered components</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Petrol & Diesel */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Car className="w-8 h-8 text-primary" />
                    <h4 className="text-xl font-bold text-gray-900">Petrol & Diesel (Combustion Engine) Vehicles</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Engine & Internal Components (pistons, valves, camshafts, timing chains, seals, gaskets)</li>
                    <li>• Gearbox / Transmission Systems (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)</li>
                    <li>• Drivetrain & Clutch Assemblies (flywheel, driveshafts, differentials)</li>
                    <li>• Turbocharger & Supercharger Units</li>
                    <li>• Fuel Delivery Systems (tanks, pumps, injectors, fuel rails, fuel control electronics)</li>
                    <li>• Cooling & Heating Systems (radiators, thermostats, water pumps, cooling fans, heater matrix)</li>
                    <li>• Exhaust & Emissions Systems (catalytic converters, DPFs, OPFs, EGR valves, NOx sensors, AdBlue/Eolys systems)</li>
                    <li>• Braking Systems (ABS, calipers, cylinders, master cylinders)</li>
                    <li>• Suspension & Steering Systems (shocks, struts, steering racks, power/electric steering pumps, electronic suspension)</li>
                    <li>• Air Conditioning & Climate Control Systems</li>
                    <li>• Electrical Components & Charging Systems (alternators, starter motors, wiring looms, connectors, relays)</li>
                    <li>• Electronic Control Units (ECUs) & Sensors (engine management, ABS, traction control, emissions sensors)</li>
                    <li>• Lighting & Ignition Systems (headlights, indicators, ignition coils, switches, control modules)</li>
                    <li>• Factory-Fitted Multimedia & Infotainment Systems (screens, sat nav, audio, digital displays)</li>
                    <li>• Driver Assistance Systems (adaptive cruise control, lane assist, steering assist, parking sensors, reversing cameras)</li>
                    <li>• Safety Systems (airbags, seatbelts, pretensioners, safety restraint modules)</li>
                  </ul>
                </div>

                {/* Hybrid & PHEV */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Battery className="w-8 h-8 text-primary" />
                    <h4 className="text-xl font-bold text-gray-900">Hybrid & PHEV Vehicles (HEVs)</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">All petrol/diesel engine parts and labour plus:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Hybrid Drive Motors & ECUs</li>
                    <li>• Hybrid Battery Failure</li>
                    <li>• Power Control Units, Inverters & DC-DC Converters</li>
                    <li>• Regenerative Braking Systems</li>
                    <li>• High-Voltage Cables & Connectors</li>
                    <li>• Cooling Systems for Hybrid Components</li>
                    <li>• Charging Ports & On-Board Charging Modules</li>
                    <li>• Hybrid Transmission Components</li>
                  </ul>
                </div>

                {/* Electric Vehicles */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Battery className="w-8 h-8 text-green-600" />
                    <h4 className="text-xl font-bold text-gray-900">Electric vehicles (EVs)</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• EV Drive Motors & Reduction Gear</li>
                    <li>• EV Transmission & Reduction Gearbox Assemblies</li>
                    <li>• High-Voltage Battery Failure</li>
                    <li>• Power Control Units & Inverters</li>
                    <li>• On-Board Charger (OBC) & Charging Ports</li>
                    <li>• DC-DC Converters</li>
                    <li>• Thermal Management Systems</li>
                    <li>• High-Voltage Cables & Connectors</li>
                    <li>• EV-Specific Control Electronics</li>
                    <li>• Regenerative Braking System Components</li>
                  </ul>
                </div>

                {/* Motorcycles */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Bike className="w-8 h-8 text-primary" />
                    <h4 className="text-xl font-bold text-gray-900">Motorcycles (Petrol, Hybrid, EV)</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Engine / Motor & Drivetrain Components</li>
                    <li>• Gearbox / Transmission Systems</li>
                    <li>• ECUs, Sensors & Control Modules</li>
                    <li>• Electrical Systems & Wiring</li>
                    <li>• High-Voltage Battery Failure (Hybrid & EV)</li>
                    <li>• Suspension & Steering Systems</li>
                    <li>• Braking Systems</li>
                    <li>• Cooling & Thermal Systems</li>
                    <li>• Lighting & Ignition Systems</li>
                    <li>• Instrumentation & Rider Controls</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Extras */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Optional extras on all warranty plans</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center">
                <Car className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">Vehicle rental</h4>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">Wear & tear cover</h4>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <Car className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">Tyre replacement cover</h4>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">European repair cover</h4>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">Breakdown recovery</h4>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900">Transferable warranty</h4>
              </div>
            </div>
          </div>
        </section>

        {/* What's Not Covered */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What's not covered?</h3>
              <p className="text-xl text-gray-600">We like to keep things straightforward. Here's what's not covered:</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">• Pre-existing faults</h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">• Routine servicing & maintenance</h4>
                <p className="text-sm text-gray-600">(e.g., tyres, brake pads) unless added as add-ons</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">• Accident or collision damage</h4>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">• Vehicles used for hire or reward</h4>
                <p className="text-sm text-gray-600">(e.g., courier, taxi or rental)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Anything else I should know?</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-900">You can make as many claims as your selected plan allows - whether that's up to 10 times a year or completely unlimited</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-900">Some limits apply on certain items, but nothing unreasonable</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-900">Labour is covered up to £100 per hour - which is pretty generous compared to industry standards</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-900">We're all about transparency, so there are no hidden surprises - just straightforward cover you can rely on</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600">
                If you'd like to explore the finer details, you can check out the full terms and conditions{' '}
                <Link to="/terms" className="text-primary hover:underline">here</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Cancellation Rights */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cancellation rights</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-900 font-medium">You can cancel within 14 days of purchase for a full refund (if no repairs have been made)</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-900 font-medium">After this period, our standard cancellation policy applies</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-900 font-medium">No pressure - you have time to change your mind</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact us</h3>
              <p className="text-xl text-gray-600">Have questions? We're here to help:</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-xl p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                <p className="text-gray-600">0330 229 5040</p>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600">support@buyawarranty.co.uk</p>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                <p className="text-gray-600">Friendly support whenever you need us</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get protected?</h2>
            <p className="text-xl mb-8 text-white/90">Get your personalised warranty quote in minutes.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-4">
                  Get my quote
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