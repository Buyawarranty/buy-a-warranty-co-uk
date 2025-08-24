import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Badge } from '../ui/badge';
import { Car, Shield, TrendingUp } from 'lucide-react';

interface VehicleDetailsStepBProps {
  onNext: (data: {
    regNumber: string;
    mileage: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
    isManualEntry?: boolean;
  }) => void;
  onBack?: () => void;
  onFormDataUpdate?: (data: any) => void;
  initialData?: {
    regNumber: string;
    mileage: string;
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    year?: string;
  };
  currentStep: number;
  onStepChange: (step: number) => void;
}

const VehicleDetailsStepB: React.FC<VehicleDetailsStepBProps> = ({
  onNext,
  onBack,
  onFormDataUpdate,
  initialData,
  currentStep,
  onStepChange
}) => {
  const [regNumber, setRegNumber] = useState(initialData?.regNumber || '');
  const [mileage, setMileage] = useState(initialData?.mileage || '');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const { toast } = useToast();

  // Manual entry fields
  const [make, setMake] = useState(initialData?.make || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [year, setYear] = useState(initialData?.year || '');
  const [fuelType, setFuelType] = useState(initialData?.fuelType || '');
  const [transmission, setTransmission] = useState(initialData?.transmission || '');

  const handleLookup = async () => {
    if (!regNumber.trim()) {
      toast({
        title: "Registration Required",
        description: "Please enter your vehicle registration number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/dvla-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: regNumber.toUpperCase() }),
      });

      if (response.ok) {
        const data = await response.json();
        setVehicleData(data);
        toast({
          title: "Vehicle Found",
          description: `${data.make} ${data.model} (${data.year})`,
        });
      } else {
        setIsManualEntry(true);
        toast({
          title: "Vehicle Not Found",
          description: "Please enter your vehicle details manually",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsManualEntry(true);
      toast({
        title: "Lookup Failed",
        description: "Please enter your vehicle details manually",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (!regNumber.trim() || !mileage.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isManualEntry && (!make.trim() || !model.trim() || !year.trim())) {
      toast({
        title: "Vehicle Details Required",
        description: "Please enter your vehicle make, model, and year",
        variant: "destructive",
      });
      return;
    }

    const data = {
      regNumber: regNumber.toUpperCase(),
      mileage,
      make: vehicleData?.make || make,
      model: vehicleData?.model || model,
      fuelType: vehicleData?.fuelType || fuelType,
      transmission: vehicleData?.transmission || transmission,
      year: vehicleData?.year || year,
      isManualEntry
    };

    onFormDataUpdate?.(data);
    onNext(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Hero Section - Variant B Design */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center space-x-2 mb-4">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Instant Quote
          </Badge>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Best Prices
          </Badge>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Get Your Car Warranty Quote
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Enter your vehicle details below and get an instant warranty quote in under 2 minutes
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Vehicle Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regNumber" className="text-sm font-medium text-gray-700">
                Registration Number *
              </Label>
              <Input
                id="regNumber"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g., AB12 CDE"
                className="text-lg font-mono tracking-wider border-2 focus:border-blue-500 rounded-xl"
                maxLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mileage" className="text-sm font-medium text-gray-700">
                Current Mileage *
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 45000"
                className="text-lg border-2 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={handleLookup}
              disabled={isLoading || !regNumber.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? "Looking up..." : "Find My Vehicle"}
            </Button>
          </div>

          {/* Vehicle Data Display or Manual Entry */}
          {vehicleData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-2">Vehicle Found!</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Make:</span> {vehicleData.make}</div>
                <div><span className="font-medium">Model:</span> {vehicleData.model}</div>
                <div><span className="font-medium">Year:</span> {vehicleData.year}</div>
                <div><span className="font-medium">Fuel:</span> {vehicleData.fuelType}</div>
              </div>
            </div>
          )}

          {isManualEntry && (
            <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-semibold text-amber-800">Enter Vehicle Details Manually</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g., BMW"
                    className="border-amber-300 focus:border-amber-500"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., 3 Series"
                    className="border-amber-300 focus:border-amber-500"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2020"
                    className="border-amber-300 focus:border-amber-500"
                  />
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Input
                    id="fuelType"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    placeholder="e.g., Petrol"
                    className="border-amber-300 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-2 border-gray-300 hover:border-gray-400 px-6 py-2 rounded-xl"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={!regNumber.trim() || !mileage.trim() || (isManualEntry && (!make.trim() || !model.trim() || !year.trim()))}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg ml-auto"
            >
              Continue to Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailsStepB;