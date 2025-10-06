import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Clock, Phone, AlertCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import NewFooter from '@/components/NewFooter';
import WebsiteFooter from '@/components/WebsiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackButtonClick } from '@/utils/analytics';
import motorcycleSavings from '@/assets/motorcycle-warranty-uk-savings.png';
import motorbikeQuotes from '@/assets/motorbike-warranty-uk-quotes.png';
import motorbikeRepair from '@/assets/motorbike-warranty-uk-repair-cover.png';
import trustpilotLogo from '@/assets/trustpilot-excellent-box.webp';
import whatsappIconNew from '@/assets/whatsapp-icon-new.png';
import companyRegistration from '@/assets/company-registration-footer.png';

const MotorbikeWarranty = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetQuote = () => {
    trackButtonClick('motorbike_warranty_get_quote_cta');
    navigate('/#quote-form');
  };

  return (
    <>
      <SEOHead
        title="Motorbike Warranty UK | Best Motorcycle Repair Cover & Electric Car Warranty Provider"
        description="Best motorbike warranty UK with comprehensive motorcycle repair cover. What's included in motorbike warranty: engine, gearbox, electrical systems. Also offering best electric car warranty provider services with extended electric car warranties UK, USA, Canada."
        keywords="motorbike warranty UK, motorbike warranty UK best, whats included in motorbike warranty, motorcycle warranty, buy motorbike warranty online, motorcycle repair warranty UK, extended motorbike warranty, best electric car warranty provider, extended electric car warranty providers, electric car warranty insurance, used electric car warranty, best electric car warranty, extended electric cars warranties UK, extended electric cars warranties USA, best electric cars warranties UK"
        canonical="https://buyawarranty.co.uk/motorbike-repair-warranty-uk-warranties"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <TrustpilotHeader />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Motorbike Warranty UK
                <span className="block text-primary mt-2">Trusted Motorcycle Protection</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Buy motorbike warranty online with confidence. Comprehensive motorcycle repair warranty UK coverage for all bike types. Get instant quotes and flexible payment options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleGetQuote}
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Get Your Motorbike Warranty Quote
                </Button>
                <Button 
                  onClick={handleGetQuote}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  Compare Motorcycle Plans
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <img 
                  src={trustpilotLogo} 
                  alt="Trustpilot Excellent Rating" 
                  className="h-8 md:h-10"
                />
              </div>
            </div>
            <div className="relative">
              <img 
                src={motorcycleSavings} 
                alt="Motorcycle Warranty UK - Affordable Motorbike Protection and Savings"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Important: Electric Bikes Not Covered
                </h3>
                <p className="text-amber-800 dark:text-amber-300">
                  Please note: Our motorbike warranty covers motorcycles and motorised bikes only. We do not provide cover for standard electric bicycles (e-bikes) or pedal-assisted bikes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Motorcycle Owners Choose Buy A Warranty
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The best motorbike warranty UK riders trust for comprehensive protection
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Shield, title: "Best Motorbike Warranty UK", desc: "Comprehensive motorcycle repair warranty coverage" },
                { icon: CheckCircle2, title: "Buy Online in Minutes", desc: "Quick quotes for motorcycle warranty online" },
                { icon: Clock, title: "Used Motorcycle Cover", desc: "Extended motorbike warranty for used bikes" },
                { icon: Shield, title: "Flexible Payment Plans", desc: "Pay monthly motorcycle warranty options" },
                { icon: CheckCircle2, title: "UK-Wide Protection", desc: "Trusted motorbike warranty provider nationwide" },
                { icon: Shield, title: "All Bike Types", desc: "Sport, cruiser, touring, and adventure bikes covered" }
              ].map((item, index) => (
                <div key={index} className="bg-background p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
                  <item.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={motorbikeRepair} 
                alt="Motorbike Warranty UK Repair Cover - Motorcycle Mechanical Protection"
                className="w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                What's Included in Your Motorcycle Warranty Cover?
              </h2>
              <p className="text-lg text-muted-foreground">
                Our motorbike warranty UK plans protect essential motorcycle components:
              </p>
              <ul className="space-y-4">
                {[
                  "Engine, gearbox and clutch systems",
                  "Transmission and drivetrain components",
                  "Electrical systems and starter motors",
                  "Fuel injection and carburettor systems",
                  "Cooling systems and radiators",
                  "Suspension and steering components",
                  "Braking systems (front and rear)",
                  "Labour and parts up to your claim limit"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleGetQuote} size="lg" className="mt-6">
                Get Your Motorcycle Quote Now
              </Button>
            </div>
          </div>
        </section>

        {/* Is Motorbike Warranty Worth It Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Is a Motorcycle Warranty Worth It in the UK?
              </h2>
              <p className="text-lg text-muted-foreground">
                Absolutely. With rising repair costs and complex motorcycle technology, a motorcycle repair warranty UK 
                provides essential protection. Whether you're buying a used motorcycle warranty or extending cover after 
                your manufacturer warranty ends, our affordable motorbike warranty plans offer excellent value and peace of mind.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">£1,500+</div>
                  <p className="text-muted-foreground">Average motorcycle repair cost without warranty</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">UK-wide breakdown assistance available</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">100s</div>
                  <p className="text-muted-foreground">Of approved motorcycle garages nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Flexible Payment Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Flexible Payment Options for Your Motorbike Warranty
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the payment plan that works for your budget:
              </p>
              <ul className="space-y-4">
                {[
                  "Pay monthly motorbike warranty plans with low deposits",
                  "One-off annual payments with discounts",
                  "Short-term and long-term cover (6, 12, 24 or 36 months)",
                  "Flexible upgrade options as your bike needs change",
                  "No hidden fees or surprise charges"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleGetQuote} size="lg">
                Compare Motorbike Warranty Plans
              </Button>
            </div>
            <div>
              <img 
                src={motorbikeQuotes} 
                alt="Motorbike Warranty UK Quotes - Motorcycle Warranty Payment Options"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Bike Types Covered */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Motorcycle Types We Cover
              </h2>
              <p className="text-lg text-muted-foreground">
                Our extended motorbike warranty covers a wide range of motorcycle types across the UK:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  "Sport Bikes",
                  "Cruisers",
                  "Touring Motorcycles",
                  "Adventure Bikes",
                  "Naked Bikes",
                  "Standard Motorcycles",
                  "Cafe Racers",
                  "Scooters (125cc+)",
                  "Custom Bikes"
                ].map((type, index) => (
                  <div key={index} className="bg-background p-4 rounded-lg border">
                    <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-semibold">{type}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">
                * Standard electric bicycles and pedal-assisted e-bikes are not covered
              </p>
            </div>
          </div>
        </section>

        {/* Compare Providers Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Best motorbike warranty UK - what's included in motorbike warranty
              </h2>
              <p className="text-lg text-muted-foreground">
                As the best motorbike warranty UK provider and motorbike warranty UK best choice for riders, we offer comprehensive cover. Here is what's included in motorbike warranty plans from us:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Specialist Motorcycle Cover", desc: "Expert knowledge of bike mechanics and common issues" },
                { title: "Fast Claims Handling", desc: "Quick turnaround to get you back on the road" },
                { title: "Transparent Pricing", desc: "Clear motorbike warranty quotes with no hidden costs" },
                { title: "UK-Based Support", desc: "Friendly customer service team who understand riders" },
                { title: "Flexible Terms", desc: "Cover options tailored to your bike and riding style" },
                { title: "No Pressure Sales", desc: "Honest advice without pushy tactics" }
              ].map((item, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extended Coverage - Cars Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                We Also Cover Cars - Best Electric Car Warranty Provider
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                While we specialize in motorbike warranty UK, we are also a best electric car warranty provider offering extended electric car warranty providers services. We provide electric car warranty insurance, used electric car warranty, and best electric car warranty options.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-background p-8 rounded-lg border">
                <h3 className="text-2xl font-bold mb-4">Extended Electric Car Warranties</h3>
                <p className="text-muted-foreground mb-6">
                  Looking for extended electric cars warranties UK, extended electric cars warranties USA, or extended electric cars warranties Canada? As one of the best electric cars warranties UK providers and best electric cars warranties USA options, we offer comprehensive electric vehicle protection.
                </p>
                <ul className="space-y-3">
                  {[
                    'Extended electric car warranties for EVs and hybrids',
                    'Best electric cars warranties UK with flexible terms',
                    'Extended electric cars warranties USA coverage available',
                    'Extended electric cars warranties Canada options',
                    'Comprehensive electric car warranty insurance',
                    'Used electric car warranty for pre-owned EVs'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-background p-8 rounded-lg border">
                <h3 className="text-2xl font-bold mb-4">Best Electric Car Warranty Coverage</h3>
                <p className="text-muted-foreground mb-6">
                  As a best electric car warranty provider and leading extended electric car warranty providers company, we deliver the best electric car warranty options for UK, USA, and Canada customers.
                </p>
                <ul className="space-y-3">
                  {[
                    'Best electric cars warranties with battery protection',
                    'Extended electric cars warranties UK comprehensive cover',
                    'Best electric cars warranties USA dealer alternatives',
                    'Electric car warranty insurance for peace of mind',
                    'Used electric car warranty for all EV makes and models',
                    'Best electric car warranty provider expertise'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-muted/30 p-6 rounded-lg text-center">
              <p className="text-lg">
                <strong>Note:</strong> While we offer both motorbike warranty UK and electric car warranty services as a best electric car warranty provider, please remember that standard electric bicycles and pedal-assisted e-bikes are not covered under our motorbike warranty plans.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Motorbike Warranty FAQs
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: "Can I buy motorbike warranty online?",
                    a: "Yes! You can get an instant motorcycle warranty quote and buy your motorbike warranty online in just a few minutes. Cover starts immediately upon payment."
                  },
                  {
                    q: "Do you cover used motorcycles?",
                    a: "Absolutely. We specialise in used motorcycle warranty cover for bikes of various ages and mileages. Our extended motorbike warranty plans are perfect for older bikes."
                  },
                  {
                    q: "What's not covered by a motorcycle warranty?",
                    a: "Standard wear and tear items (tyres, brake pads, chains), cosmetic damage, and modifications are typically excluded. Standard electric bicycles and pedal-assisted e-bikes are also not covered."
                  },
                  {
                    q: "How quickly can I make a claim?",
                    a: "Claims can be submitted 24/7. Once approved, you can take your bike to any approved garage in our UK-wide network for repairs."
                  },
                  {
                    q: "What makes you the best motorbike warranty provider UK?",
                    a: "Our specialist knowledge of motorcycles, transparent pricing, flexible payment plans, and excellent customer service make us a trusted choice for thousands of UK riders."
                  },
                  {
                    q: "Can I pay monthly for motorcycle warranty?",
                    a: "Yes! We offer flexible pay monthly motorcycle warranty plans with low deposits, making it easy to budget for your bike protection."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-card p-6 rounded-lg border">
                    <h3 className="text-xl font-semibold mb-3">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Buy Your Motorbike Warranty Online?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get started in minutes. Enter your registration, choose your motorcycle warranty cover, and protect your bike today.
            </p>
            <Button 
              onClick={handleGetQuote}
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
            >
              Get Your Motorcycle Warranty Quote Now
            </Button>
          </div>
        </section>

        <NewFooter />
        <WebsiteFooter />

        {/* Floating Contact Buttons */}
        {!isMobile && (
          <>
            <a
              href="https://wa.me/447481339708"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              onClick={() => trackButtonClick('motorbike_whatsapp_float')}
            >
              <img src={whatsappIconNew} alt="WhatsApp" className="w-8 h-8" />
            </a>
            <a
              href="tel:02033228888"
              className="fixed bottom-24 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              onClick={() => trackButtonClick('motorbike_phone_float')}
            >
              <Phone className="w-8 h-8" />
            </a>
          </>
        )}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 bg-card border border-border hover:bg-accent text-foreground p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Company Registration Footer */}
        <div className="bg-muted/30 py-6">
          <div className="container mx-auto px-4">
            <img 
              src={companyRegistration} 
              alt="Buy A Warranty Company Registration" 
              className="mx-auto h-12 opacity-60"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MotorbikeWarranty;
