import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface VehicleWidgetProps {
  redirectUrl?: string;
  className?: string;
}

export function VehicleWidget({ redirectUrl = window.location.origin, className = "" }: VehicleWidgetProps) {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatRegNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) {
      setRegistrationNumber(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Store the registration number in sessionStorage for the main app
      sessionStorage.setItem('widgetRegistration', registrationNumber.replace(/\s/g, ''));
      
      // Redirect to the main application
      window.open(`${redirectUrl}?from=widget`, '_blank');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Registration Number Input */}
        <div className="relative">
          <div className="flex items-center bg-yellow-400 border-2 border-black rounded-lg p-3">
            <img 
              src="/lovable-uploads/081c51be-1add-43a7-b083-4895a3a22de3.png" 
              alt="UK Plate Symbol" 
              className="w-8 h-6 mr-3 rounded-sm"
            />
            <Input
              type="text"
              value={registrationNumber}
              onChange={handleRegChange}
              placeholder="Enter reg plate"
              className="bg-transparent border-none text-lg font-bold text-gray-600 placeholder-gray-500 focus:ring-0 focus:outline-none p-0 !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={8}
            />
          </div>
        </div>

        {/* Find My Vehicle Button */}
        <Button 
          type="submit"
          disabled={!registrationNumber.trim() || isLoading}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 text-lg rounded-lg border-2 border-black disabled:opacity-50"
        >
          {isLoading ? 'Finding...' : 'Find my vehicle'}
        </Button>
      </form>
    </div>
  );
}