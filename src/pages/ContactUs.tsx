import React, { useState } from 'react';
import { MessageCircle, Mail, Clock, Upload, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactUs = () => {
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
    message: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let fileData = null;
      
      if (file) {
        // Convert file to base64
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: fileBase64
        };
      }

      const response = await supabase.functions.invoke('submit-contact', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          file: fileData
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit contact form');
      }

      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us! We'll get back to you within 1-2 business days.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setFile(null);
      
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
        title="Contact Us - Buy a Warranty"
        description="Get in touch with our customer service team via email, WhatsApp, or phone. We're here to help with all your warranty needs."
        keywords="contact us, customer service, warranty support, help, contact"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </a>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Make a Claim</Link>
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
                  <Menu className="h-8 w-8" />
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
                    <a 
                      href="/what-is-covered" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      What's Covered
                    </a>
                    <a 
                      href="/make-a-claim" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </a>
                    <a 
                      href="/faq" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                       FAQs
                    </a>
                    <a 
                      href="/contact-us" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </a>
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
                      className="w-full bg-primary text-white hover:bg-primary/90 text-lg py-3"
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
        {/* Top Section - Get In Touch With Us */}
        <section className="bg-white py-8 sm:py-12 lg:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Panda Image */}
              <div className="flex flex-col items-center lg:items-start order-2 lg:order-1 space-y-4">
                <img 
                  src="/lovable-uploads/dd63a384-ee39-4b63-8b4a-0789f2b81de1.png" 
                  alt="Panda on motorcycle mascot" 
                  className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-auto"
                />
                
                {/* Trustpilot Section */}
                <a 
                  href="https://uk.trustpilot.com/review/buyawarranty.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/lovable-uploads/trustpilot-logo-correct.png" 
                    alt="Trustpilot 5 Star Rating"
                    className="h-16 w-auto"
                  />
                </a>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 text-center lg:text-left">
                  Get In Touch With Us
                </h1>
                
                {/* Customer Sales and Support Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Mail size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Customer Sales and Support</h2>
                  </div>
                  <div className="ml-11 sm:ml-14 space-y-2">
                    <div className="text-sm sm:text-base">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600"> support@buyawarranty.co.uk</span>
                    </div>
                    <div className="text-sm sm:text-base">
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-600"> 0330 229 5040</span>
                    </div>
                  </div>
                </div>
                
                {/* Claims and Repairs Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Mail size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Claims and Repairs</h2>
                  </div>
                  <div className="ml-11 sm:ml-14 space-y-2">
                    <div className="text-sm sm:text-base">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600"> claims@buyawarranty.co.uk</span>
                    </div>
                    <div className="text-sm sm:text-base">
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-600"> 0330 229 5045</span>
                    </div>
                  </div>
                </div>
                
                {/* WhatsApp Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Chat With Us On WhatsApp:</h2>
                  </div>
                  <div className="ml-11 sm:ml-14 space-y-3">
                    <p className="text-gray-600 text-sm sm:text-base">Quick question? Send us a message on WhatsApp and we'll be right with you.</p>
                    <a href="https://wa.me/message/SPQPJ6O3UBF5B1" target="_blank" rel="noopener noreferrer">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base">
                        WhatsApp Us ✓
                      </button>
                    </a>
                  </div>
                </div>
                
                {/* Opening Hours Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Clock size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Opening Hours:</h2>
                  </div>
                  <div className="ml-11 sm:ml-14">
                    <p className="text-gray-600 text-sm sm:text-base">Monday – Saturday : 9am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Form Section */}
        <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Side - Image and Text */}
              <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                <div className="text-center lg:text-left">
                  <p className="text-primary text-base sm:text-lg font-medium mb-2">Contact Us</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Get in Touch With Our <span className="text-primary">Support</span> Team!
                  </h2>
                </div>
                
                <div className="flex justify-center">
                  <img 
                    src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                    alt="Panda with car and mechanic" 
                    className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-auto"
                  />
                </div>
              </div>
              
              {/* Right Side - Form */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 order-1 lg:order-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center lg:text-left">
                  How Can We Help You Today?
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium text-sm sm:text-base">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Email and Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium text-sm sm:text-base">
                        Phone Number (optional)
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Telephone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="file" className="text-gray-700 font-medium">
                      File Upload
                    </Label>
                    <div className="mt-1 flex items-center gap-3">
                      <Label
                        htmlFor="file-upload"
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Choose a file
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="text-gray-500 text-sm">
                        {file ? file.name : "No file chosen."}
                      </span>
                    </div>
                  </div>
                  
                  {/* Message Field */}
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How Can We Help You?"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactUs;