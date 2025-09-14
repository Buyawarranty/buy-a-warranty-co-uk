import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Shield, Clock, FileText, Phone, Mail } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Hero Section */}
        <section className="relative py-20">
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
                  <h3 className="font-semibold text-lg mb-3 text-foreground">• No confusing packages</h3>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">• No sneaky rejections</h3>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">• Just hassle-free cover</h3>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-lg font-medium text-foreground">✔ Clear, easy-to-understand protection</span>
              </div>
              
              <p className="text-muted-foreground italic">
                Because maintaining your vehicle shouldn't be a headache.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Eligibility at plan start
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Vehicle Age</h3>
                    <p className="text-muted-foreground">• Vehicles up to 15 years old</p>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Mileage</h3>
                    <p className="text-muted-foreground">• Vehicles up to 150,000 miles</p>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Plan Duration</h3>
                    <p className="text-muted-foreground">• Plans for 12, 24, or 36 months</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Claims Process Section */}
        <section className="py-16">
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
                      <span>• Just follow a few quick steps to start your claim</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• We'll guide you through the process so you know exactly what to do</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Repairs are handled quickly and professionally</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Our support team is here if you need help at any stage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• You're free to choose your own garage, or we can recommend a trusted one</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• We aim to process pay-outs within 90 minutes of approval</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaFastClaims} 
                    alt="Fast claims processing with panda mascot holding a stopwatch" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-center mb-8 text-foreground">
                If your vehicle develops a fault:
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <CardTitle className="text-center">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>• Call 0330 229 5045</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      • Or complete our quick online form in the 'Make a claim' section
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <CardTitle className="text-center">Fast Repairs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2 text-sm">
                      <p>• We will review your claim the same day (during office hours)</p>
                      <p>• Our goal is to get you back on the road promptly and with minimal fuss</p>
                      <p className="font-medium">• No stress. No hassle. Fast authorisation</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <CardTitle className="text-center">Once your repair is approved:</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="space-y-2 text-sm">
                      <p>• We'll pay the garage directly so you're not left out of pocket</p>
                      <p>• - Or- in some cases if you've already paid, we can reimburse you quickly with a valid invoice. No delays, no drama.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-card/30">
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
                      <span>• ✔ Yes, we do pay out – and we're proud of it</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• ✔ No confusing small print or hoops to jump through</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• ✔ Straightforward, honest cover that makes sense</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• ✔ Trusted by real drivers who've seen it work</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• ✔ No-nonsense protection you can rely on</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• ✔ Confidence that your vehicle's covered when you need it most</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaHappyCar} 
                    alt="Happy panda mascot with car showing warranty satisfaction" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Details */}
        <section className="py-16">
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
                      <span>• All mechanical and electrical parts covered - from engine to electrics (see full list)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Labour costs included - no surprise bills at the garage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Fault diagnostics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Consequential damage cover - if one part breaks another, we'll fix it</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Access to trusted repair centres or choose your own</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>• Flexible 0% APR payment options</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaEvWarranty} 
                    alt="Panda mascot with electric vehicle and warranty active badge" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
                Full list of covered components
              </h3>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="petrol-diesel" className="border-border/50">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    Petrol & Diesel (Combustion Engine) Vehicles
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p>• Engine & Internal Components (pistons, valves, camshafts, timing chains, seals, gaskets)</p>
                        <p>• Gearbox / Transmission Systems (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)</p>
                        <p>• Drivetrain & Clutch Assemblies (flywheel, driveshafts, differentials)</p>
                        <p>• Turbocharger & Supercharger Units</p>
                        <p>• Fuel Delivery Systems (tanks, pumps, injectors, fuel rails, fuel control electronics)</p>
                        <p>• Cooling & Heating Systems (radiators, thermostats, water pumps, cooling fans, heater matrix)</p>
                        <p>• Exhaust & Emissions Systems (catalytic converters, DPFs, OPFs, EGR valves, NOx sensors, AdBlue/Eolys systems)</p>
                        <p>• Braking Systems (ABS, calipers, cylinders, master cylinders)</p>
                      </div>
                      <div className="space-y-2">
                        <p>• Suspension & Steering Systems (shocks, struts, steering racks, power/electric steering pumps, electronic suspension)</p>
                        <p>• Air Conditioning & Climate Control Systems</p>
                        <p>• Electrical Components & Charging Systems (alternators, starter motors, wiring looms, connectors, relays)</p>
                        <p>• Electronic Control Units (ECUs) & Sensors (engine management, ABS, traction control, emissions sensors)</p>
                        <p>• Lighting & Ignition Systems (headlights, indicators, ignition coils, switches, control modules)</p>
                        <p>• Factory-Fitted Multimedia & Infotainment Systems (screens, sat nav, audio, digital displays)</p>
                        <p>• Driver Assistance Systems (adaptive cruise control, lane assist, steering assist, parking sensors, reversing cameras)</p>
                        <p>• Safety Systems (airbags, seatbelts, pretensioners, safety restraint modules)</p>
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
                        <p>• Hybrid Drive Motors & ECUs</p>
                        <p>• Hybrid Battery Failure</p>
                        <p>• Power Control Units, Inverters & DC-DC Converters</p>
                        <p>• Regenerative Braking Systems</p>
                      </div>
                      <div className="space-y-2">
                        <p>• High-Voltage Cables & Connectors</p>
                        <p>• Cooling Systems for Hybrid Components</p>
                        <p>• Charging Ports & On-Board Charging Modules</p>
                        <p>• Hybrid Transmission Components</p>
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
                        <p>• EV Drive Motors & Reduction Gear</p>
                        <p>• EV Transmission & Reduction Gearbox Assemblies</p>
                        <p>• High-Voltage Battery Failure</p>
                        <p>• Power Control Units & Inverters</p>
                        <p>• On-Board Charger (OBC) & Charging Ports</p>
                      </div>
                      <div className="space-y-2">
                        <p>• DC-DC Converters</p>
                        <p>• Thermal Management Systems</p>
                        <p>• High-Voltage Cables & Connectors</p>
                        <p>• EV-Specific Control Electronics</p>
                        <p>• Regenerative Braking System Components</p>
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
                        <p>• Engine / Motor & Drivetrain Components</p>
                        <p>• Gearbox / Transmission Systems</p>
                        <p>• ECUs, Sensors & Control Modules</p>
                        <p>• Electrical Systems & Wiring</p>
                        <p>• High-Voltage Battery Failure (Hybrid & EV)</p>
                      </div>
                      <div className="space-y-2">
                        <p>• Suspension & Steering Systems</p>
                        <p>• Braking Systems</p>
                        <p>• Cooling & Thermal Systems</p>
                        <p>• Lighting & Ignition Systems</p>
                        <p>• Instrumentation & Rider Controls</p>
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
                        <p>• Vehicle rental</p>
                        <p>• Wear & tear cover</p>
                        <p>• Tyre replacement cover</p>
                      </div>
                      <div className="space-y-2">
                        <p>• European repair cover</p>
                        <p>• Breakdown recovery</p>
                        <p>• Transferable warranty</p>
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
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>• Pre-existing faults</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>• Routine servicing & maintenance (e.g., tyres, brake pads) unless added as add-ons</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>• Accident or collision damage</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>• Vehicles used for hire or reward (e.g., courier, taxi or rental)</span>
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
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                Cancellation rights
              </h2>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>• You can cancel within 14 days of purchase for a full refund (if no repairs have been made)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>• After this period, our standard cancellation policy applies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>• No pressure - you have time to change your mind</span>
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
              <h2 className="text-3xl font-bold mb-12 text-foreground">
                Contact us
              </h2>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50">
                <p className="text-lg mb-8 text-muted-foreground">
                  Have questions? We're here to help:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>• Email: support@buyawarranty.co.uk</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>• Phone: 0330 229 5040</span>
                  </div>
                </div>
                
                <p className="mt-6 text-muted-foreground">
                  • Friendly support whenever you need us
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