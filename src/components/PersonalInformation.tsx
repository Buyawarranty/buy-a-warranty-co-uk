import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInformationProps {
  data: {
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    flat_number: string;
    building_name: string;
    building_number: string;
    street: string;
    town: string;
    county: string;
    country: string;
    postcode: string;
    vehicle_reg: string;
  };
  onChange: (data: Partial<PersonalInformationProps['data']>) => void;
  vehicleData: any;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  data,
  onChange,
  vehicleData
}) => {
  const handleInputChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  const counties = [
    'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire',
    'Cheshire', 'City of London', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon',
    'Dorset', 'Durham', 'East Riding of Yorkshire', 'East Sussex', 'Essex',
    'Gloucestershire', 'Greater London', 'Greater Manchester', 'Hampshire',
    'Herefordshire', 'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire',
    'Leicestershire', 'Lincolnshire', 'Merseyside', 'Norfolk', 'Northamptonshire',
    'Northumberland', 'North Yorkshire', 'Nottinghamshire', 'Oxfordshire',
    'Rutland', 'Shropshire', 'Somerset', 'South Yorkshire', 'Staffordshire',
    'Suffolk', 'Surrey', 'Tyne and Wear', 'Warwickshire', 'West Midlands',
    'West Sussex', 'West Yorkshire', 'Wiltshire', 'Worcestershire'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Personal Information
        </CardTitle>
        <p className="text-sm text-gray-600">
          We'll use this information for your warranty registration and communication.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
              First Name *
            </Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
              Last Name *
            </Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={data.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="flat_number" className="text-sm font-medium text-gray-700">
                Flat Number
              </Label>
              <Input
                id="flat_number"
                value={data.flat_number}
                onChange={(e) => handleInputChange('flat_number', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="building_name" className="text-sm font-medium text-gray-700">
                Building Name
              </Label>
              <Input
                id="building_name"
                value={data.building_name}
                onChange={(e) => handleInputChange('building_name', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="building_number" className="text-sm font-medium text-gray-700">
                Building Number
              </Label>
              <Input
                id="building_number"
                value={data.building_number}
                onChange={(e) => handleInputChange('building_number', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                Street
              </Label>
              <Input
                id="street"
                value={data.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="town" className="text-sm font-medium text-gray-700">
                Town/City *
              </Label>
              <Input
                id="town"
                value={data.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                County *
              </Label>
              <Select value={data.county} onValueChange={(value) => handleInputChange('county', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                Postcode *
              </Label>
              <Input
                id="postcode"
                value={data.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country
            </Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="mt-1"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="vehicle_reg" className="text-sm font-medium text-gray-700">
              Vehicle Registration (Optional)
            </Label>
            <Input
              id="vehicle_reg"
              value={data.vehicle_reg}
              onChange={(e) => handleInputChange('vehicle_reg', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;