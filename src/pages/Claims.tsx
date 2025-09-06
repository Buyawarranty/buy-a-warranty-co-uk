import React from 'react';
import { MessageCircle, Mail, Clock } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

const Claims = () => {
  return (
    <>
      <SEOHead
        title="Make a Claim - Buy a Warranty"
        description="Submit your warranty claim easily. Get in touch with our customer service team via email, WhatsApp, or phone for fast claim processing."
        keywords="warranty claim, car warranty claim, vehicle warranty support, customer service"
      />
      
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
                      <span className="text-gray-600"> support@lime-stingray-370762.hostingersite.com</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Claims:</span>
                      <span className="text-gray-600"> claims@lime-stingray-370762.hostingersite.com</span>
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
        
        {/* Additional Claims Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Make a Claim
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                  <p className="text-gray-600">
                    Get in touch via email, WhatsApp, or phone using the contact details above.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Provide Details</h3>
                  <p className="text-gray-600">
                    Share your warranty information and details about the issue you're experiencing.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Get Support</h3>
                  <p className="text-gray-600">
                    Our team will process your claim and guide you through the next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Claims;