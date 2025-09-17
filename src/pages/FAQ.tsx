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
        },
        {
          id: 'vehicle-eligibility',
          question: 'What vehicles are eligible at the start of the plan?',
          answer: 'Vehicles up to 15 years old\nVehicles up to 150,000 miles\nPlans for 12, 24, or 36 months'
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
          id: 'easy-claim-repair',
          question: 'Is it easy to make a claim and get my repair done?',
          answer: 'Yes, absolutely – we\'ve made it simple and hassle-free.\n\n• Follow a few quick steps to start your claim\n• We guide you through the process\n• Repairs handled quickly and professionally\n• Choose your own garage or use our trusted network\n• Payouts usually processed within 90 minutes of approval\n\nSteps:\n1. Contact Us – Call 0330 229 5045 or use our online claims form\n2. Fast Repairs – Same-day claim review during office hours\n3. Payment – We pay the garage directly or reimburse you with a valid invoice\n\nFast Repairs:\nWe will review your claim the same day (during office hours)\nOur goal is to get you back on the road promptly and with minimal fuss\nNo stress, no hassle – just quick and smooth authorisation\n\nOnce your repair is approved:\nWe\'ll handle payment directly with the garage so you\'re not out of pocket\nOr, if you\'ve already paid, we\'ll reimburse you promptly with a valid invoice – no delays or complications'
        },
        {
          id: 'do-you-pay-claims',
          question: 'Do you actually pay out claims?',
          answer: 'Yes, we do – and we\'re proud of it.\n\nNo confusing small print\nStraightforward, honest cover\nExcellent Trustpilot reviews\nConfidence your vehicle is covered when you need it most'
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
        },
        {
          id: 'first-claim-timing',
          question: 'When can I make my first claim?',
          answer: 'You can make your first claim 30 days after you buy your plan, unless you already had an active warranty with us. If you are renewing or moving from one of our plans to another with continuous cover, you can claim straight away. For example, you buy your plan today. A warning light appears after one week. You can make the claim once 30 days have passed.'
        },
        {
          id: 'thirty-day-wait',
          question: 'Why there is a 30 day wait for new customers?',
          answer: 'The 30 day period helps protect everyone by stopping claims for problems that existed before the plan started. It makes sure the warranty is being used for genuine unexpected faults rather than known issues. For example "Your car shows a fault on day 15 and a garage diagnoses it on day 20. You can proceed with the covered repair once the 30 days have passed and the claim is approved."'
        }
      ]
    },
    {
      category: 'Coverage Details',
      id: 'coverage-details',
      questions: [
        {
          id: 'whats-covered-warranty',
          question: 'What\'s covered in my warranty?',
          answer: 'At Buy-a-Warranty, we like to keep things simple. One solid plan that works for cars, vans, and motorbikes, whether you\'re driving electric, hybrid, petrol, or diesel.\n\nWe keep things simple with no confusing packages\nYou won\'t encounter any unexpected rejections\nWe offer straightforward cover without the hassle\nClear, easy-to-understand protection\n\nBecause maintaining your vehicle shouldn\'t be a headache.',
          popular: true
        },
        {
          id: 'whats-included-warranty',
          question: 'What\'s included in my warranty?',
          answer: 'Our Platinum Plan comes as standard and includes:\n\n• All mechanical and electrical parts covered\n• Labour costs included\n• Fault diagnostics\n• Consequential damage cover\n• Access to trusted repair centres or your own garage\n\nFor more details please visit our \'What\'s covered\' page here.'
        },
        {
          id: 'components-covered',
          question: 'What components are covered?',
          answer: 'All mechanical and electrical parts covered\n\nLabour costs included a brief summary of which is below:\n\n**Petrol & Diesel Vehicles**\nEngine, gearbox, drivetrain, turbocharger, fuel systems, cooling, exhaust, brakes, suspension, steering, air conditioning, electrical systems, ECUs, sensors, lighting, multimedia, driver assistance, safety systems.\n\n**Hybrid & PHEV**\nAll above plus hybrid drive motors, batteries, inverters, regenerative braking, high-voltage components.\n\n**Electric Vehicles**\nDrive motors, high-voltage battery, inverters, chargers, thermal systems, regenerative braking.\n\n**Motorcycles**\nEngine/motor, gearbox, ECUs, electrical systems, suspension, brakes, cooling, lighting, instrumentation.\n\nFor full details, please see visit our \'What\'s covered\' section\nhttps://buyawarranty.co.uk/what-is-covered'
        },
        {
          id: 'petrol-diesel-parts',
          question: 'What parts are covered for my petrol or diesel car or van?',
          answer: '**Petrol & Diesel (Combustion Engine) Vehicles**\n\nEngine & Internal Components (pistons, valves, camshafts, timing chains, seals, gaskets)\nGearbox / Transmission Systems (manual, automatic, DSG, CVT, dual-clutch, transfer boxes)\nDrivetrain & Clutch Assemblies (flywheel, driveshafts, differentials)\nTurbocharger & Supercharger Units\nFuel Delivery Systems (tanks, pumps, injectors, fuel rails, fuel control electronics)\nCooling & Heating Systems (radiators, thermostats, water pumps, cooling fans, heater matrix)\nExhaust & Emissions Systems (catalytic converters, DPFs, OPFs, EGR valves, NOx)'
        },
        {
          id: 'hybrid-phev-parts',
          question: 'What parts are covered for Hybrid & PHEV Vehicle?',
          answer: '**Hybrid & PHEV Vehicles**\n\nAll petrol/diesel engine parts and labour plus:\nHybrid Drive Motors & ECUs\nHybrid Battery Failure\nPower Control Units, Inverters & DC-DC Converters\nRegenerative Braking Systems\nHigh-Voltage Cables & Connectors\nCooling Systems for Hybrid Components\nCharging Ports & On-Board Charging Modules\nHybrid Transmission Components\n\n**Other Covered Systems**\nBraking Systems (ABS, calipers, cylinders, master cylinders)\nSuspension & Steering Systems (shocks, struts, steering racks, power/electric steering pumps, electronic suspension)\nAir Conditioning & Climate Control Systems\nElectrical Components & Charging Systems (alternators, starter motors, wiring looms, connectors, relays)\nElectronic Control Units (ECUs) & Sensors (engine management, ABS, traction control, emissions sensors)\nLighting & Ignition Systems (headlights, indicators, ignition coils, switches, control modules)\nFactory-Fitted Multimedia & Infotainment Systems (screens, sat nav, audio, digital displays)\nDriver Assistance Systems (adaptive cruise control, lane assist, steering assist, parking sensors, reversing cameras)\nSafety Systems (airbags, seatbelts, pretensioners, safety restraint modules)\n\nFor full details, please see visit our \'What\'s covered\' section\nhttps://buyawarranty.co.uk/what-is-covered'
        },
        {
          id: 'electric-vehicle-parts',
          question: 'What parts are covered for my Electric Vehicle (EV) - car or van?',
          answer: '**Electric Vehicles (EVs)**\n\nEV Drive Motors & Reduction Gear\nEV Transmission & Reduction Gearbox Assemblies\nHigh-Voltage Battery Failure\nPower Control Units & Inverters\nOn-Board Charger (OBC) & Charging Ports\nDC-DC Converters\nThermal Management Systems\nHigh-Voltage Cables & Connectors\nEV-Specific Control Electronics\nRegenerative Braking System Components\n\nFor full details, please see visit our \'What\'s covered\' section\nhttps://buyawarranty.co.uk/what-is-covered'
        },
        {
          id: 'motorbike-parts',
          question: 'What parts are covered for my motorbike?',
          answer: '**Motorcycles (Petrol, Hybrid, EV)**\n\nEngine / Motor & Drivetrain Components\nGearbox / Transmission Systems\nECUs, Sensors & Control Modules\nElectrical Systems & Wiring\nHigh-Voltage Battery Failure (Hybrid & EV)\nSuspension & Steering Systems\nBraking Systems\nCooling & Thermal Systems\nLighting & Ignition Systems\nInstrumentation & Rider Controls\n\nFor more details please visit our \'What\'s covered\' page here.'
        },
        {
          id: 'optional-extras',
          question: 'What optional extras do you offer?',
          answer: 'Vehicle rental\nWear & tear cover\nTyre replacement cover\nEuropean repair cover\nBreakdown recovery\nTransferable warranty'
        },
        {
          id: 'what-not-covered',
          question: 'What\'s not covered?',
          answer: 'We believe in clarity. Here\'s what isn\'t included:\nPre-existing faults\nRoutine servicing & maintenance (e.g., tyres, brake pads) unless added as add-ons\nAccident or collision damage\nVehicles used for hire or reward (e.g., courier, taxi or rental)'
        },
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
        },
        {
          id: 'repair-limits',
          question: 'What are the repair limits?',
          answer: 'We\'ll cover repairs up to the claim limit you chose when you signed up.'
        },
        {
          id: 'increase-claim-limit',
          question: 'How can I increase my claim limit?',
          answer: 'You may upgrade your claim limit by calling us on 0330 229 5040 or emailing us at support@buyawarranty.co.uk'
        },
        {
          id: 'increase-claim-limit-for-claim',
          question: 'Can I increase my claim limit for a claim?',
          answer: 'If you decide you want a higher claim limit. You can call 0330 229 5040 or email support@buyawarranty.co.uk to upgrade. The higher limit will apply to any future approved claims after the upgrade is confirmed.'
        },
        {
          id: 'unlimited-repairs',
          question: 'Are repairs unlimited?',
          answer: 'We\'ll keep covering repairs up to the original purchase price of your vehicle.'
        },
        {
          id: 'whats-not-covered-indirect',
          question: 'What\'s not covered?',
          answer: 'We can\'t cover indirect or knock-on financial losses i.e hotel booking, lose earnings from work'
        },
        {
          id: 'outside-terms',
          question: 'What if something falls outside these terms?',
          answer: 'We get that life isn\'t always black and white. If something falls outside these terms, we\'ll still look at it fairly and help where we can.'
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
        },
        {
          id: 'mileage-limit',
          question: 'What mileage limit applies?',
          answer: 'Your vehicle should not exceed 2,000 miles per month.'
        },
        {
          id: 'servicing-requirements',
          question: 'What are the servicing requirements?',
          answer: 'A full service history is needed, if you don\'t have that simply get a full service within 30 days of starting your plan e.g You book a full service within 30 days because you do not have a full service history. Once the service is done and the 30 days have passed, you can make your first claim if needed.'
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
          id: 'cancellation-rights',
          question: 'What are my cancellation rights?',
          answer: '• You can cancel within 14 days of purchase for a full refund (if no repairs have been made)\n• After this period, our standard cancellation policy applies\n• Take your time - there\'s no pressure to decide right away'
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
        },
        {
          id: 'transfer-warranty-new-vehicle',
          question: 'Can I transfer my warranty to another vehicle?',
          answer: 'Got a new car or selling your car? Your warranty plan may be transferred with a small fee if a replacement vehicle is of a vehicle type that we provide warranty for i.e most vehicles. You may check eligibility by entering the registration plate into our homepage. Please email support@buyawarranty.co.uk to transfer your warranty or choose the option from the pricing page when you purchase your warranty.'
        },
        {
          id: 'cancel-warranty-detailed',
          question: 'Can I cancel my warranty?',
          answer: 'You have 14 days to cancel for a full refund (if no repairs have been paid).'
        }
      ]
     },
    {
      category: 'Contact Information',
      id: 'contact-information',
      questions: [
        {
          id: 'how-contact-you',
          question: 'How can I contact you?',
          answer: 'Contact us: Have any questions? We\'re here to help:\n\n**Customer sales and support**\nEmail: support@buyawarranty.co.uk\nPhone: 0330 229 5040\n\n**Claims and repairs**\nEmail: claims@buyawarranty.co.uk\nPhone: 0330 229 5045\n\nFriendly support whenever you need us'
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
                <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
                <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</Link>
                <Link to="/faq" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">FAQs</Link>
                <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</Link>
              </nav>

              {/* Desktop CTA Buttons - Show on desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851] hover:border-[#1da851] px-3 text-sm"
                  >
                    WhatsApp Us
                  </Button>
                </a>
                <Button 
                  size="sm"
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
                    <Menu className="h-12 w-12" />
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
                        to="/what-is-covered" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-xl py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        What's Covered
                      </Link>
                      <Link 
                        to="/make-a-claim" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-xl py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Make a Claim
                      </Link>
                      <Link 
                        to="/faq" 
                        className="text-orange-500 hover:text-orange-600 font-medium text-xl py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                         FAQs
                      </Link>
                      <Link 
                        to="/contact-us" 
                        className="text-gray-700 hover:text-gray-900 font-medium text-xl py-3 border-b border-gray-200 min-h-[48px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact Us
                      </Link>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="space-y-4 pt-6 mt-auto">
                      <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer" className="block">
                        <Button 
                          variant="outline" 
                          className="w-full bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851] hover:border-[#1da851] text-xl py-4 min-h-[48px]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          WhatsApp Us
                        </Button>
                      </a>
                      <Button 
                        className="w-full bg-primary text-white hover:bg-primary/90 text-xl py-4 min-h-[48px]"
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
                        
                        <div className={`overflow-hidden transition-all duration-200 ease-out ${
                          openItems[faq.id] 
                            ? 'max-h-screen opacity-100 animate-accordion-down' 
                            : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-6 pb-5 bg-white border-t border-orange-200">
                            <div className="pt-4 transform translate-y-0">
                              <p className="text-brand-dark-text leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
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