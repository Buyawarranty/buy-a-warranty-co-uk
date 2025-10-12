import React, { useState } from 'react';
import { ChevronDown, Download, ExternalLink, Check, Menu, Shield, Truck, Building2, Users, TrendingUp, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

// Import panda images
import pandaVehicleCollection from '@/assets/panda-vehicle-collection.png';
import pandaGarage from '@/assets/panda-garage-warranty.png';
import pandaCelebrating from '@/assets/panda-celebrating.png';

const BusinessWarranties = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const navigateToQuoteForm = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('quote-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const businessBenefits = [
    {
      id: "fleet-management",
      icon: Truck,
      color: "blue",
      title: "Fleet Protection",
      description: "Comprehensive coverage for multiple vehicles with flexible payment options"
    },
    {
      id: "cost-control",
      icon: TrendingUp,
      color: "green",
      title: "Predictable Costs",
      description: "Fixed monthly payments help control operational expenses and budgeting"
    },
    {
      id: "minimal-downtime",
      icon: Clock,
      color: "orange",
      title: "Minimise Downtime",
      description: "Fast claim processing keeps your business vehicles on the road"
    },
    {
      id: "dedicated-support",
      icon: Users,
      color: "purple",
      title: "Dedicated Support",
      description: "Priority business support line for urgent fleet repairs"
    }
  ];

  const vehicleTypes = [
    {
      id: "vans",
      title: "Commercial Vans",
      subtitle: "Transit, Sprinter, and more",
      description: "Light commercial vehicles up to 3.5 tonnes for deliveries and services"
    },
    {
      id: "light-trucks",
      title: "Light Commercial Vehicles",
      subtitle: "Pickups and utility vehicles",
      description: "Dual-purpose vehicles perfect for trade professionals"
    },
    {
      id: "company-cars",
      title: "Company Car Fleet",
      subtitle: "Saloons, estates, and SUVs",
      description: "Executive and staff vehicles including hybrid and electric options"
    },
    {
      id: "specialist",
      title: "Specialist Vehicles",
      subtitle: "Refrigerated, converted vehicles",
      description: "Custom-built and specialist commercial vehicles"
    }
  ];

  const faqs = [
    {
      question: "Can I cover multiple vehicles under one policy?",
      answer: "Yes! We offer flexible fleet solutions. Each vehicle receives individual coverage with consolidated billing for your convenience. Contact our business team for multi-vehicle quotes and potential fleet discounts."
    },
    {
      question: "What payment options are available for businesses?",
      answer: "We offer flexible payment terms including monthly direct debit, quarterly payments, and annual payment options. For larger fleets, we can arrange customised payment schedules to suit your cash flow requirements."
    },
    {
      question: "Is there a minimum fleet size requirement?",
      answer: "No minimum fleet size required. Whether you have one van or fifty vehicles, we provide the same comprehensive platinum coverage. Our business warranties are designed to scale with your company."
    },
    {
      question: "How quickly can claims be processed?",
      answer: "Business claims are prioritised for fast processing. Most claims are authorised within 24 hours. We understand downtime costs your business money, so we work quickly to get your vehicles back on the road."
    },
    {
      question: "Do you cover vehicles used for different business purposes?",
      answer: "Yes, we cover vehicles for various business uses including deliveries, trade services, sales visits, and general business transport. Cover includes vehicles used for hire and reward (with appropriate insurance)."
    },
    {
      question: "Can I add or remove vehicles during the policy period?",
      answer: "Absolutely. As your business grows or changes, you can add or remove vehicles. We'll adjust your coverage and payments accordingly. Contact our business support team to make changes to your fleet."
    },
    {
      question: "Are there any mileage restrictions for commercial vehicles?",
      answer: "Commercial vehicles typically have higher mileage requirements. We offer tailored coverage based on your usage patterns. High-mileage packages available for vehicles regularly exceeding standard limits."
    },
    {
      question: "What about VAT and tax documentation?",
      answer: "All business invoices include VAT and meet UK tax requirements. We provide detailed documentation suitable for business accounting, including itemised invoices and annual summaries for your records."
    }
  ];

  return (
    <>
      <SEOHead
        title="Business & Commercial Vehicle Warranties | Fleet Protection UK"
        description="Comprehensive warranty protection for business fleets, commercial vans, company cars, and specialist vehicles. Flexible payment options, priority support, and predictable costs for UK businesses."
        keywords="business vehicle warranty, commercial van warranty, fleet warranty UK, company car warranty, commercial vehicle protection, business fleet insurance, van warranty for business"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/business-warranties" className="text-primary hover:text-primary/80 font-medium text-sm xl:text-base">Business Warranties</Link>
              <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</Link>
              <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQs</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</Link>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 px-3 text-sm"
                >
                  WhatsApp Us
                </Button>
              </a>
              <Button 
                size="sm"
                onClick={navigateToQuoteForm}
                className="bg-orange-500 text-white hover:bg-orange-600 px-3 text-sm"
              >
                Get Business Quote
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2">
                  <Menu className="h-12 w-12" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-6">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>

                  <nav className="flex flex-col space-y-6 flex-1">
                    <Link 
                      to="/what-is-covered"
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      What's Covered
                    </Link>
                    <Link 
                      to="/business-warranties"
                      className="text-primary hover:text-primary/80 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Business Warranties
                    </Link>
                    <Link 
                      to="/make-a-claim" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </Link>
                    <Link 
                      to="/faq" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQs
                    </Link>
                    <Link 
                      to="/contact-us" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </nav>

                  <div className="space-y-4 pt-6 mt-auto">
                    <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                      <Button 
                        variant="outline" 
                        className="w-full bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 text-lg py-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        WhatsApp Us
                      </Button>
                    </a>
                    <Button 
                      className="w-full bg-orange-500 text-white hover:bg-orange-600 text-lg py-3"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateToQuoteForm();
                      }}
                    >
                      Get Business Quote
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-orange-600 py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-8">
                <div className="space-y-4">
                  <div className="inline-block bg-white/20 px-4 py-2 rounded-full mb-4">
                    <span className="text-white font-semibold">For Businesses & Fleet Owners</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    Business Vehicle Warranty Solutions
                  </h1>
                  <p className="text-xl lg:text-2xl opacity-90">
                    Keep Your Business Moving with Fleet Protection
                  </p>
                  <p className="text-lg lg:text-xl leading-relaxed opacity-80">
                    Comprehensive warranty coverage for commercial vans, company cars, and specialist vehicles. Flexible payment options and priority support for UK businesses.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-muted px-8 py-4 text-lg font-semibold"
                    onClick={() => document.getElementById('business-benefits')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Business Benefits
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-4 text-lg font-semibold"
                    onClick={navigateToQuoteForm}
                  >
                    Get Fleet Quote
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <img 
                  src={pandaVehicleCollection} 
                  alt="Business fleet warranty protection" 
                  className="w-full max-w-lg h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Business Benefits Section */}
        <section className="py-20 bg-background" id="business-benefits">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Why Businesses Choose Our Warranties
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Tailored protection designed for commercial operations and fleet management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {businessBenefits.map((benefit) => {
                const IconComponent = benefit.icon;
                const colorClasses = {
                  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                  green: { bg: 'bg-green-100', text: 'text-green-600' },
                  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
                  purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
                }[benefit.color];

                return (
                  <Card key={benefit.id} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="space-y-4">
                      <div className={`w-16 h-16 ${colorClasses.bg} rounded-full flex items-center justify-center mx-auto`}>
                        <IconComponent className={`w-8 h-8 ${colorClasses.text}`} />
                      </div>
                      <h3 className="font-bold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Card className="bg-muted p-8 text-center">
              <CardContent className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Dedicated Business Support</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">Priority Business Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Business Sales & Support</p>
                    <p className="text-2xl font-bold text-primary">0330 229 5040</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday: 9am - 5:30pm</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Priority Claims Line</p>
                    <p className="text-2xl font-bold text-primary">0330 229 5045</p>
                    <p className="text-sm text-muted-foreground">Fast-track processing for business fleets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Vehicle Types Section */}
        <section className="py-20 bg-muted/30" id="vehicle-types">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Commercial Vehicles We Cover
              </h2>
              <p className="text-xl text-muted-foreground">
                From single vans to entire fleets - comprehensive protection for all business vehicles
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {vehicleTypes.map((type, index) => (
                    <Card key={type.id} className="p-6 hover:shadow-lg transition-shadow">
                      <CardContent className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{index + 1}</span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{type.title}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{type.subtitle}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <img 
                  src={pandaGarage} 
                  alt="Commercial vehicle warranty coverage" 
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What's Covered Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Comprehensive Business Coverage
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our Platinum plan covers all mechanical and electrical components
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg">Engine & Transmission</h3>
                  <p className="text-muted-foreground">Complete engine, gearbox, and drivetrain protection including clutch and differential</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">Electrical Systems</h3>
                  <p className="text-muted-foreground">Full electrical coverage including alternator, starter motor, and electronic control units</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg">Fuel & Cooling Systems</h3>
                  <p className="text-muted-foreground">Injection systems, fuel pumps, radiators, and complete cooling system protection</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg">Steering & Suspension</h3>
                  <p className="text-muted-foreground">Power steering systems, suspension components, and steering mechanisms</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-lg">Braking System</h3>
                  <p className="text-muted-foreground">ABS systems, brake servos, and all mechanical braking components</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Check className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-lg">Diagnostics & Labour</h3>
                  <p className="text-muted-foreground">Full diagnostic costs and labour charges included in all claims</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Shield className="w-12 h-12 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Platinum Coverage Standard</h3>
                    <p className="text-lg text-muted-foreground">
                      All business vehicles receive our premium Platinum plan as standard, with no tiered options. 
                      This ensures consistent protection across your entire fleet with comprehensive mechanical and electrical coverage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Fleet Advantages */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Fleet Management Made Easy
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Streamlined administration and consolidated billing for your business
                  </p>
                </div>
                
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        Multi-Vehicle Management
                      </h3>
                      <p className="text-muted-foreground">
                        Add or remove vehicles as your fleet changes. Each vehicle has individual coverage with one convenient invoice.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Flexible Payment Terms
                      </h3>
                      <p className="text-muted-foreground">
                        Choose monthly, quarterly, or annual payments. Custom payment schedules available for larger fleets to match your business cash flow.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Priority Claims Processing
                      </h3>
                      <p className="text-muted-foreground">
                        Business claims receive priority handling. Most authorisations within 24 hours to minimise downtime and keep your business operating smoothly.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-center">
                <img 
                  src={pandaCelebrating} 
                  alt="Successful business fleet protection" 
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Business Warranty FAQs
              </h2>
              <p className="text-xl text-muted-foreground">
                Common questions about commercial and fleet warranties
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-orange-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8 text-white">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Protect Your Business Fleet Today
              </h2>
              <p className="text-xl lg:text-2xl opacity-90">
                Get a tailored quote for your commercial vehicles in minutes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-muted px-8 py-6 text-lg font-semibold"
                  onClick={navigateToQuoteForm}
                >
                  Get Business Quote Now
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold bg-transparent"
                  asChild
                >
                  <Link to="/contact-us">
                    Contact Business Team
                  </Link>
                </Button>
              </div>
              <p className="text-sm opacity-75">
                Questions about fleet coverage? Call our business support: 0330 229 5040
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BusinessWarranties;
