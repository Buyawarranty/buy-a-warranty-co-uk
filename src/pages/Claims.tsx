import React, { useState } from 'react';
import { Check, Menu } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Claims = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleReg: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await supabase.functions.invoke('submit-claim', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Claim for vehicle: ${formData.vehicleReg}`,
          file: null
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
        vehicleReg: ''
      });
      
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
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </a>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">BUY PROTECTION</a>
              <a href="/protected" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">SERVICE A COMPLAINT</a>
              <a href="/make-a-claim" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">MAKE A CLAIM</a>
              <a href="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQ</a>
              <a href="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">CONTACT US</a>
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
                Get Quote
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
                    <a 
                      href="#" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Warranty Plans
                    </a>
                    <a 
                      href="/protected" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      How You're Protected
                    </a>
                    <a 
                      href="/make-a-claim" 
                      className="text-orange-500 hover:text-orange-600 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </a>
                    <a 
                      href="/faq" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                    <a 
                      href="/contact-us" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </a>
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
                      Get Quote
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-gray-100 py-12 lg:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                  Make A Claim - Fast, Simple, Hassle-Free{' '}
                  <span className="text-orange-500">We've Got You Covered!</span>
                </h1>
                <p className="text-gray-600 text-lg lg:text-xl">
                  Get in touch with our team to start your claim today. Fast and hassle-free!
                </p>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full"
                  onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Your Claim Now
                </Button>
              </div>
              
              {/* Right Side - Car Image */}
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/f2e6fbe6-5875-44f3-8d38-4f2349f95cf4.png" 
                  alt="Panda mascot with various vehicles including cars, van and motorcycle" 
                  className="w-full max-w-lg h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 lg:py-20 px-4 bg-white" id="claim-form">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Form */}
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Make A Claim
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Your Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleReg" className="text-gray-700 font-medium">
                      Vehicle Reg/Make/Model
                    </Label>
                    <Input
                      id="vehicleReg"
                      name="vehicleReg"
                      type="text"
                      placeholder="Vehicle Registration/Make/Model"
                      value={formData.vehicleReg}
                      onChange={handleInputChange}
                      className="mt-1 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 h-12"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 w-full text-lg font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </form>
              </div>
              
              {/* Right Side - Illustration */}
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                  alt="Vehicle service illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Vehicle Diagnosis */}
        <section className="py-12 lg:py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Step 1: Vehicle <span className="text-orange-500">Diagnosis</span>
                </h2>
                <p className="text-gray-600 text-lg">
                  One of our technical experts will conduct a detailed diagnosis to assess the issue
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">We PICK your Car up</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Our EXPERT MECHANIC does a COMPREHENSIVE diagnosis from the car</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">We DROP your vehicle home or at an alternate convenient location</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Illustration */}
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                  alt="Vehicle diagnosis illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Claim Review & Authorisation */}
        <section className="py-12 lg:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Illustration */}
              <div className="flex justify-center order-2 lg:order-1">
                <img 
                  src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                  alt="Claim review illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
              
              {/* Right Side - Content */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Step 2: Claim Review & <span className="text-orange-500">Authorisation</span>
                </h2>
                <p className="text-gray-600 text-lg">
                  We'll review the claim
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Expert Commissioned conducts your CLAIM check</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Once Reviewed and claim is COVERED in your policy, you get</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">FULL REPAIR OR REPLACEMENT AUTHORIZED with our</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">AUTHORISED MECHANICS USING ONLY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">THE BEST PARTS to GET YOU READY! 100% authorised you for your car</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Authorisation & Payment */}
        <section className="py-12 lg:py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Step 3: Authorisation & <span className="text-orange-500">Payment</span>
                </h2>
                <p className="text-gray-600 text-lg">
                  Once approved
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">You'll receive an INSTANT confirmation of your claim</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">We pay your MECHANIC directly so there's no upfront cost for you</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Illustration */}
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                  alt="Payment illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 lg:py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Illustration */}
              <div className="flex justify-center order-2 lg:order-1">
                <img 
                  src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                  alt="Why choose us illustration" 
                  className="w-full max-w-md h-auto"
                />
              </div>
              
              {/* Right Side - Content */}
              <div className="space-y-6 order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Why <span className="text-orange-500">Choose</span> Us?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Quick Response</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">We pick up your vehicle from your place</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">Expert mechanics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">24/7 breakdown cover</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ready To Start Your Claim */}
        <section className="py-12 lg:py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Ready To <span className="text-orange-500">Start</span> Your Claim?
            </h2>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full"
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