import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Clock, Phone } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import NewFooter from '@/components/NewFooter';
import WebsiteFooter from '@/components/WebsiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackButtonClick } from '@/utils/analytics';
import evCarWarrantyHero from '@/assets/ev-car-warranty-uk-electric-vehicle.png';
import hybridCarWarranty from '@/assets/hybrid-car-warranty-uk-extended.png';
import evPayMonthly from '@/assets/ev-car-warranty-uk-pay-monthly.png';
import evTrustedProvider from '@/assets/ev-car-warranty-uk-trusted-provider.png';
import trustpilotLogo from '@/assets/trustpilot-excellent-box.webp';
import whatsappIconNew from '@/assets/whatsapp-icon-new.png';
import companyRegistration from '@/assets/company-registration-footer.png';

const EVWarranty = () => {
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
    trackButtonClick('ev_warranty_get_quote_cta');
    navigate('/#quote-form');
  };

  return (
    <>
      <SEOHead
        title="Best EV & Hybrid Car Warranty UK | Electric Vehicle Protection"
        description="Comprehensive electric car warranty, hybrid warranty and PHEV cover. Affordable EV car warranty plans with flexible payments. Get instant quotes for your electric vehicle today."
        keywords="EV car warranty UK, electric car warranty, hybrid car warranty UK, PHEV warranty, buy electric car warranty online, extended EV warranty, used electric car warranty, best EV warranty provider UK, affordable hybrid warranty, EV warranty quotes, electric vehicle warranty cover"
        canonical="https://buyawarranty.co.uk/best-warranty-on-ev-cars-uk-warranties"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <TrustpilotHeader />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                EV & Hybrid Car Warranty
                <span className="block text-primary mt-2">Protect Your Electric Future</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Comprehensive warranty cover for electric, hybrid and PHEV vehicles across the UK. Get instant quotes and flexible payment options for your EV today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleGetQuote}
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Get Your EV Warranty Quote
                </Button>
                <Button 
                  onClick={handleGetQuote}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                >
                  Compare Plans
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
                src={evCarWarrantyHero} 
                alt="Electric Car Warranty UK - EV and Hybrid Vehicle Protection"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why EV Owners Choose Buy A Warranty
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Specialist protection for electric, hybrid and PHEV vehicles across the UK
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Shield, title: "Best EV Warranty UK", desc: "Comprehensive cover for electric and hybrid vehicles" },
                { icon: CheckCircle2, title: "Battery Protection", desc: "Specialist cover for EV batteries and electric systems" },
                { icon: Clock, title: "Buy Online in Minutes", desc: "Quick quotes for electric car warranty online" },
                { icon: Shield, title: "Flexible Payment Plans", desc: "Pay monthly PHEV warranty options available" },
                { icon: CheckCircle2, title: "Used EV Cover", desc: "Extended warranty for used electric vehicles" },
                { icon: Shield, title: "UK-Wide Support", desc: "Trusted EV warranty provider across the UK" }
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
                src={hybridCarWarranty} 
                alt="Hybrid Car Warranty UK - Extended EV Warranty Cover"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                What's Included in Your EV Warranty Cover?
              </h2>
              <p className="text-lg text-muted-foreground">
                Our electric car warranty and hybrid warranty plans protect the most important EV components:
              </p>
              <ul className="space-y-4">
                {[
                  "Electric motor and battery management systems",
                  "Hybrid drivetrain and regenerative braking",
                  "Power inverters and charging systems",
                  "Suspension, steering and braking systems",
                  "Air conditioning and climate control",
                  "Electrical components and infotainment",
                  "Labour and parts up to your claim limit"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleGetQuote} size="lg" className="mt-6">
                Get Your Quote Now
              </Button>
            </div>
          </div>
        </section>

        {/* Is EV Warranty Worth It Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Is an Electric Car Warranty Worth It in the UK?
              </h2>
              <p className="text-lg text-muted-foreground">
                Absolutely. With advanced EV technology and higher repair costs for electric and hybrid vehicles, 
                a comprehensive warranty protects your investment. Whether you're buying a used electric car warranty 
                or extending cover after your manufacturer warranty ends, our PHEV warranty and hybrid car warranty UK 
                plans offer excellent value and peace of mind.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">£3,000+</div>
                  <p className="text-muted-foreground">Average EV repair cost without warranty</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">UK-wide breakdown assistance included</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">1000s</div>
                  <p className="text-muted-foreground">Of approved garages nationwide</p>
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
                Flexible Payment Options for Your EV Warranty
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the payment plan that works for your budget:
              </p>
              <ul className="space-y-4">
                {[
                  "Pay monthly EV car warranty plans with low deposits",
                  "One-off annual payments with discounts",
                  "Short-term and long-term cover (6, 12, 24 or 36 months)",
                  "Flexible upgrade options as your needs change"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleGetQuote} size="lg">
                Compare EV Warranty Plans
              </Button>
            </div>
            <div>
              <img 
                src={evPayMonthly} 
                alt="EV Car Warranty UK Pay Monthly - PHEV Warranty Payment Plans"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Compare Providers Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img 
                  src={evTrustedProvider} 
                  alt="Best EV Car Warranty Provider UK - Trusted Electric Vehicle Protection"
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Compare EV Warranty Providers - Choose the Best
                </h2>
                <p className="text-lg text-muted-foreground">
                  We're proud to be a trusted alternative to other EV warranty providers. Our customers rate us highly for:
                </p>
                <ul className="space-y-4">
                  {[
                    "Specialist electric car warranty UK cover",
                    "Fast claims handling for EVs and hybrids",
                    "Transparent pricing with no hidden fees",
                    "Friendly UK-based customer support",
                    "Comprehensive PHEV warranty options",
                    "No pushy sales tactics - just honest advice"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              EV & Hybrid Warranty FAQs
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Do you cover electric vehicles and hybrids?",
                  a: "Yes! We provide comprehensive warranty cover for pure electric vehicles (EVs), plug-in hybrids (PHEVs), and hybrid cars across the UK."
                },
                {
                  q: "Is battery cover included?",
                  a: "Our EV warranty plans include cover for battery management systems and electric drivetrain components. Battery degradation due to normal wear is typically not covered, but mechanical failures are."
                },
                {
                  q: "Can I get a warranty for a used electric car?",
                  a: "Absolutely. We specialise in used electric car warranty cover for EVs and hybrids of all ages and mileages."
                },
                {
                  q: "How quickly can I buy an EV warranty online?",
                  a: "You can get an instant quote and buy your electric car warranty online in just a few minutes. Cover starts immediately upon payment."
                },
                {
                  q: "What makes you the best EV warranty provider UK?",
                  a: "We offer specialist knowledge of electric vehicles, transparent pricing, flexible payment plans, and excellent customer service - all backed by thousands of satisfied EV owners."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Buy Your EV Warranty Online?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Get started in minutes. Enter your registration, choose your hybrid car warranty or EV cover, and get protected today.
            </p>
            <Button 
              onClick={handleGetQuote}
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
            >
              Get Your EV Warranty Quote Now
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
              onClick={() => trackButtonClick('ev_whatsapp_float')}
            >
              <img src={whatsappIconNew} alt="WhatsApp" className="w-8 h-8" />
            </a>
            <a
              href="tel:02033228888"
              className="fixed bottom-24 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              onClick={() => trackButtonClick('ev_phone_float')}
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

export default EVWarranty;
