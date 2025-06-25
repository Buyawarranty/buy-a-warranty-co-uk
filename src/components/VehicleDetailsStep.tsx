
import React, { useState } from 'react';

interface VehicleDetailsStepProps {
  onNext: (data: { regNumber: string; mileage: string }) => void;
}

const VehicleDetailsStep: React.FC<VehicleDetailsStepProps> = ({ onNext }) => {
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [vehicleFound, setVehicleFound] = useState(false);

  const formatRegNumber = (value: string) => {
    const formatted = value.replace(/\s/g, '').toUpperCase();
    if (formatted.length > 3) {
      return formatted.slice(0, -3) + ' ' + formatted.slice(-3);
    }
    return formatted;
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRegNumber(e.target.value);
    if (formatted.length <= 8) {
      setRegNumber(formatted);
    }
  };

  const handleFindCar = () => {
    if (regNumber) {
      setVehicleFound(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNumber && mileage) {
      onNext({ regNumber, mileage });
    }
  };

  return (
    <section className="bg-[#e8f4fb] py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full mr-4 font-bold">1</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Car</h2>
            <p className="text-sm text-gray-600">Let's start with your vehicle details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reg" className="block font-semibold mb-2 text-gray-700">
            Car registration number <span className="text-blue-500 cursor-pointer text-sm ml-1" title="Enter your vehicle's registration number as shown on your number plate">?</span>
          </label>
          <div 
            className="w-full flex items-center bg-[#ffdb00] text-gray-900 font-semibold text-[20px] px-[20px] py-[12px] rounded-[4px] mb-4 shadow-sm tracking-[2px] leading-tight cursor-pointer"
            onClick={() => document.getElementById('regInput')?.focus()}
          >
            <span className="bg-[#0052cc] text-white text-[10px] font-bold px-[6px] py-[3px] rounded-[3px] mr-[10px]">GB</span>
            <input
              id="regInput"
              type="text"
              value={regNumber || 'AB12 CDE'}
              onChange={handleRegChange}
              className="bg-transparent border-none outline-none font-semibold text-[20px] tracking-[2px] text-gray-900 flex-1"
              maxLength={8}
            />
          </div>
          <button 
            type="button"
            onClick={handleFindCar}
            disabled={!regNumber}
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2e] text-white text-[15px] font-semibold px-[20px] py-[8px] rounded-full transition duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            Find my car
          </button>

          {vehicleFound && (
            <div className="bg-[#f0f9ff] border border-blue-300 rounded-[4px] p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2 font-semibold">We found the following car</p>
              <p className="text-sm text-gray-600">AUDI A3 SE TDI 105 • 3-door • 1598cc • Diesel • Manual (2012–2014)</p>
              <button 
                type="button"
                className="mt-2 text-sm bg-white border border-gray-300 px-[16px] py-[6px] rounded-[4px] hover:bg-gray-100 transition duration-200"
              >
                This is not my car
              </button>
            </div>
          )}

          {vehicleFound && (
            <>
              <label htmlFor="mileage" className="block font-semibold mb-2 text-gray-700">
                What's your approximate mileage? <span className="text-blue-500 cursor-pointer text-sm ml-1" title="Enter your current mileage as shown on your odometer">?</span>
              </label>
              <input
                type="number"
                id="mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 32000"
                className="w-full border border-gray-300 rounded-[4px] px-[16px] py-[12px] mb-2 focus:outline-none focus:border-blue-500"
                max="150000"
              />
              <p className="text-sm text-gray-500 mb-6">We can only provide warranty for vehicles with a maximum mileage of 150,000</p>

              <button 
                type="submit"
                disabled={!regNumber || !mileage || parseInt(mileage) > 150000}
                className="w-full bg-[#ffaf94] hover:bg-[#f98662] text-white text-[15px] font-semibold px-[20px] py-[12px] rounded-[4px] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
