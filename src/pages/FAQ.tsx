import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, MessageCircle, Phone, Mail, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SEOHead } from '@/components/SEOHead';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqData = [
    {
      category: 'Getting Started',
      id: 'getting-started',
      questions: [
        {
          id: 'what-is-warranty',
          question: 'What\'s a car warranty and why should I get one?',
          answer: 'Think of a warranty as a backup plan for your car. If something goes wrong – like a mechanical or electrical fault – your warranty helps cover the cost of repairs. New cars usually come with a manufacturer\'s warranty for about 3 years. After that, you\'re on your own unless you get an extended warranty. That\'s where we come in – giving you peace of mind and helping you avoid surprise bills.',
          popular: true
        },
        {
          id: 'why-extended-warranty',
          question: 'Why bother with an extended warranty?',
          answer: 'Once your manufacturer\'s warranty runs out, you\'re responsible for any repairs. Our extended warranty helps protect you from unexpected costs – whether it\'s a breakdown, electrical fault or something else. We also include extras like roadside recovery, car hire and onward travel. It\'s all about making life easier and less stressful when things go wrong.'
        },
        {
          id: 'choose-right-plan',
          question: 'How do I choose the right plan for my car?',
          answer: 'We\'ll help you pick a plan that suits your car\'s age, mileage and how you use it. Whether you drive a little or a lot, we\'ve got options to match.'
        }
      ]
    },
    {
      category: 'Making Claims',
      id: 'making-claims',
      questions: [
        {
          id: 'car-issue',
          question: 'What should I do if my car has an issue?',
          answer: 'If your car experiences a problem, please contact our Claims Team at 0330 229 5045. They are available Monday to Friday from 09:00 to 17:30 and can help start and process your warranty claim. If the issue arises outside of these hours, please fill out our online contact form at www.buyawarranty.co.uk/make-a-claim',
          popular: true
        },
        {
          id: 'how-make-claim',
          question: 'How do I make a claim?',
          answer: 'Arrange for your vehicle to be inspected by a local independent repair garage to diagnose any issues. Once diagnosed, before any repairs are conducted, the repairer must directly contact our Claims Team at 0330 229 5045. It\'s important to note that failure to do so will not allow us to process your claim.',
          popular: true
        },
        {
          id: 'pay-upfront',
          question: 'Do I have to pay the garage upfront and then seek reimbursement from you?',
          answer: 'No, we can directly pay the garage the authorised amount through a bank transfer.'
        },
        {
          id: 'how-much-pay',
          question: 'How much do I need to pay?',
          answer: 'When your claim is authorised, it will be for a specific sum of money agreed upon with your repairing garage. You may need to pay any warranty excess and/or for components not covered under the warranty, as well as any amount exceeding the claim limit of your warranty.'
        },
        {
          id: 'vehicle-inspection',
          question: 'Is a vehicle inspection necessary before I can make a claim?',
          answer: 'In certain situations, we may need to inspect your vehicle before validating your claim.'
        }
      ]
    },
    {
      category: 'Coverage Details',
      id: 'coverage-details',
      questions: [
        {
          id: 'what-covered',
          question: 'What does your warranty cover?',
          answer: 'Our plans cover a wide range of parts – from the engine and gearbox to electrical systems and more. We offer the most comprehensive warranty plan for our customers to ensure that you get the most cover.',
          popular: true
        },
        {
          id: 'not-covered',
          question: 'Are there items that aren\'t covered?',
          answer: 'Yes, some items like wear-and-tear items (e.g. tyres, brake pads) unless you take the add-on option for wear and tear, tyre cover etc or damage from accidents are not included. We\'ll always be upfront about what\'s covered and what\'s not, so there are no surprises.'
        },
        {
          id: 'wear-tear',
          question: 'Does my warranty cover wear and tear?',
          answer: 'No, it does not. The warranty does not cover worn or wearing components on a used car. It is not intended to replace items as they wear on your car, even a brand-new car warranty will not cover normal wear and tear. However, we do offer wear and tear cover as an additional service as you can see on the pricing page when you buy a warranty.'
        },
        {
          id: 'diagnostic-charges',
          question: 'Does my warranty cover diagnostic charges?',
          answer: 'The warranty does cover diagnostic charges. We also cover physical dismantling charges in the event of a valid claim, subject to the warranty\'s maximum claim limit.'
        },
        {
          id: 'mechanical-electrical',
          question: 'What counts as mechanical or electrical parts?',
          answer: 'Mechanical parts are things like your engine, gearbox and suspension. Electrical parts include your car\'s wiring, sensors, and tech systems. We\'ll explain exactly what\'s covered in your plan.'
        }
      ]
    },
    {
      category: 'Garages & Repairs',
      id: 'garages-repairs',
      questions: [
        {
          id: 'preferred-garage',
          question: 'Can I use my preferred garage for repairs?',
          answer: 'Yes, you are allowed to use your own garage. You can opt for a main dealer, but be prepared to cover the price difference compared to a local independent garage. Please ensure the garage is VAT registered.'
        },
        {
          id: 'own-garage',
          question: 'Can I use my own garage?',
          answer: 'Absolutely – as long as they\'re VAT-registered and follow our repair guidelines. We want you to feel comfortable with who\'s working on your car.'
        },
        {
          id: 'breakdown-hours',
          question: 'What if I break down outside office hours or on holiday?',
          answer: 'We\'ve got you covered. Our support doesn\'t stop when the office closes – we\'ll help you get back on the road, even if it\'s a weekend or bank holiday if you add 24/7 breakdown cover to your warranty.'
        },
        {
          id: 'hire-car',
          question: 'Will you cover the cost of a hire car?',
          answer: 'If your car\'s off the road due to a covered fault, we can help with car hire costs. It\'s one of the handy extras included in many of our plans.'
        },
        {
          id: 'breakdown-abroad',
          question: 'Can I get help if I break down abroad?',
          answer: 'Yes – we offer European cover claim back with some of our plans. Just let us know where you\'re going and we\'ll make sure you\'re protected.'
        }
      ]
    },
    {
      category: 'Service & Maintenance',
      id: 'service-maintenance',
      questions: [
        {
          id: 'service-car',
          question: 'Do I need to get my vehicle serviced?',
          answer: 'Yes, you do. It is important to adhere to the manufacturer\'s recommendations for servicing at the correct times/mileages after taking delivery of the vehicle. The service does not necessarily have to be completed by a main dealer unless you want to maintain a full dealer history, but it is important to retain relevant receipts as proof.'
        },
        {
          id: 'service-regularly',
          question: 'Do I need to service my car regularly?',
          answer: 'Yes please! Keeping up with your car\'s servicing schedule helps keep your warranty valid. Just follow the manufacturer\'s guidelines and keep your receipts.'
        },
        {
          id: 'service-before-warranty',
          question: 'Do I need to service my car before getting a warranty?',
          answer: 'If your car\'s service history is up to date, you\'re good to go. If it\'s missing a service, you\'ll need to get that done before your cover starts. Just follow the manufacturer\'s servicing schedule and keep your receipts.'
        },
        {
          id: 'missed-service',
          question: 'What if the previous owner missed a service?',
          answer: 'No worries – you\'ll just need to get the vehicle serviced properly before your warranty kicks in. It\'s all about making sure your vehicle\'s in good shape from the start.'
        },
        {
          id: 'inspection-required',
          question: 'Do I need an inspection before buying a plan?',
          answer: 'No – we don\'t require a vehicle inspection. Just make sure your car meets the basic eligibility criteria.'
        }
      ]
    },
    {
      category: 'Plans & Pricing',
      id: 'plans-pricing',
      questions: [
        {
          id: 'how-long-cover',
          question: 'How long can I get cover for?',
          answer: 'You can choose a plan that suits you – pay in full and save more money, spread it over 12 months interest free, or go for monthly Pay As You Go. We\'re flexible.'
        },
        {
          id: 'change-mind',
          question: 'What if I change my mind after buying?',
          answer: 'No problem. You\'ve got a cooling-off period (usually 14 days) to cancel for a full refund, as long as you haven\'t made a claim.'
        },
        {
          id: 'cancel-warranty',
          question: 'How do I cancel my warranty?',
          answer: 'You have 14 days to cancel your warranty. We understand that circumstances may change, and you may no longer require the warranty purchased from Buyawarranty.co.uk. If you wish to cancel your warranty, please reach out to us at support@buyawarranty.co.uk or call us on 0330 229 5045.'
        },
        {
          id: 'transferable',
          question: 'Is the warranty transferable?',
          answer: 'The cover is transferable to a new owner if sold privately. Most of our warranties can be transferred to the new owner – it\'s a great selling point and adds value to your car. There is a £30 fee for transferring the warranty to a new owner. Please contact us on the contact form to transfer your warranty to a new owner.'
        }
      ]
    }
  ];

  // Filter FAQs based on search term
  const filteredFAQs = useMemo(() => {
    if (!searchTerm) return faqData;
    
    return faqData.map(category => ({
      ...category,
      questions: category.questions.filter(
        q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.questions.length > 0);
  }, [searchTerm]);

  // Get popular questions
  const popularQuestions = faqData
    .flatMap(category => category.questions)
    .filter(q => q.popular)
    .slice(0, 5);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveCategory(categoryId);
    }
  };

  return (
    <>
      <SEOHead 
        title="FAQ's - Frequently Asked Questions | BuyAWarranty.co.uk"
        description="Find answers to common questions about car warranties, claims, coverage, and more. Get help with warranty plans, repairs, and customer support."
        keywords="car warranty FAQ, warranty questions, car insurance claims, vehicle warranty coverage, warranty help"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <div className="flex items-center">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
                </a>
              </div>
              
              {/* Navigation - Hidden on mobile, visible on lg+ */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">BUY PROTECTION</Link>
                <Link to="/protected" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">SERVICE A COMPLAINT</Link>
                <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">MAKE A CLAIM</Link>
                <Link to="/faq" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">FAQs</Link>
                <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">CONTACT US</Link>
              </nav>

              {/* Desktop CTA Buttons - Show on desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 px-3 text-sm"
                >
                  WhatsApp Us
                </Button>
                <Button 
                  size="sm"
                  className="bg-orange-500 text-white hover:bg-orange-600 px-3 text-sm"
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
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col h-full">
                    {/* Header with logo */}
                    <div className="flex items-center justify-between pb-6">
                      <a href="/" className="hover:opacity-80 transition-opacity">
                        <img 
                          src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" 
                          alt="Buy a Warranty" 
                          className="h-8 w-auto"
                        />
                      </a>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col space-y-6 flex-1">
                      <Link 
                        to="/" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Warranty Plans
                      </Link>
                      <Link 
                        to="/protected" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        What's Covered
                      </Link>
                      <Link 
                        to="/make-a-claim" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Make a Claim
                      </Link>
                      <Link 
                        to="/faq" 
                        className="text-orange-500 hover:text-orange-600 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                         FAQs
                      </Link>
                      <Link 
                        to="/contact-us" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact Us
                      </Link>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="space-y-4 pt-6 mt-auto">
                      <Button 
                        variant="outline" 
                        className="w-full bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 text-lg py-3"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        WhatsApp Us
                      </Button>
                      <Button 
                        className="w-full bg-orange-500 text-white hover:bg-orange-600 text-lg py-3"
                        onClick={() => setIsMobileMenuOpen(false)}
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
        
        {/* Header Section */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-brand-dark-text mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h1>
              <p className="text-lg text-brand-dark-text max-w-3xl mx-auto mb-8">
                Find answers to the most common questions about our warranty services. 
                Can't find what you're looking for? We're here to help.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="font-bold text-lg text-brand-dark-text mb-4">Quick Navigation</h3>
                  <nav className="space-y-2">
                    {faqData.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          activeCategory === category.id
                            ? 'bg-primary text-white'
                            : 'text-brand-dark-text hover:bg-gray-100'
                        }`}
                      >
                        {category.category}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Popular Questions */}
                {!searchTerm && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-bold text-lg text-brand-dark-text mb-4">Popular Questions</h3>
                    <div className="space-y-3">
                      {popularQuestions.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => toggleItem(q.id)}
                          className="w-full text-left text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {q.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {searchTerm && (
                <div className="mb-6">
                  <p className="text-brand-dark-text">
                    {filteredFAQs.reduce((total, category) => total + category.questions.length, 0)} 
                    {' '}results found for "{searchTerm}"
                  </p>
                </div>
              )}

              {filteredFAQs.map((category) => (
                <section key={category.id} id={category.id} className="mb-12">
                  <h2 className="text-2xl font-bold text-brand-dark-text mb-6 pb-3 border-b-2 border-primary">
                    {category.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {category.questions.map((faq) => (
                      <div key={faq.id} className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-orange-600/20 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="font-semibold text-lg text-white pr-4">
                              {faq.question}
                            </span>
                            {faq.popular && (
                              <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                          <ChevronDown 
                            className={`w-6 h-6 flex-shrink-0 text-white transition-transform duration-300 ${
                              openItems[faq.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {openItems[faq.id] && (
                          <div className="px-6 pb-5 bg-white border-t border-orange-200 animate-accordion-down">
                            <div className="pt-4">
                              <p className="text-brand-dark-text leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* Contact Section */}
              <section className="bg-white rounded-lg shadow-lg p-8 mt-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-brand-dark-text mb-4">
                    Still Need Help?
                  </h2>
                  <p className="text-brand-dark-text mb-6">
                    Can't find the answer you're looking for? Our friendly team is here to help.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <a href="tel:03302295040" className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call Us
                      </a>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      <a href="mailto:info@buyawarranty.co.uk" className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Us
                      </a>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      <Link to="/" className="flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Live Chat
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-sm text-brand-dark-text">
                    <p className="mb-2">
                      <strong>Phone:</strong> 0330 229 5040 | <strong>Claims:</strong> 0330 229 5045
                    </p>
                    <p>Monday to Friday, 9am to 6pm</p>
                  </div>
                </div>
              </section>

              {/* Complaints Section */}
              <section className="bg-gray-100 rounded-lg p-6 mt-8">
                <h3 className="font-bold text-lg text-brand-dark-text mb-3">
                  Have a Complaint?
                </h3>
                <p className="text-brand-dark-text">
                  We take complaints very seriously. Our UK-based team will look into it properly. 
                  Please email us at{' '}
                  <a 
                    href="mailto:info@buyawarranty.co.uk" 
                    className="text-primary hover:text-primary/80 transition-colors underline"
                  >
                    info@buyawarranty.co.uk
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;