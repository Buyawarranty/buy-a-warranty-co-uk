
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VehicleDetailsStepProps {
  onNext: (data: { regNumber: string; mileage: string; make?: string; model?: string; fuelType?: string; transmission?: string; year?: string; vehicleType?: string }) => void;
  onBack?: () => void;
  onFormDataUpdate?: (data: any) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
  };
}

interface DVLAVehicleData {
  found: boolean;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  yearOfManufacture?: string;
  vehicleType?: string;
  colour?: string;
  engineCapacity?: number;
  motStatus?: string;
  motExpiryDate?: string;
  taxStatus?: string;
  error?: string;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ onNext, initialData }) => {
  const [regNumber, setRegNumber] = useState(initialData?.regNumber || '');
  const [mileage, setMileage] = useState(initialData?.mileage || '');
  const [vehicleFound, setVehicleFound] = useState(false);
  const [mileageError, setMileageError] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [vehicleData, setVehicleData] = useState<DVLAVehicleData | null>(null);
  
  // Manual entry fields
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [year, setYear] = useState('');

  // Set vehicleFound to true if we have initial data
  useEffect(() => {
    if (initialData?.regNumber) {
      setVehicleFound(true);
    }
  }, [initialData]);

  const formatRegNumber = (value: string) => {
    const formatted = value.replace(/\s/g, '').toUpperCase();
    if (formatted.length > 3) {
      return formatted.slice(0, -3) + ' ' + formatted.slice(-3);
    }
    return formatted;
  };

  const formatMileage = (value: string) => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    // Add commas
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) {
      setRegNumber(formatted);
      // Reset vehicle found state when reg number changes
      setVehicleFound(false);
      setVehicleData(null);
      setShowManualEntry(false);
    }
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, ''); // Remove commas for validation
    const numericValue = parseInt(rawValue);
    
    if (rawValue === '') {
      setMileage('');
      setMileageError('');
      return;
    }
    
    if (isNaN(numericValue)) {
      return; // Don't update if not a valid number
    }
    
    if (numericValue > 150000) {
      setMileageError('We can only provide warranty for vehicles with a maximum mileage of 150,000');
      return;
    } else {
      setMileageError('');
    }
    
    const formattedValue = formatMileage(rawValue);
    setMileage(formattedValue);
  };

  const handleFindCar = async () => {
    if (!regNumber) return;
    
    setIsLookingUp(true);
    setVehicleFound(false);
    setVehicleData(null);
    
    try {
      console.log('Looking up vehicle:', regNumber);
      
      const { data, error } = await supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: regNumber }
      });

      if (error) {
        console.error('DVLA lookup error:', error);
        throw error;
      }

      console.log('DVLA lookup result:', data);
      setVehicleData(data);
      
      if (data.found) {
        setVehicleFound(true);
      } else {
        // If vehicle not found, show manual entry
        setShowManualEntry(true);
      }
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      // On error, fall back to manual entry
      setShowManualEntry(true);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleNotMyCar = () => {
    setShowManualEntry(true);
    setVehicleFound(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawMileage = mileage.replace(/,/g, '');
    const numericMileage = parseInt(rawMileage);
    
    // Check if mileage is empty
    if (!mileage.trim()) {
      setMileageError('Please enter approximate mileage');
      return;
    }
    
    if (showManualEntry) {
      // Manual entry validation
      if (regNumber && mileage && make && model && fuelType && transmission && year && numericMileage <= 150000) {
        onNext({ 
          regNumber, 
          mileage: rawMileage,
          make,
          model,
          fuelType,
          transmission,
          year,
          vehicleType: 'standard'
        });
      }
    } else {
      // Auto-detected car validation
      if (regNumber && mileage && numericMileage <= 150000) {
        const submitData: any = { regNumber, mileage: rawMileage };
        
        // Include DVLA data if available
        if (vehicleData?.found) {
          submitData.make = vehicleData.make;
          submitData.model = vehicleData.model;
          submitData.fuelType = vehicleData.fuelType;
          submitData.transmission = vehicleData.transmission;
          submitData.year = vehicleData.yearOfManufacture;
          submitData.vehicleType = vehicleData.vehicleType || 'standard';
        }
        
        onNext(submitData);
      }
    }
  };

  const rawMileage = mileage.replace(/,/g, '');
  const numericMileage = parseInt(rawMileage) || 0;

  const isManualFormValid = regNumber && mileage && make && model && fuelType && transmission && year && numericMileage <= 150000 && mileageError === '';
  const isAutoFormValid = regNumber && mileage && numericMileage <= 150000 && mileageError === '';

  return (
    <section className="bg-[#e8f4fb] py-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 text-left">Let's find your vehicle 🚗 🔍</h2>
            <p className="text-lg text-gray-600 mt-1 text-left">Let's start with your vehicle details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reg" className="block font-semibold mb-2 text-gray-700 text-xl">
            Vehicle registration number
          </label>
          <div 
            className="w-full max-w-[520px] flex items-center bg-[#ffdb00] text-gray-900 font-bold text-[28px] px-[25px] py-[18px] rounded-[6px] mb-3 shadow-sm leading-tight cursor-pointer border-2 border-black"
            onClick={() => document.getElementById('regInput')?.focus()}
          >
            <img 
              src="/lovable-uploads/5fdb1e2d-a10b-4cce-b083-307d56060fc8.png" 
              alt="GB Flag" 
              className="w-[35px] h-[25px] mr-[15px] object-cover rounded-[2px]"
            />
            <input
              id="regInput"
              type="text"
              value={regNumber}
              onChange={handleRegChange}
              placeholder="YOUR REG"
              className="bg-transparent border-none outline-none text-[28px] text-gray-900 flex-1 font-bold font-sans placeholder:tracking-normal tracking-normal"
              maxLength={8}
            />
          </div>
          
          {!showManualEntry && !vehicleFound && (
            <button 
              type="button"
              onClick={handleFindCar}
              disabled={!regNumber || isLookingUp}
              className="w-full max-w-[520px] block text-white text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] mb-4 border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: regNumber && !isLookingUp ? '#eb4b00' : '#eb4b00',
                borderColor: regNumber && !isLookingUp ? '#eb4b00' : '#eb4b00',
                color: 'white',
                opacity: regNumber && !isLookingUp ? 1 : 0.5
              }}
            >
              {isLookingUp ? 'Looking up...' : 'Find my vehicle'}
            </button>
          )}

          {vehicleFound && vehicleData?.found && !showManualEntry && (
            <div style={{ backgroundColor: '#f0f8ff', borderColor: '#224380' }} className="border rounded-[4px] p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2 font-semibold">We found the following vehicle</p>
              <p className="text-sm text-gray-600">
                {vehicleData.make} • {vehicleData.fuelType} • {vehicleData.colour} • {vehicleData.yearOfManufacture}
                {vehicleData.engineCapacity && (
                  <span> • {vehicleData.engineCapacity}cc</span>
                )}
              </p>
              {(vehicleData.motStatus || vehicleData.taxStatus) && (
                <p className="text-xs text-gray-500 mt-1">
                  {vehicleData.motStatus && `MOT: ${vehicleData.motStatus}`}
                  {vehicleData.motStatus && vehicleData.taxStatus && ' • '}
                  {vehicleData.taxStatus && `Tax: ${vehicleData.taxStatus}`}
                </p>
              )}
              {vehicleData.vehicleType && vehicleData.vehicleType !== 'standard' && (
                <p className="text-sm text-blue-600 font-semibold mt-1">
                  Special Vehicle Type: {vehicleData.vehicleType}
                </p>
              )}
              <button 
                type="button"
                onClick={handleNotMyCar}
                className="mt-2 text-sm bg-white border-2 px-[16px] py-[6px] rounded-[6px] transition-all duration-200"
                style={{
                  borderColor: '#224380',
                  color: '#224380'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                This is not my vehicle
              </button>
            </div>
          )}

          {vehicleData && !vehicleData.found && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[4px] p-4 mb-4">
              <p className="text-sm text-yellow-800 mb-2 font-semibold">Vehicle not found</p>
              <p className="text-sm text-yellow-700">
                Oops! We couldn't find that vehicle. Try entering a different or corrected plate.
              </p>
            </div>
          )}

          {showManualEntry && (
            <div className="mb-4 p-4 border-2 border-gray-200 rounded-[6px]">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Enter your vehicle details manually</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Make</label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Audi"
                    className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = '#224380'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. A3"
                    className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = '#224380'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = '#224380'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = '#224380'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  >
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2 text-gray-700">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2020"
                    min="1990"
                    max={new Date().getFullYear()}
                    className="w-full border-2 border-gray-300 rounded-[6px] px-[16px] py-[12px] focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = '#224380'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(vehicleFound || showManualEntry) && (
            <>
              <label htmlFor="mileage" className="block font-semibold mb-2 text-gray-700 text-xl">
                What's your approximate mileage?
              </label>
              <input
                type="text"
                id="mileage"
                value={mileage}
                onChange={handleMileageChange}
                placeholder="e.g. 32,000"
                className={`w-full border-2 rounded-[6px] px-[16px] py-[12px] mb-2 focus:outline-none ${
                  mileageError ? 'border-red-500' : 'border-gray-300'
                }`}
                onFocus={(e) => {
                  if (!mileageError) {
                    e.target.style.borderColor = '#224380';
                  }
                }}
                onBlur={(e) => {
                  if (!mileageError) {
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              />
              {mileageError && (
                <p className="text-sm text-red-500 mb-2">{mileageError}</p>
              )}
              {!mileageError && (
                <p className="text-sm text-black mb-4">We can only provide warranty for vehicles with a maximum mileage of 150,000</p>
              )}

              <button 
                type="submit"
                disabled={showManualEntry ? !isManualFormValid : !isAutoFormValid}
                className="w-full text-white text-[15px] font-bold px-[20px] py-[12px] rounded-[6px] border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-breathing"
                style={{
                  backgroundColor: (showManualEntry ? isManualFormValid : isAutoFormValid) ? '#eb4b00' : '#eb4b00',
                  borderColor: (showManualEntry ? isManualFormValid : isAutoFormValid) ? '#eb4b00' : '#eb4b00',
                  opacity: (showManualEntry ? isManualFormValid : isAutoFormValid) ? 1 : 0.5
                }}
              >
                Get My Quote →
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
};

export default VehicleDetailsStep;
