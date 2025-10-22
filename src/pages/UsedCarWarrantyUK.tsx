import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomepageAlt from '@/components/HomepageAlt';
import WebsiteFooter from '@/components/WebsiteFooter';

interface VehicleData {
  registration: string;
  make: string;
  model: string;
  year: string;
  fuel: string;
  color: string;
  mileage: string;
}

const UsedCarWarrantyUK = () => {
  const navigate = useNavigate();
  const [, setVehicleData] = useState<VehicleData | null>(null);

  const handleRegistrationSubmit = (data: VehicleData) => {
    setVehicleData(data);
    sessionStorage.setItem('vehicleData', JSON.stringify(data));
    navigate('/warranty-plan/');
  };

  return (
    <div>
      <HomepageAlt onRegistrationSubmit={handleRegistrationSubmit} />
      <WebsiteFooter />
    </div>
  );
};

export default UsedCarWarrantyUK;
