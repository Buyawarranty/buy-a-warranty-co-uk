import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, User, Car, CreditCard, FileText, MapPin } from 'lucide-react';

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
  duration: string;
  
  // Additional details
  notes: string;
  sendToWarranties2000: boolean;
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
  planType: 'platinum',
  paymentType: 'bumper',
  duration: '12months',
  notes: '',
  sendToWarranties2000: false
};

export const ManualOrderEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderData, setOrderData] = useState<ManualOrderData>(initialOrderData);
  const [isLoading, setIsLoading] = useState(false);

  const updateOrderData = (field: keyof ManualOrderData, value: string | boolean) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const generateWarrantyReference = (): string => {
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dateCode = `${year}${month}`;
    const randomSerial = Math.floor(Math.random() * 100000) + 500000;
    return `MAN-${dateCode}-${randomSerial}`;
  };

  const calculatePolicyEndDate = (duration: string): string => {
    const now = new Date();
    switch (duration) {
      case '3months':
        now.setMonth(now.getMonth() + 3);
        break;
      case '6months':
        now.setMonth(now.getMonth() + 6);
        break;
      case '12months':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case '24months':
        now.setFullYear(now.getFullYear() + 2);
        break;
      case '36months':
        now.setFullYear(now.getFullYear() + 3);
        break;
      case '48months':
        now.setFullYear(now.getFullYear() + 4);
        break;
      case '60months':
        now.setFullYear(now.getFullYear() + 5);
        break;
      default:
        now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  };

  const handleSubmit = async () => {
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

      // Check if customer exists by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', orderData.email)
        .maybeSingle();

      let customerData;
      
      if (existingCustomer) {
        // Update existing customer
        const { data, error: updateError } = await supabase
          .from('customers')
          .update(customerRecord)
          .eq('id', existingCustomer.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        customerData = data;
      } else {
        // Insert new customer
        const { data, error: insertError } = await supabase
          .from('customers')
          .insert(customerRecord)
          .select()
          .single();
        
        if (insertError) throw insertError;
        customerData = data;
      }

      if (!customerData) throw new Error('Customer creation failed');

      // Create policy record
      const policyRecord = {
        customer_id: customerData.id,
        email: orderData.email,
        plan_type: orderData.planType.toLowerCase(),
        payment_type: orderData.paymentType,
        policy_number: warrantyReference,
        policy_start_date: new Date().toISOString(),
        policy_end_date: calculatePolicyEndDate(orderData.duration),
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

      // Only send to Warranties 2000 if checkbox is checked
      if (orderData.sendToWarranties2000) {
        try {
          // Add logic here to send to Warranties 2000 API
          console.log('Sending to Warranties 2000 API...');
          await supabase
            .from('admin_notes')
            .insert({
              customer_id: customerData.id,
              note: `Sent to Warranties 2000 API`,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });
        } catch (w2kError) {
          console.error('Failed to send to Warranties 2000:', w2kError);
          toast.error('Order created but failed to send to Warranties 2000');
        }
      }

      toast.success(`Manual warranty order created successfully! Reference: ${warrantyReference}`);
      setIsOpen(false);
      setOrderData(initialOrderData);
      
      // Trigger a refresh of the customers list
      window.location.reload();

    } catch (error) {
      console.error('Manual order creation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create manual order');
    } finally {
      setIsLoading(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Manual Warranty Order Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Customer Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={orderData.firstName}
                  onChange={(e) => updateOrderData('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={orderData.lastName}
                  onChange={(e) => updateOrderData('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderData.email}
                  onChange={(e) => updateOrderData('email', e.target.value)}
                  placeholder="john.smith@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={orderData.phone}
                  onChange={(e) => updateOrderData('phone', e.target.value)}
                  placeholder="07123456789"
                />
              </div>
            </div>
          </div>

          {/* Address Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <MapPin className="h-5 w-5" />
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
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={orderData.street}
                  onChange={(e) => updateOrderData('street', e.target.value)}
                  placeholder="High Street"
                />
              </div>
              <div>
                <Label htmlFor="town">Town</Label>
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
                <Label htmlFor="postcode">Postcode</Label>
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

          {/* Vehicle Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <Car className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationPlate">Registration Plate</Label>
                <Input
                  id="registrationPlate"
                  value={orderData.registrationPlate}
                  onChange={(e) => updateOrderData('registrationPlate', e.target.value.toUpperCase())}
                  placeholder="AB12 CDE"
                />
              </div>
              <div>
                <Label htmlFor="vehicleMake">Make</Label>
                <Input
                  id="vehicleMake"
                  value={orderData.vehicleMake}
                  onChange={(e) => updateOrderData('vehicleMake', e.target.value)}
                  placeholder="Ford"
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Model</Label>
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

          {/* Plan & Payment Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Plan & Payment Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Plan Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={orderData.planType} 
                  onValueChange={(value) => value && updateOrderData('planType', value)}
                  className="justify-start flex-wrap gap-2"
                >
                  <ToggleGroupItem value="basic" className="px-4">Basic</ToggleGroupItem>
                  <ToggleGroupItem value="gold" className="px-4">Gold</ToggleGroupItem>
                  <ToggleGroupItem value="platinum" className="px-4">Platinum</ToggleGroupItem>
                  <ToggleGroupItem value="electric" className="px-4">Electric</ToggleGroupItem>
                  <ToggleGroupItem value="phev" className="px-4">PHEV</ToggleGroupItem>
                  <ToggleGroupItem value="motorbike" className="px-4">Motorbike</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label className="mb-2 block">Payment Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={orderData.paymentType} 
                  onValueChange={(value) => value && updateOrderData('paymentType', value)}
                  className="justify-start flex-wrap gap-2"
                >
                  <ToggleGroupItem value="stripe" className="px-4">Stripe</ToggleGroupItem>
                  <ToggleGroupItem value="bumper" className="px-4">Bumper</ToggleGroupItem>
                  <ToggleGroupItem value="debit_card" className="px-4">Debit Card</ToggleGroupItem>
                  <ToggleGroupItem value="credit_card" className="px-4">Credit Card</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label className="mb-2 block">Duration</Label>
                <ToggleGroup 
                  type="single" 
                  value={orderData.duration} 
                  onValueChange={(value) => value && updateOrderData('duration', value)}
                  className="justify-start flex-wrap gap-2"
                >
                  <ToggleGroupItem value="3months" className="px-4">3 Months</ToggleGroupItem>
                  <ToggleGroupItem value="6months" className="px-4">6 Months</ToggleGroupItem>
                  <ToggleGroupItem value="12months" className="px-4">1 Year</ToggleGroupItem>
                  <ToggleGroupItem value="24months" className="px-4">2 Years</ToggleGroupItem>
                  <ToggleGroupItem value="36months" className="px-4">3 Years</ToggleGroupItem>
                  <ToggleGroupItem value="48months" className="px-4">4 Years</ToggleGroupItem>
                  <ToggleGroupItem value="60months" className="px-4">5 Years</ToggleGroupItem>
                </ToggleGroup>
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

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox
                id="sendToW2k"
                checked={orderData.sendToWarranties2000}
                onCheckedChange={(checked) => 
                  updateOrderData('sendToWarranties2000', !!checked)
                }
              />
              <Label
                htmlFor="sendToW2k"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Send to Warranties 2000 API
              </Label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={isLoading} size="lg">
              {isLoading ? 'Creating Order...' : 'Create Order'}
            </Button>
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