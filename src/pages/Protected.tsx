import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Shield, Clock, FileText, Phone, Mail, Car, Zap, X } from 'lucide-react';
import { SEOHead } from "@/components/SEOHead";
import { Link } from 'react-router-dom';
import pandaFastClaims from "@/assets/panda-fast-claims.png";
import pandaHappyCar from "@/assets/panda-happy-car.png";
import pandaEvWarranty from "@/assets/panda-ev-warranty.png";
import pandaGarageService from "@/assets/panda-garage-service.png";

const Protected = () => {
  return (
    <>
      <SEOHead 
        title="What's Covered in My Warranty | Buy-a-Warranty"
        description="Discover what's covered in your Buy-a-Warranty protection plan. Comprehensive coverage for cars, vans, and motorbikes with clear terms and no hidden surprises."
        keywords="warranty coverage, what's covered, vehicle protection, car warranty, van warranty, motorbike warranty"
      />
        <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-6xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 text-foreground">
                What's covered in my warranty
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                At Buy-a-Warranty, we like to keep things straightforward. One solid plan that works for cars, vans, and motorbikes - whether you're driving electric, hybrid, petrol or diesel.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">No confusing packages</h3>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">No sneaky rejections</h3>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">Just hassle-free cover</h3>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-lg font-medium text-foreground">Clear, easy-to-understand protection</span>
              </div>
              
              <p className="text-muted-foreground italic">
                Because maintaining your vehicle shouldn't be a headache.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Eligibility at plan start
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Vehicle Age</h3>
                    <p className="text-muted-foreground">Vehicles up to 15 years old</p>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Mileage</h3>
                    <p className="text-muted-foreground">Vehicles up to 150,000 miles</p>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Plan Duration</h3>
                    <p className="text-muted-foreground">Plans for 12, 24, or 36 months</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Claims Process Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Our fast and easy claims process
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-foreground">
                    Is it easy to make a claim and get my repair done?
                  </h3>
                  <p className="text-lg mb-8 text-muted-foreground">
                    Yes, absolutely - we've made it simple and hassle-free.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Just follow a few quick steps to start your claim</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>We'll guide you through the process so you know exactly what to do</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Repairs are handled quickly and professionally</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Our support team is here if you need help at any stage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>You're free to choose your own garage, or we can recommend a trusted one</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>We aim to process pay-outs within 90 minutes of approval</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaFastClaims} 
                    alt="Fast claims processing with panda mascot holding a stopwatch" 
                    className="w-full max-w-[280px] mx-auto"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-center mb-8 text-foreground">
                If your vehicle develops a fault:
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <CardTitle className="text-center">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Call 0330 229 5045</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Or complete our quick online form in the <Link to="/claims" className="text-primary hover:underline">'Make a claim'</Link> section
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <CardTitle className="text-center">Fast Repairs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2 text-sm">
                      <p>We will review your claim the same day (during office hours)</p>
                      <p>Our goal is to get you back on the road promptly and with minimal fuss</p>
                      <p className="font-medium">No stress. No hassle. Fast authorisation</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-white backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <CardTitle className="text-center">Once your repair is approved:</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2 text-sm">
                      <p>We'll pay the garage directly so you're not left out of pocket</p>
                      <p>- Or- in some cases if you've already paid, we can reimburse you quickly with a valid invoice. No delays, no drama.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Do you actually pay out claims?
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg mb-8 text-muted-foreground">
                    Wondering if our warranty really delivers when it matters? You're not alone – lots of people feel unsure about vehicle warranties. That's exactly why we created Buy-a-Warranty to be different.
                  </p>
                  <p className="text-lg font-medium mb-8 text-foreground">
                    We're here to give you genuine peace of mind, not vague promises.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Yes, we do pay out – and we're proud of it</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>No confusing small print or hoops to jump through</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Straightforward, honest cover that makes sense</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Trusted by real drivers who've seen it work</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>No-nonsense protection you can rely on</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Confidence that your vehicle's covered when you need it most</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaHappyCar} 
                    alt="Happy panda mascot with car showing warranty satisfaction" 
                    className="w-full max-w-[280px] mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Details */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                What's included in my warranty?
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                <div>
                  <p className="text-lg mb-8 text-muted-foreground">
                    When you join Buy-a-Warranty, you get our Platinum Plan as standard - giving you top-level protection with:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>All mechanical and electrical parts covered - from engine to electrics (see full list)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Labour costs included - no surprise bills at the garage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Fault diagnostics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Consequential damage cover - if one part breaks another, we'll fix it</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Access to trusted repair centres or choose your own</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>Flexible 0% APR payment options</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaEvWarranty} 
                    alt="Panda mascot with electric vehicle and warranty active badge" 
                    className="w-full max-w-[280px] mx-auto"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
                Full list of covered components
              </h3>

              {/* FAQ-style component boxes */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <Car className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2 text-primary">Petrol & Diesel Vehicles</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive coverage for all combustion engine components</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <Zap className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2 text-primary">Hybrid & Electric Vehicles</h4>
                    <p className="text-sm text-muted-foreground">Specialized protection for modern green technology</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg mb-2 text-primary">Motorcycles</h4>
                    <p className="text-sm text-muted-foreground">Complete coverage for two-wheeled vehicles</p>
                  </CardContent>
                </Card>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="petrol-diesel" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Petrol & Diesel (Combustion Engine) Vehicles
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Engine & Internal Components</strong> (pistons, valves, camshafts, timing chains, seals, gaskets)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Gearbox / Transmission Systems</strong> (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Drivetrain & Clutch Assemblies</strong> (flywheel, driveshafts, differentials)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Turbocharger & Supercharger Units</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Fuel Delivery Systems</strong> (tanks, pumps, injectors, fuel rails, fuel control electronics)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Cooling & Heating Systems</strong> (radiators, thermostats, water pumps, cooling fans, heater matrix)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Exhaust & Emissions Systems</strong> (catalytic converters, DPFs, OPFs, EGR valves, NOx sensors, AdBlue/Eolys systems)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Braking Systems</strong> (ABS, calipers, cylinders, master cylinders)</p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Suspension & Steering Systems</strong> (shocks, struts, steering racks, power/electric steering pumps, electronic suspension)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Air Conditioning & Climate Control Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Electrical Components & Charging Systems</strong> (alternators, starter motors, wiring looms, connectors, relays)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Electronic Control Units (ECUs) & Sensors</strong> (engine management, ABS, traction control, emissions sensors)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Lighting & Ignition Systems</strong> (headlights, indicators, ignition coils, switches, control modules)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Factory-Fitted Multimedia & Infotainment Systems</strong> (screens, sat nav, audio, digital displays)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Driver Assistance Systems</strong> (adaptive cruise control, lane assist, steering assist, parking sensors, reversing cameras)</p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Safety Systems</strong> (airbags, seatbelts, pretensioners, safety restraint modules)</p>
                         </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hybrid-phev" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Hybrid & PHEV Vehicles
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="mb-4">All petrol/diesel engine parts and labour plus:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Hybrid Drive Motors & ECUs</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Hybrid Battery Failure</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Power Control Units, Inverters & DC-DC Converters</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Regenerative Braking Systems</strong></p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>High-Voltage Cables & Connectors</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Cooling Systems for Hybrid Components</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Charging Ports & On-Board Charging Modules</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Hybrid Transmission Components</strong></p>
                         </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="electric-vehicles" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Electric vehicles (EVs)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>EV Drive Motors & Reduction Gear</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>EV Transmission & Reduction Gearbox Assemblies</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>High-Voltage Battery Failure</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Power Control Units & Inverters</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>On-Board Charger (OBC) & Charging Ports</strong></p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>DC-DC Converters</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Thermal Management Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>High-Voltage Cables & Connectors</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>EV-Specific Control Electronics</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Regenerative Braking System Components</strong></p>
                         </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="motorcycles" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Motorcycles (Petrol, Hybrid, EV)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Engine / Motor & Drivetrain Components</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Gearbox / Transmission Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>ECUs, Sensors & Control Modules</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Electrical Systems & Wiring</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>High-Voltage Battery Failure</strong> (Hybrid & EV)</p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Suspension & Steering Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Braking Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Cooling & Thermal Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Lighting & Ignition Systems</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Instrumentation & Rider Controls</strong></p>
                         </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="optional-extras" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Optional extras on all warranty plans
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Vehicle rental</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Wear & tear cover</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Tyre replacement cover</strong></p>
                         </div>
                       </div>
                       <div className="space-y-2">
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>European repair cover</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Breakdown recovery</strong></p>
                         </div>
                         <div className="flex items-start gap-3">
                           <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                           <p><strong>Transferable warranty</strong></p>
                         </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* What's Not Covered */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                What's not covered?
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg mb-8 text-muted-foreground">
                    We like to keep things straightforward. Here's what's not covered:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Pre-existing faults</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Routine servicing & maintenance (e.g., tyres, brake pads) unless added as add-ons</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Accident or collision damage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <X className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <span>Vehicles used for hire or reward (e.g., courier, taxi or rental)</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaGarageService} 
                    alt="Panda mascot with mechanic and car on lift" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Anything else I should know?
              </h2>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50 space-y-6">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>• You can make as many claims as your selected plan allows - whether that's up to 10 times a year or completely unlimited</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>• Some limits apply on certain items, but nothing unreasonable</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>• Labour is covered up to £100 per hour - which is pretty generous compared to industry standards</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>• We're all about transparency, so there are no hidden surprises - just straightforward cover you can rely on</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>• If you'd like to explore the finer details, you can check out the full terms and conditions <Link to="/terms" className="text-primary hover:underline">here</Link></span>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <Link to="/">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get my quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Rights */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Cancellation rights
              </h2>
              
              <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-border/50">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>You can cancel within 14 days of purchase for a full refund (if no repairs have been made)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>After this period, our standard cancellation policy applies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>No pressure - you have time to change your mind</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-foreground">
                Contact us
              </h2>
              
              <div className="bg-white backdrop-blur-sm rounded-lg p-8 border border-border/50">
                <p className="text-lg mb-8 text-muted-foreground">
                  Have questions? We're here to help:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Customer Sales and Support */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">Customer sales and support</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span>Email: support@buyawarranty.co.uk</span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>Phone: 0330 229 5040</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Claims and Repairs */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">Claims and repairs</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span>Email: claims@buyawarranty.co.uk</span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>Phone: 0330 229 5045</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground italic">
                  Friendly support whenever you need us
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Protected;