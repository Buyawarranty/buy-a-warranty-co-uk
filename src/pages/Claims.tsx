import React, { useState } from 'react';
import { Check, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
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
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-6 sm:h-8 w-auto" />
              </Link>
            </div>
            
            {/* Navigation - Hidden on mobile, visible on lg+ */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Warranty Plans</Link>
              <Link to="/what-is-covered" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">What's Covered</Link>
              <Link to="/make-a-claim" className="text-orange-500 hover:text-orange-600 font-medium text-sm xl:text-base">Make a Claim</Link>
              <Link to="/faq" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">FAQs</Link>
              <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 font-medium text-sm xl:text-base">Contact Us</Link>
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
                      to="/" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Warranty Plans
                    </Link>
                    <Link 
                      to="/what-is-covered" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      What's Covered
                    </Link>
                    <Link 
                      to="/make-a-claim" 
                      className="text-orange-500 hover:text-orange-600 font-medium text-lg py-2 border-b border-gray-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Make a Claim
                    </Link>
                    <Link 
                      to="/faq" 
                      className="text-gray-700 hover:text-gray-900 font-medium text-lg py-2 border-b border-gray-200"
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

      <div className="min-h-screen">
        {/* Hero Section - UX Optimized */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Making a Claim – Simple, Supportive and Stress Free
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
              We know that vehicle issues can be stressful, but making a claim shouldn't be. At 
              <span className="font-semibold"> Buy-A-Warranty</span>, we've made the process clear, quick and customer focused, so you can get the help you need without the hassle.
            </p>
            
            {/* Why You're in Safe Hands */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Why You're in Safe Hands</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-gray-700">We respond to claims quickly and fairly, with no unnecessary delays</p>
                </div>
                <div className="flex items-start gap-3 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-gray-700">Our UK-based claims team is here to guide you every step of the way</p>
                </div>
                <div className="flex items-start gap-3 p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-gray-700">We keep things simple, with no confusing jargon or hidden terms</p>
                </div>
              </div>
            </div>

            {/* What You'll Need */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">What You'll Need</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Your warranty registration number</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Vehicle details including make, model and registration</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">A brief description of the issue</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-green-500 flex-shrink-0 mt-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700">Any supporting documents or garage reports</p>
                </div>
              </div>
            </div>

            {/* How to Start Your Claim */}
            <div className="mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">How to Start Your Claim</h2>
              <p className="text-lg text-gray-700 mb-6">You can begin your claim by contacting us:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
                  <p className="font-semibold text-gray-900">Email:</p>
                  <p className="text-orange-500 font-medium">claims@buyawarranty.co.uk</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
                  <p className="font-semibold text-gray-900">Phone:</p>
                  <p className="text-orange-500 font-medium">0330 229 5045</p>
                  <p className="text-sm text-gray-600">(Monday to Friday, 9am to 5.30pm)</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-8">Or simply complete the form below:</p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-lg"
                onClick={() => document.getElementById('claim-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Your Claim Now
              </Button>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 lg:py-24 px-4 bg-gray-50" id="claim-form">
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
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium text-base">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Your Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
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
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
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
                  src="/lovable-uploads/1ea8b848-c473-49fa-a5ab-c5551bbd385d.png" 
                  alt="Panda mascot with mechanic and white car on lift" 
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
                  Report the fault to us at <span className="font-semibold text-orange-500">0330 229 5045</span> (Mon-Fri 9am to 5:30pm) or complete the form below
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
        <section className="py-16 lg:py-24 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              Your Repair Limit Explained
            </h2>
            <div className="space-y-6 text-lg text-gray-600 max-w-3xl mx-auto">
              <p className="leading-relaxed">
                Your maximum repair limit is clearly outlined in your warranty email and in your online account. If a repair goes over your limit, you can simply top it up.
              </p>
              <p className="leading-relaxed">
                In our experience, that's very rare, especially if you've chosen a claim limit that suits your vehicle and driving habits.
              </p>
              <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-orange-500 mt-8">
                <p className="font-semibold text-xl text-gray-900">
                  We cover what we promise - no hidden surprises.
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