import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, ChevronDown, CheckCircle, Phone, Mail, Shield, Clock, Users, Wrench, FileText, Star, X, Fuel, Battery, Zap, Bike, Crown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

const Protected = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const vehicleTypes = [
    {
      id: 'petrol-diesel',
      title: 'Petrol & Diesel (Combustion Engine) Vehicles',
      components: [
        'Engine & Internal Components (pistons, valves, camshafts, timing chains, seals, gaskets)',
        'Gearbox / Transmission Systems (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)',
        'Drivetrain & Clutch Assemblies (flywheel, driveshafts, differentials)',
        'Turbocharger & Supercharger Units',
        'Fuel Delivery Systems (tanks, pumps, injectors, fuel rails, fuel control electronics)',
        'Cooling & Heating Systems (radiators, thermostats, water pumps, cooling fans, heater matrix)',
        'Exhaust & Emissions Systems (catalytic converters, DPFs, OPFs, EGR valves, NOx sensors, AdBlue/Eolys systems)',
        'Braking Systems (ABS, calipers, cylinders, master cylinders)',
        'Suspension & Steering Systems (shocks, struts, steering racks, power/electric steering pumps, electronic suspension)',
        'Air Conditioning & Climate Control Systems',
        'Electrical Components & Charging Systems (alternators, starter motors, wiring looms, connectors, relays)',
        'Electronic Control Units (ECUs) & Sensors (engine management, ABS, traction control, emissions sensors)',
        'Lighting & Ignition Systems (headlights, indicators, ignition coils, switches, control modules)',
        'Factory-Fitted Multimedia & Infotainment Systems (screens, sat nav, audio, digital displays)',
        'Driver Assistance Systems (adaptive cruise control, lane assist, steering assist, parking sensors, reversing cameras)',
        'Safety Systems (airbags, seatbelts, pretensioners, safety restraint modules)',
        'Convertible power-hood, motors, hydraulic parts , buttons, switches, wiring, sensors and related parts'
      ]
    },
    {
      id: 'hybrid-phev',
      title: 'Hybrid & PHEV Vehicles',
      components: [
        'Includes all related petrol/diesel engine parts and labour plus:',
        'Hybrid Drive Motors & ECUs',
        'Hybrid Battery Failure',
        'Power Control Units, Inverters & DC-DC Converters',
        'Regenerative Braking Systems',
        'High-Voltage Cables & Connectors',
        'Cooling Systems for Hybrid Components',
        'Charging Ports & On-Board Charging Modules',
        'Hybrid Transmission Components'
      ]
    },
    {
      id: 'electric-vehicles',
      title: 'Electric vehicles (EVs)',
      components: [
        'Includes all related petrol/diesel engine parts and labour plus:',
        'EV Drive Motors & Reduction Gear',
        'EV Transmission & Reduction Gearbox Assemblies',
        'High-Voltage Battery Failure',
        'Power Control Units & Inverters',
        'On-Board Charger (OBC) & Charging Ports',
        'DC-DC Converters',
        'Thermal Management Systems',
        'High-Voltage Cables & Connectors',
        'EV-Specific Control Electronics',
        'Regenerative Braking System Components'
      ]
    },
    {
      id: 'motorcycles',
      title: 'Motorcycles (Petrol, Hybrid, EV)',
      components: [
        'Engine / Motor & Drivetrain Components',
        'Gearbox / Transmission Systems',
        'ECUs, Sensors & Control Modules',
        'Electrical Systems & Wiring',
        'High-Voltage Battery Failure (Hybrid & EV)',
        'Suspension & Steering Systems',
        'Braking Systems',
        'Cooling & Thermal Systems',
        'Lighting & Ignition Systems',
        'Instrumentation & Rider Controls'
      ]
    },
    {
      id: 'not-covered',
      title: "What's not covered",
      components: [
        'We keep things straightforward and transparent.',
        '',
        "What's Not Included:",
        'Pre-existing faults',
        'Routine servicing and maintenance (such as fluids or brake pads)',
        'Vehicles used for hire or reward (including taxis, rentals, or couriers)'
      ]
    }
  ];

  const getVehicleConfig = (vehicleId: string) => {
    switch (vehicleId) {
      case 'petrol-diesel':
        return { 
          icon: Fuel, 
          bgColor: 'bg-foreground', 
          bgColorHover: 'hover:bg-foreground/90' 
        };
      case 'hybrid-phev':
        return { 
          icon: Battery, 
          bgColor: 'bg-muted-foreground', 
          bgColorHover: 'hover:bg-muted-foreground/90' 
        };
      case 'electric-vehicles':
        return { 
          icon: Zap, 
          bgColor: 'bg-primary', 
          bgColorHover: 'hover:bg-primary/90' 
        };
      case 'motorcycles':
        return { 
          icon: Bike, 
          bgColor: 'bg-success', 
          bgColorHover: 'hover:bg-success/90' 
        };
      case 'not-covered':
        return { 
          icon: X, 
          bgColor: 'bg-red-100', 
          bgColorHover: 'hover:bg-red-200' 
        };
      default:
        return { 
          icon: Fuel, 
          bgColor: 'bg-muted-foreground', 
          bgColorHover: 'hover:bg-muted-foreground/90' 
        };
    }
  };

  const VehicleSection = ({ vehicleType }: { vehicleType: typeof vehicleTypes[0] }) => {
    const config = getVehicleConfig(vehicleType.id);
    const IconComponent = config.icon;
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection(vehicleType.id)}
          className={`w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-300 ${config.bgColor} ${config.bgColorHover} ${
            vehicleType.id === 'not-covered' ? 'text-red-800' : 'text-white'
          }`}
        >
          <div className="flex items-center">
            <IconComponent className="w-6 h-6 mr-3 flex-shrink-0" />
            <span className="font-bold text-lg">{vehicleType.title}</span>
          </div>
          <ChevronDown 
            className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
              openSections[vehicleType.id] ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        <div className={`overflow-hidden transition-all duration-200 ease-out ${
          openSections[vehicleType.id] 
            ? 'max-h-screen opacity-100 animate-accordion-down' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 py-4 bg-white">
            <ul className="space-y-2 transform translate-y-0">
              {vehicleType.components.map((component, index) => {
                if (vehicleType.id === 'not-covered') {
                  // Handle special formatting for not-covered section
                  if (component === '') {
                    return <li key={index} className="h-2"></li>; // Empty space
                  }
                  if (component === 'We keep things straightforward and transparent.' || component === "What's Not Included:") {
                    return (
                      <li key={index} className="text-gray-700">
                        <span className="text-sm leading-relaxed font-medium">{component}</span>
                      </li>
                    );
                  }
                  // Items with X
                  return (
                    <li key={index} className="flex items-start text-gray-700">
                      <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{component}</span>
                    </li>
                  );
                }
                // Default formatting for covered items
                return (
                  <li key={index} className="flex items-start text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{component}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="What's Covered in My Car Warranty | Comprehensive UK Vehicle Protection"
        description="Discover what's covered in your Buy-a-Warranty plan. Full mechanical and electrical protection for petrol, diesel, hybrid, and electric vehicles. No hidden exclusions."
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                  alt="Buy a Warranty" 
                  className="h-6 sm:h-8 w-auto"
                />
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              
              <Link to="/what-is-covered" className="text-primary font-medium">What's Covered</Link>
              <Link to="/make-a-claim" className="text-gray-700 hover:text-primary transition-colors">Make a Claim</Link>
              <Link to="/faq" className="text-gray-700 hover:text-primary transition-colors">FAQs</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-primary transition-colors">Contact Us</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer" 
                 className="text-green-600 hover:text-green-700 font-medium transition-colors">
                WhatsApp Us
              </a>
              <Link to="/">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6">
                  Get my quote
                </Button>
              </Link>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-12 w-12" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/what-is-covered" className="text-lg font-medium text-primary">
                    What's Covered
                  </Link>
                  <Link to="/make-a-claim" className="text-lg font-medium text-gray-700 hover:text-primary transition-colors">
                    Make a Claim
                  </Link>
                  <Link to="/faq" className="text-lg font-medium text-gray-700 hover:text-primary transition-colors">
                    FAQs
                  </Link>
                  <Link to="/contact-us" className="text-lg font-medium text-gray-700 hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                  <div className="pt-4 border-t">
                    <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer" 
                       className="block text-green-600 hover:text-green-700 font-medium mb-4">
                      WhatsApp Us
                    </a>
                    <Link to="/">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What's covered in my <span className="text-primary">warranty</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            At Buy-a-Warranty, we like to keep things straightforward. One solid plan that works for cars, vans, and motorbikes - whether you're driving electric, hybrid, petrol or diesel.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-green-500" />
              <span className="font-medium">No confusing packages</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="font-medium">No hidden exclusions</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <Clock className="w-6 h-6 text-green-500" />
              <span className="font-medium">Fast payouts and support</span>
            </div>
          </div>
          
          <p className="text-lg text-gray-900 font-semibold mt-8">
            If something goes wrong, we look for reasons to say yes!
          </p>
        </div>
      </section>

      {/* Full Coverage List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Full list of <span className="text-primary">covered components</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Click on each vehicle type to see the complete list of covered components
            </p>
          </div>
          
          <div className="space-y-4 max-w-5xl mx-auto">
            {vehicleTypes.map((vehicleType) => (
              <VehicleSection key={vehicleType.id} vehicleType={vehicleType} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to protect your vehicle?
          </h2>
          <Link to="/">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-3">
              Get my quote
            </Button>
          </Link>
        </div>
      </section>

      {/* Platinum Warranty Plan Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Crown className="w-12 h-12 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Platinum Warranty Plan
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Discover the complete details of our comprehensive Platinum Warranty Plan. 
              This document outlines all the specific coverage, benefits, and protection 
              included in your premium warranty package.
            </p>
            <p className="text-md text-gray-500 mb-8">
              Review the full Platinum plan details to understand exactly what's covered, 
              including all mechanical and electrical components, claim procedures, and 
              the extensive protection we provide for your vehicle.
            </p>
            <a 
              href="/Platinum-warranty-plan_v2.2-6.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              <Crown className="w-5 h-5" />
              <span>View Platinum Plan Details (PDF)</span>
            </a>
            <p className="text-sm text-gray-400 mt-4">
              Opens in a new tab
            </p>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <FileText className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Terms & Conditions
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our comprehensive terms and conditions are designed to be clear, fair, and transparent. 
              We believe in honest communication and want you to understand exactly what's covered 
              and how our warranty protection works for you.
            </p>
            <p className="text-md text-gray-500 mb-8">
              Take a moment to review our full terms and conditions document. It's written in 
              plain English and contains all the important details about your warranty coverage, 
              claims process, and our commitment to you.
            </p>
            <a 
              href="/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-6.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>View Terms & Conditions (PDF)</span>
            </a>
            <p className="text-sm text-gray-400 mt-4">
              Opens in a new tab
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Protected;