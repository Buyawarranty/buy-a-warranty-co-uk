import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, User, Car, CreditCard, FileText, MapPin, Search, Sparkles } from 'lucide-react';

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
  voluntaryExcess: number;
  claimLimit: number;
  totalAmount: string;
  
  // Add-on packages
  wearTearCover: boolean;
  vehicleRecovery: boolean;
  tyreCover: boolean;
  europeCover: boolean;
  vehicleRental: boolean;
  motFeeCover: boolean;
  transferCover: boolean;
  
  // Additional details
  notes: string;
  sendToWarranties2000: boolean;
  
  // Customer dashboard credentials
  dashboardEmail: string;
  dashboardPassword: string;
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
  voluntaryExcess: 0,
  claimLimit: 1250,
  totalAmount: '',
  wearTearCover: false,
  vehicleRecovery: true,
  tyreCover: false,
  europeCover: false,
  vehicleRental: false,
  motFeeCover: true,
  transferCover: false,
  notes: '',
  sendToWarranties2000: false,
  dashboardEmail: '',
  dashboardPassword: ''
};

const defaultTemplate = `First Name
[Enter first name]
Last Name
[Enter last name]
Email
[Enter email]
Phone
[Enter phone]
Flat Number
[Optional]
Building Name
[Optional]
Building Number
[Optional]
Street
[Enter street address]
Town
[Enter town]
County
[Enter county]
Postcode
[Enter postcode]
Country
United Kingdom
Registration Plate
[Enter registration]
Mileage
[Enter mileage]
Make
[Auto-filled after lookup]
Model
[Auto-filled after lookup]
Year
[Auto-filled after lookup]
Fuel Type
[Auto-filled after lookup]
Transmission
[Auto-filled after lookup]
Plan Type
Platinum
Payment Type
Bumper
Duration
1 Year
Voluntary Excess
£100
Claim Limit
£1,250
Total Amount
[Enter amount]
Wear & Tear Cover
No
Vehicle Recovery
Yes
Tyre Cover
No
Europe Cover
No
Vehicle Rental
No
MOT Test Fee Cover
Yes
Transfer Cover
No
Additional Notes
[Any additional notes]`;

export const ManualOrderEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderData, setOrderData] = useState<ManualOrderData>(initialOrderData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [templateText, setTemplateText] = useState(defaultTemplate);

  const updateOrderData = (field: keyof ManualOrderData, value: string | boolean | number) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const parseTemplate = () => {
    const lines = templateText.split('\n').map(l => l.trim()).filter(l => l);
    const data: Partial<ManualOrderData> = { ...initialOrderData };
    
    // Parse line by line - label followed by value
    for (let i = 0; i < lines.length - 1; i++) {
      const label = lines[i].toLowerCase();
      const value = lines[i + 1];
      
      // Skip if value is a label itself or placeholder
      if (value.startsWith('[') || value.toLowerCase().includes('enter') && value.includes(']')) {
        continue;
      }
      
      // Customer details
      if (label === 'first name') {
        data.firstName = value;
      } else if (label === 'last name') {
        data.lastName = value;
      } else if (label === 'email') {
        data.email = value.toLowerCase();
        data.dashboardEmail = value.toLowerCase();
      } else if (label === 'phone') {
        data.phone = value.replace(/\s+/g, '');
      }
      
      // Address details
      else if (label === 'flat number') {
        data.flatNumber = value;
      } else if (label === 'building name') {
        data.buildingName = value;
      } else if (label === 'building number') {
        data.buildingNumber = value;
      } else if (label === 'street') {
        data.street = value;
      } else if (label === 'town') {
        data.town = value;
      } else if (label === 'county') {
        data.county = value;
      } else if (label === 'postcode') {
        data.postcode = value.replace(/\s+/g, '').toUpperCase();
      } else if (label === 'country') {
        data.country = value;
      }
      
      // Vehicle details
      else if (label === 'registration plate') {
        data.registrationPlate = value.replace(/\s+/g, '').toUpperCase();
      } else if (label === 'mileage') {
        data.mileage = value.replace(/[^\d]/g, '');
      } else if (label === 'make') {
        data.vehicleMake = value;
      } else if (label === 'model') {
        data.vehicleModel = value;
      } else if (label === 'year') {
        data.vehicleYear = value;
      } else if (label === 'fuel type') {
        data.vehicleFuelType = value;
      } else if (label === 'transmission') {
        data.vehicleTransmission = value;
      }
      
      // Plan details
      else if (label === 'plan type') {
        const planMap: Record<string, string> = {
          'basic': 'basic',
          'gold': 'gold',
          'platinum': 'platinum',
          'electric': 'electric',
          'phev': 'phev',
          'motorbike': 'motorbike'
        };
        data.planType = planMap[value.toLowerCase()] || 'platinum';
      } else if (label === 'payment type') {
        const paymentMap: Record<string, string> = {
          'stripe': 'stripe',
          'bumper': 'bumper',
          'debit card': 'debitCard',
          'credit card': 'creditCard'
        };
        data.paymentType = paymentMap[value.toLowerCase()] || 'bumper';
      } else if (label === 'duration') {
        if (value.includes('3') && value.toLowerCase().includes('month')) {
          data.duration = '3months';
        } else if (value.includes('6') && value.toLowerCase().includes('month')) {
          data.duration = '6months';
        } else if (value.includes('1') && value.toLowerCase().includes('year')) {
          data.duration = '12months';
        } else if (value.includes('2') && value.toLowerCase().includes('year')) {
          data.duration = '24months';
        } else if (value.includes('3') && value.toLowerCase().includes('year')) {
          data.duration = '36months';
        } else if (value.includes('4') && value.toLowerCase().includes('year')) {
          data.duration = '48months';
        } else if (value.includes('5') && value.toLowerCase().includes('year')) {
          data.duration = '60months';
        }
      } else if (label === 'voluntary excess') {
        const amount = parseInt(value.replace(/[£,\s]/g, ''));
        if (!isNaN(amount)) data.voluntaryExcess = amount;
      } else if (label === 'claim limit') {
        const amount = parseInt(value.replace(/[£,\s]/g, ''));
        if (!isNaN(amount)) data.claimLimit = amount;
      } else if (label === 'total amount') {
        data.totalAmount = value.replace(/[£,\s]/g, '');
      }
      
      // Add-ons (parse Yes/No)
      else if (label === 'wear & tear cover' || label === 'wear and tear cover') {
        data.wearTearCover = value.toLowerCase() === 'yes';
      } else if (label === 'vehicle recovery' || label === '24/7 vehicle recovery') {
        data.vehicleRecovery = value.toLowerCase() === 'yes';
      } else if (label === 'tyre cover') {
        data.tyreCover = value.toLowerCase() === 'yes';
      } else if (label === 'europe cover') {
        data.europeCover = value.toLowerCase() === 'yes';
      } else if (label === 'vehicle rental') {
        data.vehicleRental = value.toLowerCase() === 'yes';
      } else if (label === 'mot test fee cover' || label === 'mot fee cover') {
        data.motFeeCover = value.toLowerCase() === 'yes';
      } else if (label === 'transfer cover') {
        data.transferCover = value.toLowerCase() === 'yes';
      }
      
      // Additional notes
      else if (label === 'additional notes') {
        data.notes = value;
      }
    }
    
    setOrderData(prev => ({ ...prev, ...data } as ManualOrderData));
    toast.success('Template parsed successfully! Review and submit the order.');
  };

  const handleVehicleLookup = async () => {
    if (!orderData.registrationPlate.trim()) {
      toast.error('Please enter a registration plate');
      return;
    }

    if (!orderData.mileage.trim()) {
      toast.error('Please select mileage');
      return;
    }

    setIsLookingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registrationNumber: orderData.registrationPlate }
      });

      if (error) throw error;

      if (data?.found) {
        // Auto-populate vehicle fields
        setOrderData(prev => ({
          ...prev,
          vehicleMake: data.make || '',
          vehicleModel: data.model || '',
          vehicleYear: data.yearOfManufacture || '',
          vehicleFuelType: data.fuelType || '',
          vehicleTransmission: data.transmission || ''
        }));
        toast.success('Vehicle details found and populated!');
      } else {
        toast.error('Vehicle not found. Please enter details manually.');
      }
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      toast.error('Failed to lookup vehicle. Please enter details manually.');
    } finally {
      setIsLookingUp(false);
    }
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
        warranty_reference_number: warrantyReference,
        voluntary_excess: orderData.voluntaryExcess,
        claim_limit: orderData.claimLimit
      };

      // Check if customer exists by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', orderData.email)
        .maybeSingle();

      let customerData;
      
      if (existingCustomer) {
        // Update existing customer - explicitly set updated_at to refresh timestamp
        const { data, error: updateError } = await supabase
          .from('customers')
          .update({
            ...customerRecord,
            updated_at: new Date().toISOString()
          })
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
        customer_full_name: customerName,
        voluntary_excess: orderData.voluntaryExcess,
        claim_limit: orderData.claimLimit,
        payment_amount: orderData.totalAmount ? parseFloat(orderData.totalAmount) : null,
        wear_tear: orderData.wearTearCover,
        breakdown_recovery: orderData.vehicleRecovery,
        tyre_cover: orderData.tyreCover,
        europe_cover: orderData.europeCover,
        vehicle_rental: orderData.vehicleRental,
        mot_fee: orderData.motFeeCover,
        transfer_cover: orderData.transferCover
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

      // Create customer dashboard account if credentials provided
      if (orderData.dashboardEmail && orderData.dashboardPassword) {
        try {
          const { data: authResult, error: authError } = await supabase.functions.invoke(
            'create-customer-account',
            {
              body: {
                email: orderData.dashboardEmail,
                password: orderData.dashboardPassword,
                firstName: orderData.firstName,
                lastName: orderData.lastName,
                customerId: customerData.id
              }
            }
          );

          if (authError) throw authError;

          if (authResult?.error) {
            throw new Error(authResult.error);
          }

          toast.success(
            `Dashboard account created!\nEmail: ${orderData.dashboardEmail}\nPassword: ${orderData.dashboardPassword}`,
            { duration: 10000 }
          );
        } catch (authError) {
          console.error('Failed to create dashboard account:', authError);
          toast.error('Order created but failed to create dashboard account');
        }
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

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Entry
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <Alert>
              <AlertDescription>
                Fill in the template below with customer information. Each field label is followed by a line for the value. Simply replace the placeholder text with actual values.
                <div className="mt-2 text-xs space-y-1">
                  <div className="font-semibold">Template format (label on one line, value on next):</div>
                  <div className="font-mono bg-muted p-2 rounded text-xs">
                    First Name<br/>
                    John<br/>
                    Last Name<br/>
                    Smith<br/>
                    Email<br/>
                    john@example.com<br/>
                    ...
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="templateEntry">Edit Template with Customer Information</Label>
              <Textarea
                id="templateEntry"
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={20}
                className="font-mono text-xs"
              />
            </div>

            <Button
              onClick={parseTemplate}
              disabled={!templateText.trim()}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Parse Template & Create Order
            </Button>

            {(orderData.email || orderData.firstName) && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription>
                  ✓ Template parsed! The order will be created with the parsed information.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
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
            
            <Alert>
              <AlertDescription>
                Enter registration and mileage, then click lookup to auto-populate vehicle details.
              </AlertDescription>
            </Alert>

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
                <Label htmlFor="mileage">Mileage</Label>
                <Select 
                  value={orderData.mileage} 
                  onValueChange={(value) => updateOrderData('mileage', value)}
                >
                  <SelectTrigger id="mileage">
                    <SelectValue placeholder="Select mileage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-10000">0 - 10,000 miles</SelectItem>
                    <SelectItem value="10001-20000">10,001 - 20,000 miles</SelectItem>
                    <SelectItem value="20001-30000">20,001 - 30,000 miles</SelectItem>
                    <SelectItem value="30001-40000">30,001 - 40,000 miles</SelectItem>
                    <SelectItem value="40001-50000">40,001 - 50,000 miles</SelectItem>
                    <SelectItem value="50001-60000">50,001 - 60,000 miles</SelectItem>
                    <SelectItem value="60001-70000">60,001 - 70,000 miles</SelectItem>
                    <SelectItem value="70001-80000">70,001 - 80,000 miles</SelectItem>
                    <SelectItem value="80001-90000">80,001 - 90,000 miles</SelectItem>
                    <SelectItem value="90001-100000">90,001 - 100,000 miles</SelectItem>
                    <SelectItem value="100001+">100,001+ miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button 
                  type="button"
                  onClick={handleVehicleLookup}
                  disabled={isLookingUp || !orderData.registrationPlate || !orderData.mileage}
                  className="w-full"
                  variant="outline"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLookingUp ? 'Looking up...' : 'Lookup Vehicle Details'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
              <div>
                <Label htmlFor="vehicleFuelType">Fuel Type</Label>
                <Input
                  id="vehicleFuelType"
                  value={orderData.vehicleFuelType}
                  onChange={(e) => updateOrderData('vehicleFuelType', e.target.value)}
                  placeholder="Petrol"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="vehicleTransmission">Transmission</Label>
                <Input
                  id="vehicleTransmission"
                  value={orderData.vehicleTransmission}
                  onChange={(e) => updateOrderData('vehicleTransmission', e.target.value)}
                  placeholder="Manual"
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
                  <ToggleGroupItem value="basic" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Basic</ToggleGroupItem>
                  <ToggleGroupItem value="gold" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Gold</ToggleGroupItem>
                  <ToggleGroupItem value="platinum" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Platinum</ToggleGroupItem>
                  <ToggleGroupItem value="electric" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Electric</ToggleGroupItem>
                  <ToggleGroupItem value="phev" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">PHEV</ToggleGroupItem>
                  <ToggleGroupItem value="motorbike" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Motorbike</ToggleGroupItem>
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
                  <ToggleGroupItem value="stripe" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Stripe</ToggleGroupItem>
                  <ToggleGroupItem value="bumper" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Bumper</ToggleGroupItem>
                  <ToggleGroupItem value="debit_card" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Debit Card</ToggleGroupItem>
                  <ToggleGroupItem value="credit_card" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Credit Card</ToggleGroupItem>
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
                  <ToggleGroupItem value="3months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">3 Months</ToggleGroupItem>
                  <ToggleGroupItem value="6months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">6 Months</ToggleGroupItem>
                  <ToggleGroupItem value="12months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">1 Year</ToggleGroupItem>
                  <ToggleGroupItem value="24months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">2 Years</ToggleGroupItem>
                  <ToggleGroupItem value="36months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">3 Years</ToggleGroupItem>
                  <ToggleGroupItem value="48months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">4 Years</ToggleGroupItem>
                  <ToggleGroupItem value="60months" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">5 Years</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label className="mb-2 block">Voluntary Excess</Label>
                <ToggleGroup 
                  type="single" 
                  value={orderData.voluntaryExcess.toString()} 
                  onValueChange={(value) => value && updateOrderData('voluntaryExcess', parseInt(value))}
                  className="justify-start flex-wrap gap-2"
                >
                  <ToggleGroupItem value="0" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£0</ToggleGroupItem>
                  <ToggleGroupItem value="50" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£50</ToggleGroupItem>
                  <ToggleGroupItem value="100" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£100</ToggleGroupItem>
                  <ToggleGroupItem value="150" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£150</ToggleGroupItem>
                  <ToggleGroupItem value="200" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£200</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label className="mb-2 block">Claim Limit</Label>
                <ToggleGroup 
                  type="single" 
                  value={orderData.claimLimit.toString()} 
                  onValueChange={(value) => value && updateOrderData('claimLimit', parseInt(value))}
                  className="justify-start flex-wrap gap-2"
                >
                  <ToggleGroupItem value="750" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£750</ToggleGroupItem>
                  <ToggleGroupItem value="1250" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£1,250</ToggleGroupItem>
                  <ToggleGroupItem value="2000" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£2,000</ToggleGroupItem>
                  <ToggleGroupItem value="2500" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£2,500</ToggleGroupItem>
                  <ToggleGroupItem value="3000" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£3,000</ToggleGroupItem>
                  <ToggleGroupItem value="4000" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£4,000</ToggleGroupItem>
                  <ToggleGroupItem value="5000" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">£5,000</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount Paid (£)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={orderData.totalAmount}
                  onChange={(e) => updateOrderData('totalAmount', e.target.value)}
                  placeholder="827.00"
                />
              </div>
            </div>

            {/* Add-On Protection Packages Section */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-base">Add-On Protection Packages</h4>
              <p className="text-sm text-gray-600">Select additional coverage options for this warranty</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="wearTear"
                    checked={orderData.wearTearCover}
                    onCheckedChange={(checked) => updateOrderData('wearTearCover', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="wearTear" className="font-medium cursor-pointer">
                      🔧 Wear & Tear Cover
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Protects against premature failure of components
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <Checkbox
                    id="vehicleRecovery"
                    checked={orderData.vehicleRecovery}
                    onCheckedChange={(checked) => updateOrderData('vehicleRecovery', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="vehicleRecovery" className="font-medium cursor-pointer">
                      🚗 24/7 Vehicle Recovery
                    </Label>
                    <p className="text-xs text-blue-800 mt-0.5 font-medium">
                      Included
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="tyreCover"
                    checked={orderData.tyreCover}
                    onCheckedChange={(checked) => updateOrderData('tyreCover', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="tyreCover" className="font-medium cursor-pointer">
                      🛞 Tyre Cover
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Protection for accidental and puncture damage
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="europeCover"
                    checked={orderData.europeCover}
                    onCheckedChange={(checked) => updateOrderData('europeCover', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="europeCover" className="font-medium cursor-pointer">
                      🌍 Europe Cover
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Full protection while driving across Europe
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="vehicleRental"
                    checked={orderData.vehicleRental}
                    onCheckedChange={(checked) => updateOrderData('vehicleRental', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="vehicleRental" className="font-medium cursor-pointer">
                      🚘 Vehicle Rental
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Replacement vehicle during repairs
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <Checkbox
                    id="motFeeCover"
                    checked={orderData.motFeeCover}
                    onCheckedChange={(checked) => updateOrderData('motFeeCover', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="motFeeCover" className="font-medium cursor-pointer">
                      🛠️ MOT Test Fee Cover
                    </Label>
                    <p className="text-xs text-blue-800 mt-0.5 font-medium">
                      Included
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id="transferCover"
                    checked={orderData.transferCover}
                    onCheckedChange={(checked) => updateOrderData('transferCover', !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="transferCover" className="font-medium cursor-pointer">
                      🔁 Transfer Cover
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Transfer warranty to new owner (£19.99 one-time)
                    </p>
                  </div>
                </div>
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

          {/* Customer Dashboard Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Customer Dashboard Access</h3>
            </div>
            <Alert>
              <AlertDescription>
                Set up dashboard credentials to test customer login before they receive their welcome email.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dashboardEmail">Dashboard Email</Label>
                <Input
                  id="dashboardEmail"
                  type="email"
                  value={orderData.dashboardEmail}
                  onChange={(e) => updateOrderData('dashboardEmail', e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="dashboardPassword">Temporary Password</Label>
                <Input
                  id="dashboardPassword"
                  type="text"
                  value={orderData.dashboardPassword}
                  onChange={(e) => updateOrderData('dashboardPassword', e.target.value)}
                  placeholder="temp-password-123"
                />
              </div>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

};