import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HomepageFAQ = () => {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const leftColumnFAQs = [
    {
      id: 'what-is-warranty',
      question: 'What is a Warranty?',
      answer: 'A warranty is a promise from a company to fix or replace a product if it breaks within a certain time period. For vehicles, it covers repairs for mechanical and electrical components that fail due to normal use.'
    },
    {
      id: 'how-claims-work',
      question: 'How do claims work?',
      answer: 'When something covered by your warranty breaks, you contact us to report the claim. We authorize repairs at approved garages, and you don\'t pay anything towards the covered repair costs.'
    },
    {
      id: 'what-covered',
      question: 'What\'s covered under the warranty?',
      answer: 'Our warranty covers engine, gearbox, clutch, turbo, drivetrain, suspension, steering, braking systems, fuel systems, cooling systems, emissions systems, ECUs, electrical systems, driver assistance technology, oil conditioning, air conditioning, and multimedia systems.'
    },
    {
      id: 'vehicle-age-mileage',
      question: 'What vehicle age and mileage do you cover?',
      answer: 'We cover vehicles up to 15 years old and with up to 150,000 miles on the odometer at the time of purchase.'
    },
    {
      id: 'monthly-payment',
      question: 'Can I pay monthly?',
      answer: 'Yes! We offer flexible payment options including monthly payments with 0% APR, making it easier to budget for your vehicle protection.'
    }
  ];

  const rightColumnFAQs = [
    {
      id: 'how-much-cost',
      question: 'How much does it cost?',
      answer: 'Warranty costs start from just £12 per month, depending on your vehicle and the level of cover you choose. Get an instant quote by entering your registration number.'
    },
    {
      id: 'claim-limits',
      question: 'Are there any claim limits?',
      answer: 'We offer plans with £2,000 or £5,000 per claim limits, with unlimited claims throughout your warranty period. No excess to pay on any approved repairs.'
    },
    {
      id: 'where-repairs',
      question: 'Where can I get repairs done?',
      answer: 'Repairs can be carried out at trusted garages nationwide, including major chains like ATS and Kwik Fit, as well as independent approved repairers.'
    },
    {
      id: 'how-long-valid',
      question: 'How long is the warranty valid?',
      answer: 'You can choose from 1, 2, or 3-year warranty plans. The warranty remains valid as long as you keep up with your payments and maintain your vehicle properly.'
    },
    {
      id: 'cancel-anytime',
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your warranty at any time. If you cancel within the first 30 days, you\'ll receive a full refund. After that, you may be entitled to a pro-rata refund.'
    }
  ];

  const FAQItem = ({ faq }: { faq: { id: string; question: string; answer: string } }) => (
    <div className="bg-brand-orange rounded-lg overflow-hidden shadow-lg border border-orange-400">
      <button
        onClick={() => toggleItem(faq.id)}
        className="w-full px-6 py-5 text-left flex items-center justify-between text-white hover:bg-orange-600 transition-colors"
      >
        <span className="font-bold text-lg pr-4">{faq.question}</span>
        <ChevronDown 
          className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 text-white ${
            openItems[faq.id] ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-200 ease-out ${
        openItems[faq.id] 
          ? 'max-h-screen opacity-100 animate-accordion-down' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-5 text-gray-800 bg-white border-t border-orange-400">
          <p className="text-base leading-relaxed pt-4 transform translate-y-0">{faq.answer}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark-text mb-6 leading-tight">
            <span className="text-brand-orange">FAQ's</span>
          </h2>
          <p className="text-lg text-brand-dark-text max-w-3xl mx-auto leading-relaxed">
            Find answers to the most common questions about our warranty services.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="space-y-6">
            {leftColumnFAQs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightColumnFAQs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageFAQ;