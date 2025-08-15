import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, User, Car, CreditCard, FileText } from 'lucide-react';

interface ManualOrderData {
  // Customer details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flatNumber: string;
  buildingName: string;
  buildingNumber: string;
  street: string;
  town: string;
  county: string;
  postcode: string;
  country: string;
  
  // Vehicle details
  registrationPlate: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleFuelType: string;
  vehicleTransmission: string;
  mileage: string;
  
  // Plan details
  planType: string;
  paymentType: string;
  
  // Additional details
  notes: string;
}

const initialOrderData: ManualOrderData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  flatNumber: '',
  buildingName: '',
  buildingNumber: '',
  street: '',
  town: '',
  county: '',
  postcode: '',
  country: 'United Kingdom',
  registrationPlate: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleFuelType: '',
  vehicleTransmission: '',
  mileage: '',
  planType: '',
  paymentType: '',
  notes: ''
};

export const ManualOrderEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderData, setOrderData] = useState<ManualOrderData>(initialOrderData);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const updateOrderData = (field: keyof ManualOrderData, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Customer details
        return !!(orderData.firstName && orderData.lastName && orderData.email && orderData.phone);
      case 2: // Address details
        return !!(orderData.street && orderData.town && orderData.postcode);
      case 3: // Vehicle details
        return !!(orderData.registrationPlate && orderData.vehicleMake && orderData.vehicleModel);
      case 4: // Plan details
        return !!(orderData.planType && orderData.paymentType);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields for this step');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateWarrantyReference = (): string => {
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dateCode = `${year}${month}`;
    const randomSerial = Math.floor(Math.random() * 100000) + 500000;
    return `MAN-${dateCode}-${randomSerial}`;
  };

  const calculatePolicyEndDate = (paymentType: string): string => {
    const now = new Date();
    switch (paymentType) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case 'two_yearly':
        now.setFullYear(now.getFullYear() + 2);
        break;
      case 'three_yearly':
        now.setFullYear(now.getFullYear() + 3);
        break;
      default:
        now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const warrantyReference = generateWarrantyReference();
      const customerName = `${orderData.firstName} ${orderData.lastName}`.trim();

      // Create customer record
      const customerRecord = {
        name: customerName,
        email: orderData.email,
        phone: orderData.phone,
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        flat_number: orderData.flatNumber,
        building_name: orderData.buildingName,
        building_number: orderData.buildingNumber,
        street: orderData.street,
        town: orderData.town,
        county: orderData.county,
        postcode: orderData.postcode,
        country: orderData.country,
        plan_type: orderData.planType,
        payment_type: orderData.paymentType,
        stripe_session_id: `manual_${Date.now()}`,
        registration_plate: orderData.registrationPlate,
        vehicle_make: orderData.vehicleMake,
        vehicle_model: orderData.vehicleModel,
        vehicle_year: orderData.vehicleYear,
        vehicle_fuel_type: orderData.vehicleFuelType,
        vehicle_transmission: orderData.vehicleTransmission,
        mileage: orderData.mileage,
        status: 'Active',
        warranty_reference_number: warrantyReference
      };

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert(customerRecord, { onConflict: 'email' })
        .select()
        .maybeSingle();

      if (customerError) throw customerError;
      if (!customerData) throw new Error('Customer creation failed');

      // Create policy record
      const policyRecord = {
        customer_id: customerData.id,
        email: orderData.email,
        plan_type: orderData.planType.toLowerCase(),
        payment_type: orderData.paymentType,
        policy_number: warrantyReference,
        policy_start_date: new Date().toISOString(),
        policy_end_date: calculatePolicyEndDate(orderData.paymentType),
        status: 'active',
        email_sent_status: 'pending',
        customer_full_name: customerName
      };

      const { error: policyError } = await supabase
        .from('customer_policies')
        .insert(policyRecord);

      if (policyError) throw policyError;

      // Add admin note if provided
      if (orderData.notes.trim()) {
        await supabase
          .from('admin_notes')
          .insert({
            customer_id: customerData.id,
            note: `Manual order entry: ${orderData.notes}`,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });
      }

      toast.success(`Manual warranty order created successfully! Reference: ${warrantyReference}`);
      setIsOpen(false);
      setOrderData(initialOrderData);
      setCurrentStep(1);
      
      // Trigger a refresh of the customers list
      window.location.reload();

    } catch (error) {
      console.error('Manual order creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create manual order');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Customer Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={orderData.firstName}
                  onChange={(e) => updateOrderData('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={orderData.lastName}
                  onChange={(e) => updateOrderData('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderData.email}
                  onChange={(e) => updateOrderData('email', e.target.value)}
                  placeholder="john.smith@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={orderData.phone}
                  onChange={(e) => updateOrderData('phone', e.target.value)}
                  placeholder="07123456789"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Address Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flatNumber">Flat Number</Label>
                <Input
                  id="flatNumber"
                  value={orderData.flatNumber}
                  onChange={(e) => updateOrderData('flatNumber', e.target.value)}
                  placeholder="1A"
                />
              </div>
              <div>
                <Label htmlFor="buildingName">Building Name</Label>
                <Input
                  id="buildingName"
                  value={orderData.buildingName}
                  onChange={(e) => updateOrderData('buildingName', e.target.value)}
                  placeholder="Oak Court"
                />
              </div>
              <div>
                <Label htmlFor="buildingNumber">Building Number</Label>
                <Input
                  id="buildingNumber"
                  value={orderData.buildingNumber}
                  onChange={(e) => updateOrderData('buildingNumber', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="street">Street *</Label>
                <Input
                  id="street"
                  value={orderData.street}
                  onChange={(e) => updateOrderData('street', e.target.value)}
                  placeholder="High Street"
                />
              </div>
              <div>
                <Label htmlFor="town">Town *</Label>
                <Input
                  id="town"
                  value={orderData.town}
                  onChange={(e) => updateOrderData('town', e.target.value)}
                  placeholder="London"
                />
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={orderData.county}
                  onChange={(e) => updateOrderData('county', e.target.value)}
                  placeholder="Greater London"
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={orderData.postcode}
                  onChange={(e) => updateOrderData('postcode', e.target.value)}
                  placeholder="SW1A 1AA"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={orderData.country}
                  onChange={(e) => updateOrderData('country', e.target.value)}
                  placeholder="United Kingdom"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationPlate">Registration Plate *</Label>
                <Input
                  id="registrationPlate"
                  value={orderData.registrationPlate}
                  onChange={(e) => updateOrderData('registrationPlate', e.target.value.toUpperCase())}
                  placeholder="AB12 CDE"
                />
              </div>
              <div>
                <Label htmlFor="vehicleMake">Make *</Label>
                <Input
                  id="vehicleMake"
                  value={orderData.vehicleMake}
                  onChange={(e) => updateOrderData('vehicleMake', e.target.value)}
                  placeholder="Ford"
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Model *</Label>
                <Input
                  id="vehicleModel"
                  value={orderData.vehicleModel}
                  onChange={(e) => updateOrderData('vehicleModel', e.target.value)}
                  placeholder="Focus"
                />
              </div>
              <div>
                <Label htmlFor="vehicleYear">Year</Label>
                <Input
                  id="vehicleYear"
                  value={orderData.vehicleYear}
                  onChange={(e) => updateOrderData('vehicleYear', e.target.value)}
                  placeholder="2020"
                />
              </div>
              <div>
                <Label htmlFor="vehicleFuelType">Fuel Type</Label>
                <Select value={orderData.vehicleFuelType} onValueChange={(value) => updateOrderData('vehicleFuelType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleTransmission">Transmission</Label>
                <Select value={orderData.vehicleTransmission} onValueChange={(value) => updateOrderData('vehicleTransmission', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  value={orderData.mileage}
                  onChange={(e) => updateOrderData('mileage', e.target.value)}
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Plan & Payment Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planType">Plan Type *</Label>
                <Select value={orderData.planType} onValueChange={(value) => updateOrderData('planType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="electric">Electric Vehicle</SelectItem>
                    <SelectItem value="phev">PHEV Hybrid</SelectItem>
                    <SelectItem value="motorbike">Motorbike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select value={orderData.paymentType} onValueChange={(value) => updateOrderData('paymentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                    <SelectItem value="24months">24 Months</SelectItem>
                    <SelectItem value="36months">36 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={orderData.notes}
                onChange={(e) => updateOrderData('notes', e.target.value)}
                placeholder="Any additional information about this manual order..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Manual Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Manual Warranty Order Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
                  step === currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : step < currentStep
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Creating Order...' : 'Create Order'}
                </Button>
              )}
            </div>
          </div>

          <Alert>
            <AlertDescription>
              This will create a manual warranty order entry. A warranty reference number starting with "MAN-" will be generated automatically.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};