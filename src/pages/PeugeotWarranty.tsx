import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Phone, MessageCircle, ArrowRight, Shield, Clock, FileText, Star } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { OrganizationSchema } from '@/components/schema/OrganizationSchema';
import { WebPageSchema } from '@/components/schema/WebPageSchema';
import { ProductSchema } from '@/components/schema/ProductSchema';
import { FAQSchema } from '@/components/schema/FAQSchema';
import { BreadcrumbSchema } from '@/components/schema/BreadcrumbSchema';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import peugeot208 from '@/assets/peugeot-208.png';
import peugeot3008 from '@/assets/peugeot-3008.png';
import peugeot5008 from '@/assets/peugeot-5008.png';
import peugeotHero from '@/assets/peugeot-hero.png';
import peugeotRange from '@/assets/peugeot-range.png';

const PeugeotWarranty = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToQuoteForm = () => {
    const element = document.getElementById('quote-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    window.gtag?.('event', 'button_click', {
      button_name: 'Get My Quote CTA',
      page_path: window.location.pathname,
    });
  };

  const peugeotFAQs = [
    {
      question: "How much is a Peugeot extended warranty?",
      answer: "Most drivers pay between £300 and £900 per year, depending on the model, mileage and plan level."
    },
    {
      question: "Is a Peugeot extended warranty worth it?",
      answer: "Yes. Modern Peugeots use advanced electronics and emissions systems that can be costly to repair. One major failure can cost more than the price of the full warranty."
    },
    {
      question: "Does Peugeot offer extended warranties?",
      answer: "Peugeot offers a manufacturer extension, but many drivers choose independent cover for lower prices, wider component protection and flexible garage choice."
    },
    {
      question: "Can I buy a Peugeot warranty for a used car?",
      answer: "Yes. Cover is available for used Peugeots as long as the vehicle meets age and mileage criteria."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <SEOHead
        title="Peugeot Extended Warranty Quote | Cover for New & Used Models"
        description="Protect your Peugeot with comprehensive extended warranty cover for new and used models. Get instant quotes, flexible plans, and protection against costly repairs."
        keywords="Peugeot warranty, Peugeot extended warranty, Peugeot car warranty, used Peugeot warranty, Peugeot 208 warranty, Peugeot 3008 warranty, Peugeot 5008 warranty"
        canonical="https://buyawarranty.co.uk/car-extended-warranty/peugeot/"
        ogTitle="Peugeot Extended Warranty | Protect New and Used Models"
        ogDescription="Get extended warranty cover for your Peugeot. Protect new and used models from costly mechanical and electrical repairs with instant online quotes and flexible plans."
        ogImage="https://buyawarranty.co.uk/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png"
      />
      
      <OrganizationSchema type="InsuranceAgency" />
      <WebPageSchema
        name="Peugeot Extended Warranty"
        description="Protect your Peugeot with comprehensive extended warranty cover for new and used models"
        url="https://buyawarranty.co.uk/car-extended-warranty/peugeot/"
        specialty="Vehicle Warranty"
      />
      <ProductSchema
        name="Peugeot Extended Warranty"
        description="Comprehensive extended warranty cover for Peugeot vehicles including new and used models"
        price="300"
        priceCurrency="GBP"
        brand="Buy A Warranty"
        category="Vehicle Warranty"
        areaServed="GB"
      />
      <FAQSchema faqs={peugeotFAQs} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://buyawarranty.co.uk/" },
          { name: "Car Extended Warranty", url: "https://buyawarranty.co.uk/car-extended-warranty/" },
          { name: "Peugeot Warranty", url: "https://buyawarranty.co.uk/car-extended-warranty/peugeot/" }
        ]}
      />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <TrustpilotHeader className="mb-6" />
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              Peugeot Extended Warranty - Maximum Cover, Minimum Costs
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Protect your Peugeot from costly mechanical and electrical failures once the factory cover ends. A Peugeot extended warranty pays for parts, labour and diagnostics, giving owners a simple way to avoid expensive repair bills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                onClick={navigateToQuoteForm}
                className="w-full sm:w-auto text-lg px-8 py-6"
              >
                ✅ Get My Quote <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('https://wa.me/447951581848', '_blank')}
                className="w-full sm:w-auto text-lg px-8 py-6"
              >
                <MessageCircle className="mr-2" /> WhatsApp Us
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <OptimizedImage
              src={peugeotHero}
              alt="Peugeot extended warranty cover for new and used models"
              className="w-full h-auto rounded-lg shadow-2xl"
              priority={true}
              width={1920}
              height={1080}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 md:py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose an Extended Warranty for Your Peugeot
          </h2>
          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mb-12">
            A Peugeot warranty gives you reliable protection once your original three-year manufacturer warranty expires. It covers failures that commonly appear as Peugeot vehicles age and helps you manage ownership costs with predictable pricing.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-border hover:shadow-lg transition-all">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">Budget Protection</h3>
              <p className="text-muted-foreground">Drivers of used Peugeots searching for budget protection</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border hover:shadow-lg transition-all">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">Long Term Ownership</h3>
              <p className="text-muted-foreground">Owners keeping their Peugeot long term</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border hover:shadow-lg transition-all">
              <FileText className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">No Surprises</h3>
              <p className="text-muted-foreground">Anyone who wants to avoid unexpected repair bills</p>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-border hover:shadow-lg transition-all">
              <Star className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-foreground">High Mileage Cover</h3>
              <p className="text-muted-foreground">Coverage up to 150,000 miles available</p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
              🚗 Get Cover Today <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* What's Covered Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            What's Covered in a Peugeot Extended Warranty
          </h2>
          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mb-12">
            A comprehensive plan protects you from failures across key mechanical and electrical components. It gives you a straightforward list of items you can rely on if something goes wrong.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
            {[
              'Engine components',
              'Gearbox and transmission',
              'Turbocharger or supercharger',
              'Cooling system',
              'Fuel and injection system',
              'Steering system',
              'Braking system',
              'Driveshaft and differential',
              'Electrical and electronic modules',
              'Sensors and control units',
              'Air conditioning system',
              'Multimedia, navigation and infotainment systems'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-accent/20">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
              🔒 Secure My Warranty <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Cost Section */}
      <section className="py-12 md:py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Peugeot Extended Warranty Cost: Key Pricing Factors
          </h2>
          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mb-12">
            The cost of a Peugeot extended warranty depends on the model, age, mileage and the level of protection you choose.
          </p>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Typical Cost Range</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Most drivers pay between <span className="font-bold text-primary">£300 and £900 per year</span>. Larger models like the Peugeot 5008 and vans such as the Peugeot Expert can sit at the higher end due to more complex components and parts prices.
              </p>

              <h3 className="text-2xl font-bold mb-4 text-foreground">Pricing Influences</h3>
              <ul className="space-y-3">
                {[
                  'Model type: hatchback vs SUV vs van',
                  'Engine size and emissions system complexity',
                  'Age and mileage',
                  'Chosen claims limit',
                  'Level of cover'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-lg text-muted-foreground mt-6">
                You get unlimited repair claims up to your chosen limit, giving you predictable protection all year.
              </p>
            </Card>

            <div className="text-center">
              <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
                📄 View My Options <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Costs Table */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Peugeot Repair Costs: Why Extended Cover Matters
          </h2>
          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mb-12">
            Peugeot vehicles are affordable to run, but when major components fail, the repair bill can be substantial. The table below shows common repairs that catch owners by surprise.
          </p>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="p-4 text-left font-bold">Component / System</th>
                  <th className="p-4 text-right font-bold">Cost Range</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { component: 'Turbocharger', cost: '£750 – £1,800' },
                  { component: 'Diesel Particulate Filter (DPF)', cost: '£900 – £1,600' },
                  { component: 'Automatic Gearbox', cost: '£1,000 – £3,000' },
                  { component: 'Fuel Injector', cost: '£250 – £550 each' },
                  { component: 'Timing Belt Kit', cost: '£400 – £750' },
                  { component: 'Electronic Handbrake', cost: '£450 – £900' },
                  { component: 'ECU or Electronic Module', cost: '£350 – £1,200' }
                ].map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-accent/20' : 'bg-card'}>
                    <td className="p-4 text-foreground">{item.component}</td>
                    <td className="p-4 text-right font-semibold text-foreground">{item.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mt-8">
            An extended warranty helps you avoid unexpected costs and keeps your Peugeot on the road without financial pressure.
          </p>

          <div className="text-center mt-8">
            <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
              ⚡ Activate My Cover <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Models Covered Section */}
      <section className="py-12 md:py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Peugeot Models Covered
          </h2>
          <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto mb-12">
            We provide extended warranty plans for nearly every popular Peugeot model, including:
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center">
              <OptimizedImage
                src={peugeot208}
                alt="Peugeot 208 extended warranty cover"
                className="w-full max-w-[280px] h-auto mx-auto mb-4 rounded-lg"
                priority={false}
                width={1280}
                height={720}
              />
              <h3 className="text-xl font-bold text-foreground">Peugeot 208</h3>
            </div>

            <div className="text-center">
              <OptimizedImage
                src={peugeot3008}
                alt="Peugeot 3008 extended warranty cover"
                className="w-full max-w-[280px] h-auto mx-auto mb-4 rounded-lg"
                priority={false}
                width={1280}
                height={720}
              />
              <h3 className="text-xl font-bold text-foreground">Peugeot 3008</h3>
            </div>

            <div className="text-center">
              <OptimizedImage
                src={peugeot5008}
                alt="Peugeot 5008 extended warranty cover"
                className="w-full max-w-[280px] h-auto mx-auto mb-4 rounded-lg"
                priority={false}
                width={1280}
                height={720}
              />
              <h3 className="text-xl font-bold text-foreground">Peugeot 5008</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {[
              'Peugeot 108',
              'Peugeot 208',
              'Peugeot 2008',
              'Peugeot 308',
              'Peugeot 3008',
              'Peugeot 5008',
              'Peugeot Rifter',
              'Peugeot Expert',
              'Peugeot Boxer'
            ].map((model, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-card">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{model}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-lg text-muted-foreground mb-8">
            New, used and high-mileage vehicles are all eligible.
          </p>

          <div className="text-center">
            <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
              ✅ Get My Quote <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How Peugeot Extended Warranty Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Choose your plan</h3>
              <p className="text-muted-foreground">Select a plan based on your mileage, model and preferred claims limit.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Activate online</h3>
              <p className="text-muted-foreground">No paperwork and no inspection required in most cases.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Drive with confidence</h3>
              <p className="text-muted-foreground">If a covered part fails, the warranty pays for diagnostics, labour and replacement parts.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Use any VAT-registered garage</h3>
              <p className="text-muted-foreground">You are not restricted to Peugeot dealerships.</p>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={navigateToQuoteForm} className="text-lg px-8">
              🚗 Get Cover Today <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 md:py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {peugeotFAQs.map((faq, index) => (
              <Collapsible key={index} className="bg-card rounded-lg border border-border">
                <CollapsibleTrigger className="w-full p-6 text-left flex justify-between items-center hover:bg-accent/50 transition-colors">
                  <span className="font-semibold text-lg text-foreground pr-4">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="quote-form-section" className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Get Protected Before the Next Repair Bill Hits
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Keep your Peugeot running smoothly with reliable cover for mechanical and electrical failures. Secure instant protection, avoid unexpected costs and enjoy confidence on every journey with a plan built around your car's age, mileage and daily use.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/?step=1')}
              className="w-full sm:w-auto text-lg px-8 py-6"
            >
              Get my Peugeot warranty quote <ArrowRight className="ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'tel:03302295040'}
              className="w-full sm:w-auto text-lg px-8 py-6"
            >
              <Phone className="mr-2" /> 0330 229 5040
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <OptimizedImage
              src={peugeotRange}
              alt="Peugeot vehicle range covered by extended warranty"
              className="w-full h-auto rounded-lg shadow-xl"
              priority={false}
              width={1280}
              height={720}
            />
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Button
          size="icon"
          onClick={() => window.location.href = 'tel:03302295040'}
          className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="Call us"
        >
          <Phone className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          onClick={() => window.open('https://wa.me/447951581848', '_blank')}
          className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-green-600 hover:bg-green-700"
          aria-label="WhatsApp us"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        {showScrollTop && (
          <Button
            size="icon"
            onClick={scrollToTop}
            className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform"
            aria-label="Scroll to top"
          >
            <ArrowRight className="w-6 h-6 rotate-[-90deg]" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PeugeotWarranty;
