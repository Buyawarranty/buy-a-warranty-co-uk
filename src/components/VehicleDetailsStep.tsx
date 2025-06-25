
import React, { useState, useEffect } from 'react';

interface VehicleDetailsStepProps {
  onNext: (data: { regNumber: string; mileage: string }) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    email: string;
    phone: string;
  };
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ onNext, initialData }) => {
  const [regNumber, setRegNumber] = useState(initialData?.regNumber || '');
  const [mileage, setMileage] = useState(initialData?.mileage || '');
  const [vehicleFound, setVehicleFound] = useState(false);
  const [mileageError, setMileageError] = useState('');

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

  const handleFindCar = () => {
    if (regNumber) {
      setVehicleFound(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawMileage = mileage.replace(/,/g, '');
    const numericMileage = parseInt(rawMileage);
    
    if (regNumber && mileage && numericMileage <= 150000) {
      onNext({ regNumber, mileage: rawMileage });
    }
  };

  const rawMileage = mileage.replace(/,/g, '');
  const numericMileage = parseInt(rawMileage) || 0;

  return (
    <section className="bg-[#e8f4fb] py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <div 
            className="flex items-center justify-center w-8 h-8 text-white rounded-full mr-4 font-bold"
            style={{ backgroundColor: '#224380' }}
          >
            1
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Your Car</h2>
            <p className="text-sm text-gray-600">Let's start with your vehicle details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reg" className="block font-semibold mb-2 text-gray-700">
            Car registration number <span className="cursor-pointer text-sm ml-1" style={{ color: '#224380' }} title="Enter your vehicle's registration number as shown on your number plate">?</span>
          </label>
          <div 
            className="w-full max-w-[520px] mx-auto flex items-center bg-[#ffdb00] text-gray-900 font-bold text-[28px] px-[25px] py-[18px] rounded-[6px] mb-4 shadow-sm leading-tight cursor-pointer border-2 border-black"
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
          <button 
            type="button"
            onClick={handleFindCar}
            disabled={!regNumber}
            className="text-white text-[15px] font-bold py-[12px] px-[20px] rounded-[6px] mb-6 border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              backgroundColor: regNumber ? '#224380' : '#e5e7eb',
              borderColor: regNumber ? '#224380' : '#d1d5db',
              color: regNumber ? 'white' : '#9ca3af'
            }}
          >
            Find my car
          </button>

          {vehicleFound && (
            <div style={{ backgroundColor: '#f0f8ff', borderColor: '#224380' }} className="border rounded-[4px] p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2 font-semibold">We found the following car</p>
              <p className="text-sm text-gray-600">AUDI A3 SE TDI 105 • 3-door • 1598cc • Diesel • Manual (2012–2014)</p>
              <button 
                type="button"
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
                This is not my car
              </button>
            </div>
          )}

          {vehicleFound && (
            <>
              <label htmlFor="mileage" className="block font-semibold mb-2 text-gray-700">
                What's your approximate mileage? <span className="cursor-pointer text-sm ml-1" style={{ color: '#224380' }} title="Enter your current mileage as shown on your odometer">?</span>
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
                style={{
                  focusBorderColor: mileageError ? '#ef4444' : '#224380'
                }}
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
                <p className="text-sm text-gray-500 mb-6">We can only provide warranty for vehicles with a maximum mileage of 150,000</p>
              )}

              <button 
                type="submit"
                disabled={!regNumber || !mileage || numericMileage > 150000 || mileageError !== ''}
                className="w-full text-white text-[15px] font-bold px-[20px] py-[12px] rounded-[6px] border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: (!regNumber || !mileage || numericMileage > 150000 || mileageError !== '') ? '#e5e7eb' : '#eb4b00',
                  borderColor: (!regNumber || !mileage || numericMileage > 150000 || mileageError !== '') ? '#d1d5db' : '#eb4b00'
                }}
              >
                Continue →
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
};

export default VehicleDetailsStep;
