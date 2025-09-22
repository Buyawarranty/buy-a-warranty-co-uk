import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Phone, Mail, Shield, FileText, Clock, Users, Menu } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Terms = () => {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const TermsAccordionItem = ({ item }: { item: any }) => (
    <div className="bg-brand-orange rounded-lg overflow-hidden shadow-lg border border-orange-400 mb-4">
      <button
        onClick={() => toggleItem(item.id)}
        className="w-full px-6 py-5 text-left flex items-center justify-between text-white hover:bg-orange-600 transition-colors"
      >
        <span className="font-bold text-lg pr-4">{item.title}</span>
        <ChevronDown 
          className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 text-white ${
            openItems[item.id] ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {openItems[item.id] && (
        <div className="px-6 pb-6 text-gray-800 bg-white border-t border-orange-400 animate-accordion-down">
          <div className="pt-6">
            {item.content}
          </div>
        </div>
      )}
    </div>
  );

  const termsContent = [
    {
      id: 'introduction',
      title: 'Introduction & Our Promise',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              We know how important peace of mind is when it comes to car ownership, and that's exactly what we're here to provide.
            </p>
            <p className="text-gray-600">
              With our warranty cover, you're backed by a reliable service that includes comprehensive protection for mechanical and electrical repairs, quick claims payouts, and access to trusted garages across the UK.
            </p>
            <p className="text-gray-600">
              We're committed to making things simple, fair and stress-free - so if something goes wrong, we'll be here to help get you back on the road as quickly as possible.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'warranty-confirmation',
      title: 'Warranty Confirmation & Coverage',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600">
            Warranty is confirmed when you receive your confirmation email and payment is received.
          </p>
        </div>
      )
    },
    {
      id: 'conditions',
      title: 'Conditions & Requirements',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600">
            Covers vehicles up to 15 years old and 150,000 miles. 30-day waiting period applies.
          </p>
        </div>
      )
    },
    {
      id: 'cancellation',
      title: 'Cancellation Rights & Refunds',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600">
            14-day cooling off period with full refund if no claims made.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Terms & Conditions | Buy A Warranty - Vehicle Warranty Terms"
        description="Read our comprehensive terms and conditions for vehicle warranty coverage."
        keywords="terms and conditions, warranty terms, vehicle warranty"
        canonical={`${window.location.origin}/terms`}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</Link>
              <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQs</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</Link>
            </nav>

            <div className="hidden lg:flex items-center space-x-3">
              <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="bg-green-500 text-white border-green-500 hover:bg-green-600">
                  WhatsApp Us
                </Button>
              </a>
              <Link to="/">
                <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                  Get my quote
                </Button>
              </Link>
            </div>

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
                      <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-8 w-auto" />
                    </Link>
                  </div>
                  <nav className="flex flex-col space-y-6 flex-1">
                    <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      What's Covered
                    </Link>
                    <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Make a Claim
                    </Link>
                    <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                       FAQs
                    </Link>
                    <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Contact Us
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-brand-orange hover:text-orange-600 transition-colors text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple and Clear - Your Extended Warranty Guide. Everything you need to know about your vehicle warranty coverage explained in plain language.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center bg-brand-orange text-white px-6 py-3 rounded-full font-semibold mb-4">
            <FileText className="w-5 h-5 mr-2" />
            Your Extended Warranty Guide
          </div>
          <div className="mt-4">
            <a 
              href="/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-2.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-orange hover:text-orange-600 font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              See full conditions (PDF)
            </a>
          </div>
        </div>

        {/* Terms Accordions */}
        <div className="space-y-4">
          {termsContent.map((item) => (
            <TermsAccordionItem key={item.id} item={item} />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <Phone className="w-8 h-8 text-brand-orange mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-4">Customer Service</h4>
              <a href="tel:03302295040" className="text-2xl font-bold text-brand-orange hover:text-orange-600 transition-colors">
                0330 229 5040
              </a>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-brand-orange mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-4">Email Support</h4>
              <a href="mailto:support@buyawarranty.co.uk" className="text-lg font-semibold text-brand-orange hover:text-orange-600 transition-colors">
                support@buyawarranty.co.uk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;