import React from 'react';
import { Check, Shield, Clock, Zap } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 md:space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-deep-blue">
            What's <span className="text-brand-orange">Included?</span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl font-bold text-brand-dark-text leading-relaxed">
              Rest assured everything is covered. If it breaks, We'll fix it, No excuses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark-text">Complete Protection</h3>
              <p className="text-brand-dark-text">Comprehensive cover for your engine, mechanical and electrical parts.</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark-text">Instant Claims</h3>
              <p className="text-brand-dark-text">Fast, hassle-free claims process to get you back on the road quickly.</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark-text">Clear Terms</h3>
              <p className="text-brand-dark-text">Simple, transparent conditions that make sense—no hidden surprises.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;