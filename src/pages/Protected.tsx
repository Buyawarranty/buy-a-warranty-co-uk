import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Check, Shield, Clock, FileText, Phone, Mail, Car, Zap, X, Menu } from 'lucide-react';
import { SEOHead } from "@/components/SEOHead";
import { Link } from 'react-router-dom';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import pandaFastClaims from "@/assets/panda-fast-claims.png";
import pandaEvWarranty from "@/assets/panda-ev-warranty.png";

const Protected = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <SEOHead 
        title="What's Covered in My Warranty | Buy-a-Warranty"
        description="Discover what's covered in your Buy-a-Warranty protection plan. Comprehensive coverage for cars, vans, and motorbikes with clear terms and no hidden surprises."
        keywords="warranty coverage, what's covered, vehicle protection, car warranty, van warranty, motorbike warranty"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background shadow-sm py-2 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  <img 
                    src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                    alt="Buy a Warranty" 
                    className="h-6 sm:h-8 w-auto"
                  />
                </Link>
              </div>

              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <Link to="/" className="text-foreground hover:text-primary font-medium text-sm xl:text-base">Warranty Plans</Link>
                <Link to="/what-is-covered" className="text-primary hover:text-primary/80 font-medium text-sm xl:text-base">What's Covered</Link>
                <Link to="/claims" className="text-foreground hover:text-primary font-medium text-sm xl:text-base">Make a Claim</Link>
                <Link to="/faq" className="text-foreground hover:text-primary font-medium text-sm xl:text-base">FAQs</Link>
                <Link to="/contact-us" className="text-foreground hover:text-primary font-medium text-sm xl:text-base">Contact Us</Link>
              </nav>

              <div className="hidden lg:flex items-center space-x-3">
                <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851] hover:border-[#1da851] px-3 text-sm"
                  >
                    WhatsApp Us
                  </Button>
                </a>
                <Link to="/">
                  <Button 
                    size="sm"
                    className="bg-primary text-white hover:bg-primary/90 px-3 text-sm"
                  >
                    Get my quote
                  </Button>
                </Link>
              </div>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="lg" className="lg:hidden p-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-8">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </div>
                    
                    <nav className="flex flex-col space-y-6 flex-1">
                      <Link to="/" className="text-foreground hover:text-primary font-medium text-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Warranty Plans
                      </Link>
                      <Link to="/what-is-covered" className="text-primary hover:text-primary/80 font-medium text-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        What's Covered
                      </Link>
                      <Link to="/claims" className="text-foreground hover:text-primary font-medium text-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Make a Claim
                      </Link>
                      <Link to="/faq" className="text-foreground hover:text-primary font-medium text-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        FAQs
                      </Link>
                      <Link to="/contact-us" className="text-foreground hover:text-primary font-medium text-lg transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Contact Us
                      </Link>
                    </nav>

                    <div className="space-y-4 mt-8">
                      <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851] hover:border-[#1da851]">
                          WhatsApp Us
                        </Button>
                      </a>
                      <Link to="/" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary text-white hover:bg-primary/90">
                          Get my quote
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Compact Hero Section */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto relative">
              <div className="absolute top-0 right-0 hidden md:block">
                <TrustpilotHeader className="h-7" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                What's covered in my warranty
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                One solid plan for cars, vans, and motorbikes - electric, hybrid, petrol or diesel.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-semibold text-sm text-foreground">No confusing packages</h3>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-semibold text-sm text-foreground">No sneaky rejections</h3>
                </div>
                <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-semibold text-sm text-foreground">Just hassle-free cover</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Eligibility & Claims Process */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Eligibility */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Eligibility & Claims</h2>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center border">
                      <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Vehicle Age</h3>
                      <p className="text-xs text-muted-foreground">Up to 15 years</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border">
                      <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Mileage</h3>
                      <p className="text-xs text-muted-foreground">Up to 150k miles</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border">
                      <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm mb-1">Duration</h3>
                      <p className="text-xs text-muted-foreground">12-36 months</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <h3 className="font-semibold mb-3">Making a claim:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">1</span>
                        <span>Call 0330 229 5045 or use online form</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">2</span>
                        <span>Same-day review during office hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">3</span>
                        <span>Direct garage payment or quick reimbursement</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claims Image */}
                <div className="flex items-center justify-center">
                  <img 
                    src={pandaFastClaims} 
                    alt="Fast claims processing" 
                    className="w-full max-w-[250px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Coverage Overview */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Platinum Plan Coverage</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">All mechanical and electrical parts covered</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Labour costs included (up to £100/hour)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Fault diagnostics & consequential damage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Choose your garage or use trusted partners</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Pay-outs within 90 minutes of approval</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <img 
                    src={pandaEvWarranty} 
                    alt="Warranty coverage" 
                    className="w-full max-w-[200px] mx-auto"
                  />
                </div>
              </div>

              {/* Compact Coverage Types */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Petrol & Diesel</h4>
                    <p className="text-xs text-muted-foreground">All combustion engine components</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Hybrid & Electric</h4>
                    <p className="text-xs text-muted-foreground">Green technology protection</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-sm mb-1">Motorcycles</h4>
                    <p className="text-xs text-muted-foreground">Two-wheeled coverage</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Coverage Accordion - More Compact */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="petrol-diesel" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold">
                    Petrol & Diesel Vehicle Components
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>Engine & Internal:</strong> pistons, valves, camshafts, timing chains, seals, gaskets</p>
                        <p><strong>Transmission:</strong> manual, automatic, DSG, CVT, dual-clutch, transfer boxes</p>
                        <p><strong>Drivetrain:</strong> flywheel, driveshafts, differentials, clutch assemblies</p>
                        <p><strong>Turbo/Supercharger:</strong> complete units</p>
                        <p><strong>Fuel Systems:</strong> tanks, pumps, injectors, fuel rails, control electronics</p>
                        <p><strong>Cooling/Heating:</strong> radiators, thermostats, water pumps, fans, heater matrix</p>
                        <p><strong>Exhaust/Emissions:</strong> catalytic converters, DPFs, EGR valves, NOx sensors</p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>Braking:</strong> ABS, calipers, cylinders, master cylinders</p>
                        <p><strong>Suspension/Steering:</strong> shocks, struts, steering racks, power steering</p>
                        <p><strong>Air Con/Climate:</strong> complete systems</p>
                        <p><strong>Electrical:</strong> alternators, starter motors, wiring, connectors, relays</p>
                        <p><strong>ECUs & Sensors:</strong> engine management, ABS, emissions sensors</p>
                        <p><strong>Lighting/Ignition:</strong> headlights, indicators, ignition coils, switches</p>
                        <p><strong>Infotainment:</strong> factory-fitted screens, sat nav, audio, displays</p>
                        <p><strong>Driver Assist:</strong> cruise control, lane assist, parking sensors, cameras</p>
                        <p><strong>Safety:</strong> airbags, seatbelts, pretensioners, restraint modules</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hybrid-phev" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold">
                    Hybrid & PHEV Vehicles (All petrol/diesel plus:)
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>Hybrid Drive Motors & ECUs</strong></p>
                        <p><strong>Hybrid Battery Failure</strong></p>
                        <p><strong>Power Control Units, Inverters & DC-DC Converters</strong></p>
                        <p><strong>Regenerative Braking Systems</strong></p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>High-Voltage Cables & Connectors</strong></p>
                        <p><strong>Cooling Systems for Hybrid Components</strong></p>
                        <p><strong>Charging Ports & On-Board Charging Modules</strong></p>
                        <p><strong>Hybrid Transmission Components</strong></p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="electric-vehicles" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold">
                    Electric Vehicles (EVs)
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>EV Drive Motors & Reduction Gear</strong></p>
                        <p><strong>EV Transmission & Reduction Gearbox</strong></p>
                        <p><strong>High-Voltage Battery Failure</strong></p>
                        <p><strong>Power Control Units & Inverters</strong></p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>On-Board Charger (OBC) & Charging Ports</strong></p>
                        <p><strong>High-Voltage Cables & Connectors</strong></p>
                        <p><strong>EV-Specific Control Electronics</strong></p>
                        <p><strong>Regenerative Braking Components</strong></p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="motorcycles" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold">
                    Motorcycles (Petrol, Hybrid, EV)
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>Engine/Motor & Drivetrain</strong></p>
                        <p><strong>Gearbox/Transmission Systems</strong></p>
                        <p><strong>ECUs, Sensors & Control Modules</strong></p>
                        <p><strong>Electrical Systems & Wiring</strong></p>
                        <p><strong>High-Voltage Battery (Hybrid & EV)</strong></p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>Suspension & Steering</strong></p>
                        <p><strong>Braking Systems</strong></p>
                        <p><strong>Cooling & Thermal Systems</strong></p>
                        <p><strong>Lighting & Ignition</strong></p>
                        <p><strong>Instrumentation & Controls</strong></p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="optional-extras" className="border-border/50">
                  <AccordionTrigger className="text-left font-semibold">
                    Optional Add-ons
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>Vehicle rental</strong></p>
                        <p><strong>Wear & tear cover</strong></p>
                        <p><strong>Tyre replacement cover</strong></p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>European repair cover</strong></p>
                        <p><strong>Breakdown recovery</strong></p>
                        <p><strong>Transferable warranty</strong></p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Compact Exclusions & Additional Info */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* What's Not Covered */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">What's not covered?</h2>
                  <div className="bg-white rounded-lg p-4 border space-y-2">
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Pre-existing faults</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Routine servicing (unless added as add-on)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Accident or collision damage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Commercial use (taxi, courier, rental)</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Key Info</h2>
                  <div className="bg-white rounded-lg p-4 border space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Up to 10 claims/year or unlimited (plan dependent)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Labour covered up to £100/hour</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">14-day cooling-off period for full refund</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Full <Link to="/terms" className="text-primary hover:underline">terms & conditions</Link> available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Contact & CTA */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Get started or contact us</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Customer Support</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>support@buyawarranty.co.uk</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>0330 229 5040</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Claims & Repairs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>claims@buyawarranty.co.uk</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>0330 229 5045</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link to="/">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get my quote
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Protected;