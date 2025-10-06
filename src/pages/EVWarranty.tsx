import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Clock, Phone, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SEOHead } from '@/components/SEOHead';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import NewFooter from '@/components/NewFooter';
import WebsiteFooter from '@/components/WebsiteFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackButtonClick } from '@/utils/analytics';
import evCarWarrantyHero from '@/assets/ev-car-warranty-uk-hero-new.png';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigateToQuoteForm = () => {
    trackButtonClick('ev_warranty_get_quote_cta');
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('quote-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <SEOHead
        title="Best EV & Hybrid Car Warranty UK | Electric Vehicle Protection"
        description="Comprehensive electric car warranty, hybrid warranty and PHEV cover. Affordable EV car warranty plans with flexible payments. Get instant quotes for your electric vehicle today."
        keywords="EV car warranty UK, electric car warranty, hybrid car warranty UK, PHEV warranty, buy electric car warranty online, extended EV warranty, used electric car warranty, best EV warranty provider UK, affordable hybrid warranty, EV warranty quotes, electric vehicle warranty cover"
        canonical="https://buyawarranty.co.uk/best-warranty-on-ev-cars-uk-warranties"
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</Link>
              <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQs</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</Link>
            </nav>

            {/* Desktop CTA Buttons - Show on desktop */}
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
                className="bg-primary text-white hover:bg-primary/90 px-3 text-sm"
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
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Header with logo */}
                  <div className="flex items-center justify-between pb-6">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                      <img 
                        src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                        alt="Buy a Warranty" 
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col space-y-6 flex-1">
                    <Link 
                      to="/what-is-covered" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      What's Covered
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

                  {/* CTA Buttons */}
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
                      className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-3"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigateToQuoteForm();
                      }}
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
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <TrustpilotHeader />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Electric & Hybrid Vehicle Warranty
                <span className="block text-primary mt-2">Protect Your EV Investment</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Specialist protection for electric, hybrid and plug-in hybrid vehicles. Get instant quotes with flexible payment plans designed for EV owners across the UK.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={navigateToQuoteForm}
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Get Your EV Warranty Quote
                </Button>
                <Button 
                  onClick={navigateToQuoteForm}
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
                className="w-full h-auto"
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
                { icon: Shield, title: "Specialist EV Cover", desc: "Tailored protection for electric and hybrid technology" },
                { icon: CheckCircle2, title: "Battery & Systems", desc: "Advanced cover for batteries and electric drivetrains" },
                { icon: Clock, title: "Instant Quotes", desc: "Get prices online in minutes with no obligation" },
                { icon: Shield, title: "Affordable Plans", desc: "Low monthly payments and flexible term options" },
                { icon: CheckCircle2, title: "Used EVs Welcome", desc: "Protection available for pre-owned electric vehicles" },
                { icon: Shield, title: "Nationwide Service", desc: "Reliable support for EV drivers across the UK" }
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
                className="w-full h-auto"
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
              <Button onClick={navigateToQuoteForm} size="lg" className="mt-6">
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
                Is an Electric Vehicle Warranty Worth the Investment?
              </h2>
              <p className="text-lg text-muted-foreground">
                Absolutely. Electric and hybrid vehicles feature sophisticated technology, and specialist repairs can be significantly more expensive than traditional cars. A comprehensive warranty protects your investment and gives you confidence to enjoy your EV without worrying about unexpected bills — whether you've bought new, used, or want to extend your manufacturer's cover.
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
              <Button onClick={navigateToQuoteForm} size="lg">
                Compare EV Warranty Plans
              </Button>
            </div>
            <div>
              <img 
                src={evPayMonthly} 
                alt="EV Car Warranty UK Pay Monthly - PHEV Warranty Payment Plans"
                className="w-full h-auto"
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
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why EV Owners Choose Our Service
              </h2>
              <p className="text-lg text-muted-foreground">
                We specialise in electric vehicle protection and have built a strong reputation among EV and hybrid owners across the UK. Our customers trust us because we offer transparent plans, genuine expertise in electric vehicle technology, and customer service that truly cares about keeping you on the road.
              </p>
              <ul className="space-y-4">
                {[
                  "Award-winning service recognised for EV specialisation",
                  "Clear, honest pricing with no hidden surprises",
                  "Excellent customer reviews and satisfaction ratings",
                  "Independent company focused on driver protection",
                  "Highly rated for responsive, helpful support",
                  "Deep expertise in electric and hybrid vehicle systems"
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

        {/* Comprehensive Coverage Keywords Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Where to buy EV warranty UK - buy electric car warranty online
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-4">Getting Cover for Your Electric Vehicle</h3>
              <p className="text-muted-foreground mb-6">
                Protecting your EV or hybrid is straightforward with our online service. Request an instant quote, choose your level of cover, and get protection in place quickly — whether your vehicle is brand new or you've owned it for years.
              </p>
              <ul className="space-y-3">
                {[
                  'Comprehensive coverage includes batteries, motors and charging systems',
                  'EV repairs can be expensive — warranty protection is valuable',
                  'Get instant price quotes tailored to your vehicle',
                  'Cover available anytime, even long after you bought your EV',
                  'Highly recommended for protecting your investment',
                  'Flexible terms allow you to extend cover as needed',
                  'Specialist support for pre-owned electric vehicles',
                  'Simple online application takes just minutes',
                  'Used EVs especially benefit from warranty protection',
                  'Extend your peace of mind when manufacturer cover ends',
                  'Easy to arrange cover post-purchase',
                  'Transparent answers to all your warranty questions'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-bold mb-4">Protection for Used Electric Vehicles</h3>
              <p className="text-muted-foreground mb-6">
                Bought a pre-owned EV or hybrid? Our specialist plans are designed to protect second-hand electric vehicles from unexpected repair costs. We offer comprehensive mechanical cover, breakdown assistance, and flexible terms for older EVs and high-mileage vehicles.
              </p>
              <ul className="space-y-3">
                {[
                  'High-mileage EVs welcomed with appropriate cover options',
                  'Full mechanical protection for your pre-owned vehicle',
                  'Flexible plans for second and third owners',
                  'Cover available even after private sale',
                  'Comprehensive mechanical and electrical protection',
                  'Specialist motor and drivetrain coverage',
                  'Top-rated protection designed for used vehicles',
                  'Customised plans tailored to your EV',
                  'Competitive pricing on all warranty packages',
                  'Trusted by EV owners across the UK',
                  'Instant quotes for used electric vehicles',
                  'Extended protection with insurance-backed peace of mind'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing and Quotes Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Electric car warranty prices UK - compare EV warranty UK
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Cheap electric car warranty UK - affordable EV warranty</h3>
                <p className="text-muted-foreground">
                  Looking for cheap electric car warranty uk, affordable electric car warranty uk, budget electric car warranty uk, best value electric car warranty, or low cost electric car warranty uk? We offer cheap vehicle warranty uk with pay monthly electric car warranty for all budgets. Get low cost extended warranty and cost effective electric car warranty with value for money electric car warranty pricing.
                </p>
                <ul className="space-y-2">
                  {[
                    'Cheapest vehicle warranty plans for EVs',
                    'Extended warranty with low premiums',
                    'Extended warranty cost uk competitive rates',
                    'Budget friendly EV protection',
                    'Discounted electric car warranty',
                    'Affordable extended vehicle coverage'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Get electric car warranty quote - EV warranty quotes</h3>
                <p className="text-muted-foreground">
                  Use our EV warranty comparison site to compare electric car warranty UK options. Get a electric car warranty quote, find electric car warranty UK plans, compare extended electric car warranties, and get extended electric car warranty quote. We provide vehicle warranty quote UK, cheapest electric car warranty quotes, and best electric car warranty quote UK.
                </p>
                <ul className="space-y-2">
                  {[
                    'Electric car protection plan UK',
                    'Vehicle protection quotes for EVs',
                    'Get used electric car warranty quote',
                    'Extended warranty quote online',
                    'Compare vehicle warranty providers',
                    'Warranty quote for old electric cars',
                    'Warranty plans comparison UK',
                    'Find best electric car warranty',
                    'Electric car warranty monthly cost calculator'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border text-center">
              <h3 className="text-2xl font-bold mb-4">Electric car warranties UK - online electric car warranty</h3>
              <p className="text-lg text-muted-foreground mb-4">
                We offer electric car warranty plans, electric car warranty cover, and work as your trusted electric car warranty company. Get UK electric car warranty and private electric car warranty UK. Read electric car warranty reviews UK before choosing. As leading electric car warranty providers UK and auto warranty providers, we provide comprehensive vehicle warranty services and extended warranty providers expertise.
              </p>
              <p className="text-muted-foreground">
                Compare electric car warranty comparison site options. We provide used electric car warranty, best electric car warranty, and electric car warranty insurance. Get electric car warranty best deals and check electric car warranty prices.
              </p>
            </div>
          </div>
        </section>

        {/* Warranty Durations Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            12 month, 24 month or 36 month EV warranty - flexible duration warranty UK
          </h2>

          <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            We offer short term EV warranty, long term EV warranty, monthly vehicle warranty, and yearly EV warranty UK options. Need 3 year EV warranty UK or EV warranty after 3 years of dealer cover? We have you covered.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg border text-center">
              <div className="text-5xl font-bold text-primary mb-4">12</div>
              <h3 className="text-2xl font-bold mb-3">12 month EV warranty</h3>
              <p className="text-muted-foreground mb-4">Perfect for short term EV warranty needs. Great if you are planning to upgrade your electric vehicle soon.</p>
              <Button onClick={navigateToQuoteForm} variant="outline" className="w-full">Get 12 Month Quote</Button>
            </div>

            <div className="bg-card p-8 rounded-lg border-2 border-primary text-center">
              <div className="text-5xl font-bold text-primary mb-4">24</div>
              <h3 className="text-2xl font-bold mb-3">24 month EV warranty</h3>
              <p className="text-muted-foreground mb-4">Most popular choice. Excellent value for money with two years of comprehensive EV protection and peace of mind.</p>
              <Button onClick={navigateToQuoteForm} className="w-full">Get 24 Month Quote</Button>
            </div>

            <div className="bg-card p-8 rounded-lg border text-center">
              <div className="text-5xl font-bold text-primary mb-4">36</div>
              <h3 className="text-2xl font-bold mb-3">36 month EV warranty</h3>
              <p className="text-muted-foreground mb-4">Maximum protection with our 3 year EV warranty UK plan. Best long term EV warranty for complete peace of mind.</p>
              <Button onClick={navigateToQuoteForm} variant="outline" className="w-full">Get 36 Month Quote</Button>
            </div>
          </div>

          <div className="mt-12 bg-muted/30 p-8 rounded-lg text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Warranty post manufacturer - lifetime vehicle warranty UK</h3>
            <p className="text-lg text-muted-foreground mb-4">
              Looking for lifetime vehicle warranty UK? While we do not offer truly lifetime cover, our plans can be renewed. We specialize in warranty post manufacturer expiry, post warranty EV protection, and vehicle warranty after expiry.
            </p>
            <p className="text-muted-foreground">
              Need to extend expired EV warranty? We can help with warranty after new EV cover ends, warranty after 60000 miles, warranty after 100000 miles, and long coverage warranty plan options. Just contact us for annual EV warranty UK and flexible duration warranty UK plans.
            </p>
          </div>
        </section>

        {/* Warrantywise Alternative Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              Warrantywise alternative - better than Warrantywise for EVs
            </h2>

            <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Comparing Warrantywise vs us? See why EV owners choose us as a Warrantywise alternative and Warrantywise competitors. We are often considered cheaper than Warrantywise and better than Warrantywise with superior Warrantywise customer service for electric vehicles.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-3">Compare Warrantywise</h3>
                <p className="text-muted-foreground mb-4">
                  Get a Warrantywise quote comparison for EVs. Read Warrantywise reviews and see who is better than Warrantywise. Compare Warrantywise prices with our EV-specialist rates.
                </p>
                <p className="text-sm text-muted-foreground">Warrantywise vs RAC, Warrantywise vs AA - we compete with them all for EV cover.</p>
              </div>

              <div className="bg-background p-6 rounded-lg border-2 border-primary">
                <h3 className="text-xl font-bold mb-3">Is Warrantywise any good for EVs?</h3>
                <p className="text-muted-foreground mb-4">
                  While Warrantywise UK and Warrantywise extended warranty are popular, many EV owners prefer our Warrantywise used EV warranty alternative and Warrantywise vehicle protection comparison.
                </p>
                <p className="text-sm text-muted-foreground">Warrantywise breakdown cover vs our comprehensive EV plans.</p>
              </div>

              <div className="bg-background p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-3">Warrantywise Comparison</h3>
                <p className="text-muted-foreground mb-4">
                  Do a full Warrantywise comparison and see why we are rated as a top EV warranty provider UK and vehicle warranty providers choice for electric vehicles.
                </p>
                <p className="text-sm text-muted-foreground">Auto warranty providers trust for EV expertise.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dealer Alternative Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              RAC EV warranty alternative - AA EV warranty UK alternative
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              Looking for best non dealer EV warranty? We offer independent warranty vs dealer options with third party EV warranty UK expertise. Compare manufacturer warranty vs extended options and explore aftermarket warranty UK choices for electric vehicles.
            </p>

            <div className="bg-muted/30 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Extended warranty not from dealer for EVs</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Our EV warranty comparison vs dealer shows significant savings. We are a VGS EV warranty alternative providing trusted warranty outside dealership and EV warranty coverage without dealer restrictions. Compare vehicle protection plans UK, RAC vs AA warranty, and find the best independent warranty company UK for electric vehicles.
              </p>
              <p className="text-muted-foreground">
                Get electric car warranty insurance, extended warranty insurance, and electric car warranty providers UK expertise. We also cover EV warranty after purchase from any dealer.
              </p>
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
              onClick={navigateToQuoteForm}
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
