import { SEOHead } from "@/components/SEOHead";
import TrustpilotHeader from "@/components/TrustpilotHeader";
import { Button } from "@/components/ui/button";
import { Check, Shield, Clock, BadgeCheck, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import vanHeroImage from "@/assets/van-warranty-uk-vehicle-protection.png";
import vanQuotesImage from "@/assets/van-warranty-uk-quotes.png";
import vanTrustedImage from "@/assets/van-warranty-uk-trusted-cover.png";
import whatsappIcon from "@/assets/whatsapp-icon.webp";

const VanWarranty = () => {
  const navigate = useNavigate();

  const scrollToQuote = () => {
    navigate('/', { state: { scrollToForm: true } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <SEOHead
        title="Van Warranty UK | Best Van Warranty Companies & Providers"
        description="Buy a van warranty online in minutes. Compare van warranty quotes from trusted UK providers. Extended van warranty cover for used vans, high-mileage vehicles & commercial vans."
        keywords="van warranty UK, buy van warranty online, extended van warranty, used van warranty, van warranty companies, best van warranty providers, van warranty quotes, van warranty insurance, van warranty prices UK"
        canonical="https://buyawarranty.co.uk/van-warranty-companies-uk-warranties"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-8">
            <TrustpilotHeader className="mb-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="text-center md:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Protect Your Van with <span className="text-primary">Trusted UK Cover</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground">
                Whether you rely on your van for business deliveries, trade work, or personal use, we offer comprehensive protection plans that fit your budget. Get instant quotes for new or used vans, with flexible payment options and no hidden fees.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  onClick={scrollToQuote}
                  className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Your Van Warranty Quote
                </Button>
              </div>
            </div>

            <div className="relative">
              <img
                src={vanHeroImage}
                alt="Van warranty UK - Mercedes Sprinter van with panda driver"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why van owners across the UK choose us
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BadgeCheck, text: "Highly rated provider trusted by van owners nationwide" },
              { icon: Shield, text: "Comprehensive cover for all van types and fuel systems" },
              { icon: Clock, text: "Get instant quotes and buy online in minutes" },
              { icon: Check, text: "Protection available for older and high-mileage vehicles" },
              { icon: BadgeCheck, text: "Transparent pricing with zero hidden charges" },
              { icon: Shield, text: "Fast claims processing backed by UK-wide support" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Comprehensive Protection for Your Van
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our plans are designed to keep your van on the road — whether you use it for business or personal journeys. We provide reliable coverage for all the essential components:
              </p>

              <div className="space-y-4">
                {[
                  "Engine, gearbox and clutch",
                  "Suspension and steering",
                  "Braking systems",
                  "Electrical components",
                  "Air conditioning and cooling systems"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src={vanQuotesImage}
                alt="Van warranty quotes - Compare van warranty providers for cars, vans, and motorcycles"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best Van Warranty Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Looking for the best van warranty UK drivers trust?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We've helped thousands of van owners across the UK find affordable, dependable cover. Whether you're after a short-term plan or long-term protection, we'll help you get van warranty quotes that suit your budget.
          </p>
        </div>
      </section>

      {/* How to Buy Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How to buy a van warranty online
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", text: "Enter your registration" },
              { step: "2", text: "Choose your cover level" },
              { step: "3", text: "Select your payment option" },
              { step: "4", text: "Get protected instantly" }
            ].map((item) => (
              <div key={item.step} className="bg-card p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                  {item.step}
                </div>
                <p className="font-medium">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-lg mt-8 text-muted-foreground">
            It's that simple. You can buy a used van warranty, get extended van warranty, or even find van warranty for older vehicles — all in one place.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Van warranty prices UK – made simple
          </h2>

          <p className="text-lg text-muted-foreground text-center mb-8">
            We offer clear pricing with no surprises. Choose from:
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              "Pay monthly van warranty plans",
              "One-off payments with discounts",
              "6, 12, 24 or 36-month cover options"
            ].map((option, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-md text-center">
                <Check className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="font-medium">{option}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Providers Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <img
                src={vanTrustedImage}
                alt="Van warranty providers UK - Trusted cover for vans, cars, and motorcycles"
                className="w-full h-auto"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Van Owners Trust Our Service
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We've built a strong reputation as a reliable van warranty provider in the UK. Our customers appreciate our honest approach, transparent plans, and genuine commitment to keeping their vehicles protected. Here's what sets us apart:
              </p>

              <div className="space-y-4">
                {[
                  "Award-winning service with verified customer reviews",
                  "Specialist knowledge of commercial vehicle protection",
                  "Friendly UK-based customer support team",
                  "Expert advice tailored to your van and business needs",
                  "Straightforward pricing with no surprise charges",
                  "Independent company focused on customer care"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Buy & How to Get Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Where to buy van warranty UK coverage – and how to get it
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4">How to Get Cover for Your Van</h3>
              <p className="text-muted-foreground mb-6">
                Protecting your van is quick and simple with our online service. Whether you've just purchased a vehicle or want to extend existing cover, you can get an instant quote and buy protection in minutes — even if your manufacturer's warranty has already expired.
              </p>
              <ul className="space-y-3">
                {[
                  "Request instant quotes online with no obligation",
                  "Cover available anytime, even years after purchase",
                  "Easy application process for post-purchase protection",
                  "Extend your peace of mind when dealer cover runs out"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Protection for Used and Second-Hand Vans</h3>
              <p className="text-muted-foreground mb-6">
                If you've bought a pre-owned van, warranty cover is highly recommended to protect against unexpected repair bills. Here's what to consider when choosing the right plan:
              </p>
              <ul className="space-y-3">
                {[
                  "Review what's covered before making your decision",
                  "Consider your van's age and typical running costs",
                  "Get quotes specific to your make, model and mileage",
                  "Protect yourself from expensive mechanical failures",
                  "Choose flexible terms that can be extended as needed"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Duration Options Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Flexible warranty terms: 12 month, 24 month or 36 month van warranty
          </h2>
          
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Whether you need short term van warranty or long term van warranty protection, we have options for everyone. Our monthly vehicle warranty plans and yearly van warranty UK packages are designed to fit your needs.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                12
              </div>
              <h3 className="text-xl font-bold mb-3">12 month van warranty</h3>
              <p className="text-muted-foreground mb-4">
                Perfect for those who want short term van warranty cover. Ideal if you are planning to upgrade soon or want to try our service.
              </p>
              <Button onClick={scrollToQuote} variant="outline" className="w-full">
                Get 12 Month Quote
              </Button>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-sm text-center border-2 border-primary">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                24
              </div>
              <h3 className="text-xl font-bold mb-3">24 month van warranty</h3>
              <p className="text-muted-foreground mb-4">
                Our most popular choice. Great value for money with comprehensive protection for two years of peace of mind.
              </p>
              <Button onClick={scrollToQuote} className="w-full">
                Get 24 Month Quote
              </Button>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                36
              </div>
              <h3 className="text-xl font-bold mb-3">36 month van warranty</h3>
              <p className="text-muted-foreground mb-4">
                Maximum protection with our 3 year van warranty UK plan. The best long term van warranty for total peace of mind.
              </p>
              <Button onClick={scrollToQuote} variant="outline" className="w-full">
                Get 36 Month Quote
              </Button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Looking for lifetime vehicle warranty UK? While we do not offer truly lifetime cover, our 3 year plans can be renewed. We also offer van warranty after 3 years of dealer cover, warranty post manufacturer expiry, and post warranty van protection.
            </p>
            <p className="text-base text-muted-foreground">
              Need to extend expired van warranty? We can help with vehicle warranty after expiry – just get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* Questions to Ask Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Questions to ask van warranty provider before you buy
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What does van warranty cover?",
                answer: "Our plans cover major mechanical and electrical components including engine, gearbox, steering, brakes, and more. We will explain exactly what is included in your quote."
              },
              {
                question: "Is van warranty worth it UK?",
                answer: "Yes – especially for used vans. One major repair can cost thousands. Our warranty gives you budget certainty and protects you from unexpected bills."
              },
              {
                question: "How much is van warranty?",
                answer: "Prices vary based on your van age, mileage, and chosen cover level. Get an instant quote online to see exact pricing for your vehicle."
              },
              {
                question: "Can I get van warranty anytime?",
                answer: "Yes. Unlike manufacturer warranties, you can buy our cover at any time – even years after your van was purchased."
              },
              {
                question: "Do I need warranty on used van?",
                answer: "We strongly recommend it. Used vans are more likely to need repairs, and warranty cover protects your budget from surprise costs."
              },
              {
                question: "Can I extend my van warranty?",
                answer: "Absolutely. When your current warranty expires, you can easily extend or renew your cover with us."
              }
            ].map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-primary">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            A reputable van warranty UK company you can trust
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Best UK warranty provider", description: "Consistently rated as a top provider" },
              { title: "Verified van warranty UK", description: "All claims handled fairly and efficiently" },
              { title: "Customer rated van warranty", description: "See our genuine customer reviews online" },
              { title: "Trusted vehicle protection UK", description: "Thousands of happy van owners nationwide" }
            ].map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm text-center">
                <BadgeCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get your van covered today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're looking for van warranty UK best value, extended warranty insurance, or just want to protect your used van, we're here to help.
          </p>
          <Button 
            size="lg" 
            onClick={scrollToQuote}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Get Your Van Warranty Quote Now
          </Button>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href="https://wa.me/447908333657"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          aria-label="Contact us on WhatsApp"
        >
          <img src={whatsappIcon} alt="" className="w-6 h-6" />
        </a>
        
        <a
          href="tel:01134570218"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Call us"
        >
          <Phone className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

export default VanWarranty;
