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
                Need van warranty cover in the UK?{" "}
                <span className="text-primary">We've got you sorted</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground">
                Whether you're running a business, delivering goods, or just keeping your van on the road, our van warranty UK plans are built to protect your vehicle and your wallet. From used van warranty options to extended van warranty cover, we make it easy to find the right plan for your needs.
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
                className="w-full h-auto rounded-lg shadow-2xl"
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
              { icon: BadgeCheck, text: "Rated among the best van warranty providers in the UK" },
              { icon: Shield, text: "Cover for diesel, petrol, hybrid and electric vans" },
              { icon: Clock, text: "Buy a van warranty online in minutes" },
              { icon: Check, text: "Flexible plans for older, high-mileage and second-hand vans" },
              { icon: BadgeCheck, text: "Van warranty insurance with no hidden costs" },
              { icon: Shield, text: "UK-wide support and fast claims handling" }
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
                Get extended van warranty cover that works for you
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our warranties are designed to keep your van moving — whether it's for work or personal use. We partner with leading extended van warranty providers to offer reliable protection for:
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
                className="w-full h-auto rounded-lg shadow-xl"
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
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Compare van warranty providers without the hassle
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're proud to be a trusted alternative to Warrantywise, RAC, AA and other van warranty providers. Our customers love us for:
              </p>

              <div className="space-y-4">
                {[
                  "Straightforward cover",
                  "Fast claims turnaround",
                  "Friendly UK-based support",
                  "No pushy sales calls"
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
