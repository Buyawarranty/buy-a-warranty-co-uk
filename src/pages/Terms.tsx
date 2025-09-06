import { CheckCircle, Shield, Clock, Wrench, Car, Zap, Battery, Bike, Phone, Mail, AlertTriangle, X } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Terms & Conditions - Buy A Warranty"
        description="Read our comprehensive terms and conditions for car, van, motorcycle and electric vehicle warranties. Clear, fair and transparent coverage details."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Terms & Conditions
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              For Cars, Vans, and Motorcycles – Petrol, Diesel, Hybrid, PHEV, and Electric
            </p>
            <p className="text-sm text-gray-500">Last updated: September 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">We've got you covered!</h2>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">No fuss. No small print. Just a warranty that works.</span>
            </div>
          </div>

          {/* Section 1: Our Warranty Plans */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. Our Warranty Plans</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Our Warranty Plans offer <strong>mechanical and electrical repair cover</strong> for eligible vehicles, 
              including cars, motorcycles, and vans, whether used for personal or business purposes. 
              It applies to petrol and diesel combustion engines, PHEV / hybrid systems, and electric powertrains.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">Eligibility at plan start:</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Vehicles up to 15 years old
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Vehicles up to 150,000 miles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Plans available for 12, 24, or 36 months (or as per promotional offers)
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">We aim to keep things fair, transparent, and flexible.</span>
            </div>
          </section>

          {/* Section 2: Eligibility */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">2. Eligibility</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              To purchase a warranty, you must:
            </p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Own or have a legal interest in the vehicle
              </li>
            </ul>

            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">If your vehicle is under your legal ownership, you're good to go!</span>
            </div>
          </section>

          {/* Section 3: Cancellation Rights */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">3. Cancellation Rights</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              You can cancel within 14 days of purchase for a full refund (if no repairs have been made). 
              After this period, our standard cancellation policy applies.
            </p>

            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">No pressure - you have time to change your mind.</span>
            </div>
          </section>

          {/* Section 4: Repair Process */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">4. Repair Process</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              If something goes wrong, we're here to help - quickly and efficiently. 
              Just follow these simple steps to ensure your claim is processed smoothly:
            </p>

            <div className="space-y-3 mb-4">
              {[
                "Report the fault to us",
                "Visit VAT-registered garage approved repairer",
                "Wait for written approval before any repairs begin",
                "Proceed with the repair (once approved)",
                "Submit the final invoice and proof of repair"
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-blue-900 font-medium">{step}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 mb-2">
                If approved, we will pay the repairer directly. In some cases, we will make the pay-out to you after we have made our checks.
              </p>
              <p className="text-green-800 font-semibold">
                We aim to pay out within 90 minutes of final approval
              </p>
            </div>

            <div className="flex items-center gap-2 text-green-700 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Quick, simple repair process – we're here to help.</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Your Repair Limit Explained</h3>
              <p className="text-blue-800 mb-2">
                Your maximum repair limit is clearly outlined in your warranty email and in your online account. 
                If a repair goes over your limit, you can simply top it up.
              </p>
              <p className="text-blue-800 mb-2">
                In our experience, that's very rare, especially if you've chosen a claim limit that suits your vehicle and driving habits.
              </p>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">We cover what we promise - no hidden surprises.</span>
              </div>
            </div>
          </section>

          {/* What's Covered Section */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">What's Covered</h2>
            </div>
            
            <p className="text-gray-700 mb-6">
              We cover all factory-fitted mechanical and electrical components - so long as they're in working order when your plan starts.
            </p>

            <p className="text-gray-700 mb-4 font-medium">
              Depending on your vehicle type and the plan you choose, here's what's typically included:
            </p>

            {/* Petrol & Diesel */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Petrol & Diesel Vehicles</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                {[
                  "Engine, gearbox, clutch, drivetrain",
                  "Manual or automatic transmission, turbo/supercharger",
                  "ECUs, sensors, fuel systems, pumps",
                  "Brakes, suspension, steering",
                  "Cooling systems, thermostats, radiators",
                  "Electrical systems, infotainment, multimedia",
                  "Driver assistance (parking sensors, lane assist, ACC)",
                  "Air conditioning, airbags, and safety systems"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hybrid */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Hybrid Vehicles</h3>
              </div>
              <p className="text-gray-600 mb-2">Everything above, plus:</p>
              <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                {[
                  "Hybrid ECUs and electric motors",
                  "Hybrid battery (sudden failure only)",
                  "Power control units and onboard charging modules"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Electric */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Battery className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Electric Vehicles (EVs)</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                {[
                  "EV motors and reduction gear",
                  "Power control units and inverters",
                  "High-voltage battery (sudden failure only)",
                  "Thermal systems and EV-specific electronics",
                  "Charging ports (vehicle side only)"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motorcycles */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Bike className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Motorcycles (Petrol, Hybrid, EV)</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-gray-700">
                {[
                  "Engine, gearbox, drivetrain",
                  "Suspension, brakes, lighting, ignition",
                  "Controls, ECUs, dash cluster",
                  "High-voltage batteries (excluding gradual wear)"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labour */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Wrench className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Labour & Diagnostics</h3>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Labour costs and diagnostic checks are included up to £100 per hour as part of authorised repairs.</span>
              </div>
            </div>

            {/* Optional Add-ons */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-3">Optional Add-ons</h3>
              <p className="text-blue-800 mb-3">Want extra peace of mind? You can boost your cover with these handy add-ons:</p>
              <div className="space-y-2">
                {[
                  "24/7 Breakdown Recovery – Help when you need it most",
                  "Consequential Damage – Cover for knock-on issues",
                  "MOT Failure Cover – Protection if your car doesn't pass",
                  "Tyre Cover – For punctures and damage",
                  "Wear & Tear – For those parts that naturally age over time"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What's Not Covered */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <X className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">What's Not Covered</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              We like to be upfront. Here's what's not included in your plan:
            </p>

            {/* Routine Items */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Routine Items & Consumables</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  "Tyres, brake pads/discs, bulbs, filters, wiper blades",
                  "Oils and fluids (unless part of an approved repair)",
                  "Charging cables and 12V batteries",
                  "Belts, chains, sprockets",
                  "Software updates (unless fixing a covered part)",
                  "EV/hybrid battery wear or degradation"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Types */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Vehicle Types & Conditions Not Covered</h3>
              <div className="grid md:grid-cols-1 gap-2">
                {[
                  "Pre-existing faults",
                  "Vehicles used for hire or reward (e.g. taxis, couriers, food vans)",
                  "High-performance or specialist models (e.g. BMW M, AMG)",
                  "Vehicles worth over £100,000",
                  "Adapted or specialist vehicles (motorhomes, imports, mobile units)"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Exclusions */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Other Exclusions</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  "Cosmetic issues (paintwork, trim, upholstery)",
                  "Routine servicing and maintenance",
                  "Indirect or consequential financial losses"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Important Information */}
          <section className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">What You Need to Know</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              We like to keep things simple and fair. Here's a quick overview of what applies to all our plans:
            </p>

            <div className="space-y-3">
              {[
                "There's a 30-day waiting period if you don't have an active warranty already.",
                "You're covered for repairs up to your chosen claim limit per claim.",
                "Your vehicle should average no more than 2,000 miles per month.",
                "A full service history is required or just get a service done within 30 days of starting your plan.",
                "You can make unlimited repairs, up to the price you paid for the vehicle.",
                "If you change your car, you may be able to transfer for a small fee your plan (if the new vehicle qualifies).",
                "You've got a 14-day cancellation window, as long as no claims have been made.",
                "Please note: we don't cover indirect or consequential financial losses.",
                "The latest terms and conditions document will be emailed upon purchase"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Buyawarranty.co.uk</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900 mb-1">Customer Support</h4>
                <p className="text-blue-800 font-bold">0330 229 5040</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <a href="mailto:support@buyawarranty.co.uk" className="text-blue-600 hover:underline text-sm">
                    support@buyawarranty.co.uk
                  </a>
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Wrench className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-1">Claims Line</h4>
                <p className="text-green-800 font-bold">0330 229 5045</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <a href="mailto:claims@buyawarranty.co.uk" className="text-green-600 hover:underline text-sm">
                    claims@buyawarranty.co.uk
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Terms;
