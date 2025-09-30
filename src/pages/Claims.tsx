import React, { useState } from 'react';
import { Check, Menu, Upload, X, Mail, Phone, Clock, Shield, FileText, User, Wrench, AlertTriangle, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import pandaMechanicFix from '@/assets/panda-mechanic-fix.png';

const Claims = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const navigateToQuoteForm = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('quote-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleReg: '',
    faultDescription: '',
    dateOccurred: '',
    faultDetails: '',
    issueTiming: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // UK phone number validation - accepts various formats
    const phoneRegex = /^(\+44\s?|0)(\d{2}\s?\d{4}\s?\d{4}|\d{3}\s?\d{3}\s?\d{4}|\d{4}\s?\d{6}|\d{5}\s?\d{5})$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Real-time validation for email and phone
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors({
          ...errors,
          email: 'Please enter a valid email address'
        });
      }
    }

    if (name === 'phone' && value) {
      if (!validatePhone(value)) {
        setErrors({
          ...errors,
          phone: 'Please enter a valid UK phone number (e.g., 07123456789 or +44 7123 456789)'
        });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid UK phone number (e.g., 07123456789 or +44 7123 456789)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Please check your information",
        description: "Please correct the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let fileData = null;
      
      if (uploadedFile) {
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
        
        fileData = {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          data: fileBase64
        };
      }

      const claimMessage = `
Claim Details:
Vehicle: ${formData.vehicleReg}
Fault Description: ${formData.faultDescription}
Date Occurred: ${formData.dateOccurred}
Fault Details: ${formData.faultDetails}
Issue Timing: ${formData.issueTiming}
      `.trim();

      const response = await supabase.functions.invoke('submit-claim', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: claimMessage,
          file: fileData
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit claim');
      }

      toast({
        title: "Claim Submitted Successfully",
        description: "Thank you! We'll contact you within 1-2 business days.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleReg: '',
        faultDescription: '',
        dateOccurred: '',
        faultDetails: '',
        issueTiming: ''
      });
      setUploadedFile(null);
      setErrors({});
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or call us at 0330 229 5045.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Make a Claim - Buy a Warranty"
        description="Submit your warranty claim easily. Fast, simple, hassle-free process. We've got you covered!"
        keywords="warranty claim, car warranty claim, vehicle warranty support, customer service"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/make-a-claim" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">Make a Claim</Link>
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
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm py-2 border-b border-gray-200"
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
                      className="w-full bg-orange-500 text-white hover:bg-orange-600 text-lg py-3"
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

      <div className="min-h-screen bg-white">
        {/* Hero Section - UX Optimized with Orange Branding */}
        <section className="bg-white py-16 lg:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Making a Claim
              </h1>
            </div>
            <p className="text-xl lg:text-2xl font-semibold text-orange-600 mb-8">
              Simple, Supportive and Stress Free
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                We know that vehicle issues can be stressful, but making a claim shouldn't be. At 
                <span className="font-semibold text-orange-600"> Buy-A-Warranty</span>, we've made the process clear, quick and customer focused.
              </p>
              <div className="flex justify-center items-center gap-2 text-green-600 font-medium">
                <Zap className="w-5 h-5" />
                <span>Get the help you need without the hassle</span>
                <Zap className="w-5 h-5" />
              </div>
            </div>
            
            {/* Why You're in Safe Hands */}
            <div className="mt-16 mb-12">
              <div className="flex justify-center items-center gap-3 mb-8">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Why You're in Safe Hands</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full group-hover:bg-orange-500 transition-colors duration-300">
                      <Zap className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Quick Response</h3>
                  </div>
                  <p className="text-gray-700">We respond to claims quickly and fairly, with no unnecessary delays</p>
                </div>
                <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full group-hover:bg-orange-500 transition-colors duration-300">
                      <User className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900">UK-Based Team</h3>
                  </div>
                  <p className="text-gray-700">Our UK-based claims team is here to guide you every step of the way</p>
                </div>
                <div className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-full group-hover:bg-orange-500 transition-colors duration-300">
                      <Check className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Simple Process</h3>
                  </div>
                  <p className="text-gray-700">We keep things simple, with no confusing jargon or hidden terms</p>
                </div>
              </div>
            </div>

            {/* What You'll Need */}
            <div className="mb-12">
              <div className="flex justify-center items-center gap-3 mb-8">
                <div className="p-2 bg-orange-100 rounded-full">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">What You'll Need</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-gray-700 font-medium">Your warranty registration number</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-gray-700 font-medium">Vehicle details including make, model and registration</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-gray-700 font-medium">A brief description of the issue</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <Upload className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-gray-700 font-medium">Any supporting documents or garage reports</p>
                </div>
              </div>
            </div>

            {/* How to Start Your Claim */}
            <div className="mb-12">
              <div className="flex justify-center items-center gap-3 mb-8">
                <div className="p-2 bg-green-100 rounded-full">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">How to Start Your Claim</h2>
              </div>
              <p className="text-lg text-gray-700 mb-8 font-medium">Choose your preferred way to contact us:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <a 
                  href="mailto:claims@buyawarranty.co.uk"
                  className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                      <Mail className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">Email Us</h3>
                      <p className="text-sm text-gray-500">Send us your claim details</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-orange-500 group-hover:text-orange-600 transition-colors duration-300">claims@buyawarranty.co.uk</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">We typically respond within 2 hours</p>
                  </div>
                </a>

                <a 
                  href="tel:03302295045"
                  className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                      <Phone className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">Call Us</h3>
                      <p className="text-sm text-gray-500">Speak to our claims team</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-orange-500 group-hover:text-orange-600 transition-colors duration-300">0330 229 5045</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-600 font-medium">Monday to Friday, 9am to 5.30pm</p>
                  </div>
                </a>
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-6 font-medium">Or simply complete the form below:</p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-500 hover:border-orange-600"
                  onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Start Your Claim Now
                </Button>
              </div>
            </div>

            {/* SEO-Friendly Image */}
            <div className="mt-16">
              <div className="flex justify-center">
                <img 
                  src="/car-warranty-uk-claims-petrol-car.png" 
                  alt="Car warranty UK petrol car claims - Volkswagen Golf GTI with buyawarranty branding showing professional UK warranty claims support" 
                  className="w-full max-w-[192px] h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 lg:py-24 px-4 bg-white" id="claim-form">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Form */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Make A Claim
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium text-base">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium text-base">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Your Phone Number (e.g., 07123456789)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="vehicleReg" className="text-gray-700 font-medium text-base">
                      Vehicle Reg/Make/Model
                    </Label>
                    <Input
                      id="vehicleReg"
                      name="vehicleReg"
                      type="text"
                      placeholder="Enter Vehicle Registration"
                      value={formData.vehicleReg}
                      onChange={handleInputChange}
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium text-base">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Tell Us What Happened Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell Us What Happened</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      We're here to help get things sorted quickly. Please share a few details about the issue with your vehicle so we can understand what went wrong and how best to support you.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="faultDescription" className="text-gray-700 font-medium text-base">
                          Fault Description
                        </Label>
                        <Input
                          id="faultDescription"
                          name="faultDescription"
                          type="text"
                          placeholder="Brief description of the issue"
                          value={formData.faultDescription}
                          onChange={handleInputChange}
                          className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="dateOccurred" className="text-gray-700 font-medium text-base">
                          Date the issue occurred
                        </Label>
                        <Input
                          id="dateOccurred"
                          name="dateOccurred"
                          type="date"
                          value={formData.dateOccurred}
                          onChange={handleInputChange}
                          className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="faultDetails" className="text-gray-700 font-medium text-base">
                          Describe the fault in your own words. What's not working as expected?
                        </Label>
                        <Textarea
                          id="faultDetails"
                          name="faultDetails"
                          placeholder="Please provide as much detail as possible about the problem..."
                          value={formData.faultDetails}
                          onChange={handleInputChange}
                          className="mt-2 min-h-[100px] border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="issueTiming" className="text-gray-700 font-medium text-base">
                          Was the issue noticed while driving, after a service, or during a routine check?
                        </Label>
                        <Textarea
                          id="issueTiming"
                          name="issueTiming"
                          placeholder="Tell us when and how you first noticed the problem..."
                          value={formData.issueTiming}
                          onChange={handleInputChange}
                          className="mt-2 min-h-[80px] border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label htmlFor="file-upload" className="text-gray-700 font-medium text-base">
                          Upload Supporting Documents (Optional)
                        </Label>
                        <p className="text-gray-500 text-sm mb-2">
                          You can upload garage reports, photos, or other relevant documents (Max 20MB)
                        </p>
                        
                        {!uploadedFile ? (
                          <div className="mt-2">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PDF, DOC, JPG, PNG up to 20MB
                                </p>
                              </div>
                            </label>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                            />
                          </div>
                        ) : (
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-orange-500">
                                <Upload className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 w-full text-lg font-semibold rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </form>
              </div>
              
              {/* Right Side - Illustration */}
              <div className="flex justify-center">
                <img 
                  src={pandaMechanicFix} 
                  alt="Panda mechanic with tools fixing a car" 
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Repair Process */}
        <section className="py-16 lg:py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-6">
              Repair Process
            </h2>
            <p className="text-gray-600 text-lg text-center mb-12 max-w-3xl mx-auto">
              If something goes wrong, we're here to help - quickly and efficiently. Just follow these simple steps to ensure your claim is processed smoothly:
            </p>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Report the fault to us at <span className="font-semibold text-orange-500">0330 229 5045</span> (Mon-Fri 9am to 5:30pm) or complete the form on this page
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Choose your own VAT-registered garage or use an approved repairer
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Wait for written approval before any repairs begin
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Proceed with the repair (once approved)
                </p>
              </div>
              
              {/* Step 5 */}
              <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  5
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Submit the final invoice and proof of repair
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                If approved, we will pay the repairer directly. In some cases, we will make the pay-out to you after we have made our checks.
              </p>
              
              {/* Payout Time Box */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  We aim to pay out within 90 minutes of final approval
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Repair Limit Explained */}
        <section className="py-16 lg:py-24 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              Your Repair Limit Explained
            </h2>
            <div className="space-y-6 text-lg text-gray-600 max-w-3xl mx-auto">
              <p className="leading-relaxed">
                At Buyawarranty.co.uk, your maximum repair limit is clearly outlined in your warranty email and visible in your online account. If a repair exceeds your limit, you can simply top it up.
              </p>
              <p className="leading-relaxed">
                In our experience at Buy-A-Warranty, this situation is very rare - especially if you've selected a claim limit that suits your vehicle and driving habits.
              </p>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-orange-100 mt-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 justify-center">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Check className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="font-semibold text-xl text-gray-900">
                    We cover what we promise - no hidden surprises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to Start CTA */}
        <section className="py-16 lg:py-24 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Ready To <span className="text-yellow-300">Start</span> Your Claim?
            </h2>
            <Button 
              className="bg-white text-orange-500 hover:bg-gray-100 px-10 py-5 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Claim Now
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Claims;