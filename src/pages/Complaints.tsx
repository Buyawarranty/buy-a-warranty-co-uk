import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, AlertCircle, Shield, FileText, Menu, Heart, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Complaints = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const complaintSteps = [
    {
      step: 1,
      title: 'Contact Us First',
      description: 'Most issues can be resolved quickly through direct contact with our customer service team.',
      contact: 'Phone: 0330 229 5040 or Email: support@buyawarranty.co.uk'
    },
    {
      step: 2,
      title: 'Formal Complaint',
      description: 'If you\'re not satisfied with our initial response, submit a formal written complaint.',
      contact: 'complaints@buyawarranty.co.uk'
    },
    {
      step: 3,
      title: 'Independent Review',
      description: 'If we can\'t resolve your complaint, you can refer it to the Financial Ombudsman Service.',
      contact: 'Free and independent service'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Complaints Procedure | Buy A Warranty - We Listen & Act"
        description="Our commitment to fair treatment and excellent service. Learn about our complaints procedure and how we resolve customer concerns quickly and fairly."
        keywords="complaints, customer service, fair treatment, resolution"
        canonical={`${window.location.origin}/complaints`}
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
                  <Menu className="h-6 w-6" />
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
                    <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      What's Covered
                    </Link>
                    <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Make a Claim
                    </Link>
                    <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                       FAQs
                    </Link>
                    <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200" onClick={() => setIsMobileMenuOpen(false)}>
                      Contact Us
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-500 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                We Listen <span className="text-primary">&</span> We Care
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              If you feel you've been unfairly treated, we want to hear from you. Your voice matters to us, and we're committed to making things right. We listen attentively to every concern and work hard to resolve issues fairly and promptly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white p-6 rounded-lg shadow-sm">
              <AlertCircle className="w-6 h-6 text-primary" />
              <span className="font-medium text-gray-800">We Listen Attentively</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white p-6 rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-medium text-gray-800">Fair Treatment Guaranteed</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white p-6 rounded-lg shadow-sm">
              <Clock className="w-6 h-6 text-primary" />
              <span className="font-medium text-gray-800">Quick Resolution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Let's Talk First</h2>
            <p className="text-xl mb-8 text-white/90">
              Most concerns can be resolved quickly with a simple conversation. Our friendly team is here to help.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <a 
                href="tel:03302295040" 
                className="bg-white text-primary font-bold py-4 px-8 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call: 0330 229 5040
              </a>
              <a 
                href="mailto:support@buyawarranty.co.uk" 
                className="bg-white text-primary font-bold py-4 px-8 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-3" />
                Email: support@buyawarranty.co.uk
              </a>
            </div>
            <p className="mt-6 text-sm text-white/80">
              Our customer service hours: Monday - Friday, 9:00 AM - 5:30 PM
            </p>
          </div>
        </div>
      </section>

      {/* Complaints Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Complaints <span className="text-primary">Process</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe in transparency and fairness. Here's our step-by-step process to ensure your complaint is handled properly.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {complaintSteps.map((step, index) => (
              <div key={step.step} className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-primary">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-4 text-lg">{step.description}</p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-primary font-semibold">{step.contact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Need Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What We Need From <span className="text-primary">You</span>
              </h2>
              <p className="text-lg text-gray-600">
                To help us resolve your complaint quickly and fairly, please provide:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Your Policy Details</h4>
                    <p className="text-gray-600">Policy number, registration number, or any reference numbers you have.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Clear Description</h4>
                    <p className="text-gray-600">What happened, when it happened, and what outcome you're looking for.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Supporting Documents</h4>
                    <p className="text-gray-600">Any emails, letters, invoices, or photos related to your complaint.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <p className="text-gray-600">Your preferred contact method so we can keep you updated.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Timeline of Events</h4>
                    <p className="text-gray-600">When things happened and what steps you've already taken.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Previous Communications</h4>
                    <p className="text-gray-600">Details of any previous conversations or attempts to resolve the issue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Ombudsman Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Independent Support Available
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                If you're not satisfied with our response to your complaint, you have the right to refer your case to the Financial Ombudsman Service - a free, independent service.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Website:</h4>
                  <a href="https://www.financial-ombudsman.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    financial-ombudsman.org.uk
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Phone:</h4>
                  <p className="text-gray-600">0800 023 4567</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email:</h4>
                  <p className="text-gray-600">complaint.info@financial-ombudsman.org.uk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            We're Here to Make Things Right
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Your satisfaction is our priority. We're committed to treating all customers fairly and resolving issues promptly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 py-3">
                Contact Us Now
              </Button>
            </Link>
            <a href="mailto:complaints@buyawarranty.co.uk">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-bold px-8 py-3">
                Email Formal Complaint
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Complaints;