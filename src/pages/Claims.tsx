import React, { useState } from 'react';
import { Menu, Upload, X, Mail, Phone } from 'lucide-react';
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
import MileageSlider from '@/components/MileageSlider';

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
    issueTiming: '',
    currentMileage: 50000
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 20MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, JPG, or PNG file.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
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
Current Mileage: ${formData.currentMileage}
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
          vehicleReg: formData.vehicleReg,
          currentMileage: formData.currentMileage,
          faultDescription: formData.faultDescription,
          dateOccurred: formData.dateOccurred,
          faultDetails: formData.faultDetails,
          issueTiming: formData.issueTiming,
          file: fileData
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit claim');
      }

      toast({
        title: "✓ Claim Submitted Successfully",
        description: "Thank you! We'll contact you within 1-2 business days.",
        className: "bg-green-500 text-white border-green-600",
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
        issueTiming: '',
        currentMileage: 50000
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
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Making a Claim
            </h1>
            <p className="text-xl lg:text-2xl font-semibold text-orange-600 mb-8">
              Simple, Supportive and Stress Free
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                We know that vehicle issues can be stressful, but making a claim shouldn't be. At 
                <span className="font-semibold text-orange-600"> Buy-A-Warranty</span>, we've made the process clear, quick and customer focused.
              </p>
              <p className="text-green-600 font-medium">
                Get the help you need without the hassle
              </p>
            </div>
            
            {/* Why You're in Safe Hands */}
            <div className="mt-16 mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Why You're in Safe Hands</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Response</h3>
                  <p className="text-sm text-gray-700">We respond to claims quickly and fairly, with no unnecessary delays</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">UK-Based Team</h3>
                  <p className="text-sm text-gray-700">Our UK-based claims team is here to guide you every step of the way</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Simple Process</h3>
                  <p className="text-sm text-gray-700">We keep things simple, with no confusing jargon or hidden terms</p>
                </div>
              </div>
            </div>

            {/* What You'll Need */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">What You'll Need</h2>
              <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100">
                <ul className="space-y-4 text-left text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span className="font-medium">Your warranty registration number</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span className="font-medium">Vehicle details including make, model and registration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span className="font-medium">A brief description of the issue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold mt-1">•</span>
                    <span className="font-medium">Any supporting documents or garage reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How to Start Your Claim */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">How to Start Your Claim</h2>
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
                  <p className="text-sm text-green-600 font-medium mt-3">We typically respond within 2 hours</p>
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
                  <p className="text-sm text-green-600 font-medium mt-3">Monday to Friday, 9am to 5.30pm</p>
                </a>
              </div>
            </div>

            {/* Make A Claim Form */}
            <div className="mb-12" id="claim-form">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  Make A Claim
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Fill out the form below and we'll get back to you quickly
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Section - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-6 lg:p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Contact Information - 2 Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium text-sm">
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
                            className={`mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
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
                            className={`mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="07123456789"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        <div>
                          <Label htmlFor="vehicleReg" className="text-gray-700 font-medium text-sm">
                            Vehicle Reg/Make/Model
                          </Label>
                          <Input
                            id="vehicleReg"
                            name="vehicleReg"
                            type="text"
                            placeholder="AB12 CDE"
                            value={formData.vehicleReg}
                            onChange={handleInputChange}
                            className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* Tell Us What Happened Section */}
                      <div className="border-t pt-5 mt-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell Us What Happened</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Share details about the issue so we can help you quickly
                        </p>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="faultDescription" className="text-gray-700 font-medium text-sm">
                                Fault Description
                              </Label>
                              <Input
                                id="faultDescription"
                                name="faultDescription"
                                type="text"
                                placeholder="Brief description"
                                value={formData.faultDescription}
                                onChange={handleInputChange}
                                className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                              />
                            </div>

                            <div>
                              <Label htmlFor="dateOccurred" className="text-gray-700 font-medium text-sm">
                                Date the issue occurred
                              </Label>
                              <Input
                                id="dateOccurred"
                                name="dateOccurred"
                                type="date"
                                value={formData.dateOccurred}
                                onChange={handleInputChange}
                                className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="currentMileage" className="text-gray-700 font-medium text-sm mb-2 block">
                              Enter current mileage
                            </Label>
                            <MileageSlider
                              value={formData.currentMileage}
                              onChange={(value) => setFormData({ ...formData, currentMileage: value })}
                              min={0}
                              max={200000}
                            />
                          </div>

                          <div>
                            <Label htmlFor="faultDetails" className="text-gray-700 font-medium text-sm">
                              Describe the fault - What's not working as expected?
                            </Label>
                            <Textarea
                              id="faultDetails"
                              name="faultDetails"
                              placeholder="Please provide as much detail as possible about the problem..."
                              value={formData.faultDetails}
                              onChange={handleInputChange}
                              className="mt-1.5 min-h-[90px] border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <Label htmlFor="issueTiming" className="text-gray-700 font-medium text-sm">
                              When was the issue noticed?
                            </Label>
                            <Textarea
                              id="issueTiming"
                              name="issueTiming"
                              placeholder="While driving, after a service, during a routine check..."
                              value={formData.issueTiming}
                              onChange={handleInputChange}
                              className="mt-1.5 min-h-[70px] border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>

                          {/* File Upload */}
                          <div>
                            <Label htmlFor="file-upload" className="text-gray-700 font-medium text-sm">
                              Upload Supporting Documents (Optional)
                            </Label>
                            <p className="text-gray-500 text-xs mb-2">
                              Garage reports, photos, or other documents (Max 20MB)
                            </p>
                            
                            {!uploadedFile ? (
                              <div className="mt-1.5">
                                <label htmlFor="file-upload" className="cursor-pointer">
                                  <div 
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                      isDragging 
                                        ? 'border-orange-500 bg-orange-50' 
                                        : 'border-gray-300 hover:border-orange-500'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                  >
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
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
                              <div className="mt-1.5 p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
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
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 w-full text-base font-semibold rounded-lg disabled:opacity-50 transition-colors mt-4"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                      </Button>
                    </form>
                  </div>
                </div>
                
                {/* Right Side - Illustration and Info - Takes 1 column */}
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-start">
                    <img 
                      src={pandaMechanicFix} 
                      alt="Panda mechanic with tools fixing a car" 
                      className="w-full max-w-48 h-auto"
                    />
                  </div>
                  
                  {/* Quick Info Cards */}
                  <div className="space-y-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Fast Response</h4>
                      <p className="text-xs text-gray-600">We typically respond within 2 hours</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">UK-Based Team</h4>
                      <p className="text-xs text-gray-600">Our experts are here to help you</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Simple Process</h4>
                      <p className="text-xs text-gray-600">We keep things clear and straightforward</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO-Friendly Image */}
            <div className="mt-16">
              <div className="flex justify-center">
                <img 
                  src="/car-warranty-uk-claims-petrol-car.png" 
                  alt="Car warranty UK petrol car claims - Volkswagen Golf GTI with buyawarranty branding showing professional UK warranty claims support" 
                  className="w-full max-w-[48px] h-auto"
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
                <p className="text-lg font-semibold text-gray-900">
                  ⏱️ We aim to pay out within 90 minutes of final approval
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
                <p className="font-semibold text-xl text-gray-900">
                  ✓ We cover what we promise - no hidden surprises.
                </p>
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