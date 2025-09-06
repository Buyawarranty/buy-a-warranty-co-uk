import React, { useState } from 'react';
import { MessageCircle, Mail, Clock, Upload } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Claims = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const response = await supabase.functions.invoke('submit-claim', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
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
        title="Make a Claim - Buy a Warranty"
        description="Submit your warranty claim easily. Get in touch with our customer service team via email, WhatsApp, or phone for fast claim processing."
        keywords="warranty claim, car warranty claim, vehicle warranty support, customer service"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/lovable-uploads/53652a24-3961-4346-bf9d-6588ef727aeb.png" alt="Buy a Warranty" className="h-8 w-auto" />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Warranty Plans</a>
              <a href="/protected" className="text-gray-700 hover:text-gray-900 font-medium">How You're Protected</a>
              <a href="/make-a-claim" className="text-gray-700 hover:text-gray-900 font-medium">Make a Claim</a>
              <a href="/faq" className="text-gray-700 hover:text-gray-900 font-medium">FAQ</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Contact Us</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600"
              >
                WhatsApp Us
              </Button>
              <Button 
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
              >
                Get my quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50">
        {/* Top Section - Get In Touch With Us */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Panda Image */}
              <div className="flex justify-center lg:justify-start">
                <img 
                  src="/lovable-uploads/dd63a384-ee39-4b63-8b4a-0789f2b81de1.png" 
                  alt="Panda on motorcycle mascot" 
                  className="w-full max-w-md h-auto"
                />
              </div>
              
              {/* Contact Information */}
              <div className="space-y-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                  Get In Touch With Us
                </h1>
                
                {/* Email Us Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Mail size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Email Us</h2>
                  </div>
                  <div className="ml-14 space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Customer service:</span>
                      <span className="text-gray-600"> support@buyawarranty.co.uk</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Claims:</span>
                      <span className="text-gray-600"> claims@buyawarranty.co.uk</span>
                    </div>
                  </div>
                </div>
                
                {/* WhatsApp Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <MessageCircle size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Chat With Us On WhatsApp:</h2>
                  </div>
                  <div className="ml-14 space-y-3">
                    <p className="text-gray-600">Quick question? Send us a message on WhatsApp and we'll be right with you.</p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      WhatsApp Us ✓
                    </button>
                  </div>
                </div>
                
                {/* Opening Hours Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Clock size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Opening Hours:</h2>
                  </div>
                  <div className="ml-14">
                    <p className="text-gray-600">Monday – Saturday : 9am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Form Section */}
        <section className="py-16 px-4 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Image and Text */}
              <div className="space-y-6">
                <div>
                  <p className="text-primary text-lg font-medium mb-2">Contact Us</p>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Contact Our <span className="text-primary">Support</span> Team!
                  </h2>
                </div>
                
                <div className="flex justify-center">
                  <img 
                    src="/lovable-uploads/ed51aa4b-5f6d-454b-aa7f-50b001a95926.png" 
                    alt="Panda with car and mechanic" 
                    className="w-full max-w-md h-auto"
                  />
                </div>
              </div>
              
              {/* Right Side - Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  How Can We Help You Today?
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
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
                      <Label htmlFor="phone" className="text-gray-700 font-medium">
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

export default Claims;