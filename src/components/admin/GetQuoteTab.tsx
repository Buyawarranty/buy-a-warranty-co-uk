import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Mail, MessageCircle, Loader2 } from 'lucide-react';
import MileageSlider from '@/components/MileageSlider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface VehicleData {
  regNumber: string;
  mileage: string;
  make?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  year?: string;
  vehicleType?: string;
}

interface QuoteData {
  vehicleData: VehicleData;
  selectedPlan: string;
  paymentType: string;
  finalPrice: number;
  coverageDetails: string[];
}

export const GetQuoteTab = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [regNumber, setRegNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [sliderMileage, setSliderMileage] = useState(0);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentType, setPaymentType] = useState('monthly');
  const [finalPrice, setFinalPrice] = useState(0);
  const [excessAmount, setExcessAmount] = useState('100');
  const [claimLimit, setClaimLimit] = useState('3000');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const formatRegNumber = (value: string) => {
    return value.replace(/\s/g, '').toUpperCase();
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMileage(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSliderMileage(numValue);
    }
  };

  const handleSliderChange = (value: number) => {
    setSliderMileage(value);
    setMileage(value.toString());
  };

  const handleVehicleLookup = async () => {
    if (!regNumber.trim() || !mileage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both registration number and mileage",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('dvla-vehicle-lookup', {
        body: { registration: regNumber }
      });

      if (error || !data) {
        setVehicleData({
          regNumber: regNumber.toUpperCase(),
          mileage: mileage,
        });
      } else {
        const currentYear = new Date().getFullYear();
        const vehicleYear = parseInt(data.yearOfManufacture || data.year || '0', 10);
        const vehicleAge = currentYear - vehicleYear;

        if (vehicleAge > 15) {
          toast({
            title: "Vehicle Too Old",
            description: `This vehicle is ${vehicleAge} years old. We only cover vehicles up to 15 years old.`,
            variant: "destructive",
          });
          setIsLookingUp(false);
          return;
        }

        setVehicleData({
          regNumber: regNumber.toUpperCase(),
          mileage: mileage,
          make: data.make,
          model: data.model,
          fuelType: data.fuelType,
          transmission: data.transmission,
          year: data.yearOfManufacture || data.year,
          vehicleType: data.vehicleType,
        });
      }
      setStep(2);
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      setVehicleData({
        regNumber: regNumber.toUpperCase(),
        mileage: mileage,
      });
      setStep(2);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCalculateQuote = () => {
    if (!selectedPlan || !customerEmail || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Calculate price based on plan and payment type
    let basePrice = 0;
    switch (selectedPlan) {
      case 'essential':
        basePrice = paymentType === 'monthly' ? 47 : (paymentType === '24months' ? 94 : 141);
        break;
      case 'complete':
        basePrice = paymentType === 'monthly' ? 67 : (paymentType === '24months' ? 134 : 201);
        break;
      case 'premium':
        basePrice = paymentType === 'monthly' ? 87 : (paymentType === '24months' ? 174 : 261);
        break;
    }

    setFinalPrice(basePrice);
    setStep(3);
  };

  const generateEmailContent = (): { subject: string; content: string } => {
    const planNames = {
      essential: 'Essential Cover',
      complete: 'Full EV Warranty Cover',
      premium: 'Premium Cover'
    };

    const paymentLabels = {
      monthly: '1 Year Cover',
      '24months': '2 Year Cover',
      '36months': '3 Year Cover'
    };

    const paymentMonths = {
      monthly: 12,
      '24months': 24,
      '36months': 36
    };

    const standardCoverage = [
      'Engine & Internal Components',
      'Gearbox / Transmission Systems',
      'Drivetrain & Clutch Assemblies',
      'Turbocharger & Supercharger Units',
      'Fuel Delivery Systems',
      'Cooling & Heating Systems',
      'Exhaust & Emissions Systems',
      'Braking Systems',
      'Suspension & Steering Systems',
      'Air Conditioning & Climate Control',
      'Electrical & Charging Systems',
      'ECUs & Sensors',
      'Lighting & Ignition Systems',
      'Multimedia & Infotainment',
      'Driver Assistance Systems',
      'Safety Systems',
      'Convertible Power-Hood Components'
    ];

    const evCoverage = [
      'EV Drive Motors & Gearbox',
      'High-Voltage Battery & Charging Ports',
      'Power Control Units & Inverters',
      'Regenerative Braking Systems',
      'Thermal Management & DC-DC Converters',
      'EV Control Electronics & High-Voltage Cables'
    ];

    const subject = `Your Quote for ${vehicleData?.regNumber} – ${planNames[selectedPlan as keyof typeof planNames]}`;
    
    const months = paymentMonths[paymentType as keyof typeof paymentMonths];
    const totalCost = finalPrice * months;

    const content = `Hi ${customerName.split(' ')[0]},

Subject: Your Quote for ${vehicleData?.regNumber} – ${planNames[selectedPlan as keyof typeof planNames]}

It was a pleasure speaking with you earlier.

Here's your personalised quote for your ${vehicleData?.make || ''} ${vehicleData?.model || ''} ${vehicleData?.year ? `(${vehicleData.year})` : ''} – registration ${vehicleData?.regNumber}, with ${parseInt(vehicleData?.mileage || '0').toLocaleString()} miles on the clock.

What's Covered?

Your vehicle is protected across all major systems, including:

${standardCoverage.join(' • ')}

${vehicleData?.fuelType?.toLowerCase().includes('electric') || vehicleData?.fuelType?.toLowerCase().includes('hybrid') ? `
Plus, full EV-specific cover including:

${evCoverage.join(' • ')}
` : ''}

Why Choose Buyawarranty?

✓ Trusted UK warranty provider
✓ Easy claims
✓ Fast payouts
✓ No hidden fees
✓ All parts & labour covered
✓ 0% APR available

Tap here to get protected in 60 seconds – no stress, just peace of mind.
https://buyawarranty.co.uk/

Your Quote:

£${finalPrice}/month for ${paymentLabels[paymentType as keyof typeof paymentLabels]}
Just ${months} easy payments
Total: £${totalCost}
Excess: £${excessAmount}
Claim Limit: £${parseInt(claimLimit).toLocaleString()}

If you have any questions, feel free to call me directly on 0330 229 5040.

Kind regards,

Customer Service & Sales: 0330 229 5040
Claimsline: 0330 229 5045
www.buyawarranty.co.uk
info@buyawarranty.co.uk`;

    return { subject, content };
  };

  const handlePreviewEmail = () => {
    const { subject, content } = generateEmailContent();
    setEmailSubject(subject);
    setEmailContent(content);
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-admin-quote', {
        body: {
          to: customerEmail,
          subject: emailSubject,
          content: emailContent,
          vehicleData,
          quoteDetails: {
            plan: selectedPlan,
            paymentType,
            price: finalPrice,
            excessAmount,
            claimLimit
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Quote email sent successfully to ${customerEmail}`,
      });
      setShowEmailDialog(false);
      // Reset form
      setStep(1);
      setRegNumber('');
      setMileage('');
      setVehicleData(null);
      setCustomerEmail('');
      setCustomerName('');
      setSelectedPlan('');
      setFinalPrice(0);
      setExcessAmount('100');
      setClaimLimit('3000');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const { content } = generateEmailContent();
    const encodedMessage = encodeURIComponent(content);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Get Quote for Customer</h1>
        <p className="text-gray-600 mt-2">Generate and send quotes while on the phone with customers</p>
      </div>

      {/* Step 1: Vehicle Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Vehicle Details</CardTitle>
            <CardDescription>Enter the customer's vehicle registration and mileage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(formatRegNumber(e.target.value))}
                placeholder="e.g. AB12 CDE"
                className="uppercase text-2xl font-bold py-6"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Mileage</Label>
              <Input
                type="text"
                value={mileage}
                onChange={handleMileageChange}
                placeholder="e.g. 45000"
                className="text-lg py-4"
              />
              <MileageSlider
                value={sliderMileage}
                onChange={handleSliderChange}
                min={0}
                max={150000}
              />
            </div>

            <Button 
              onClick={handleVehicleLookup}
              disabled={isLookingUp}
              className="w-full"
              size="lg"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Looking up vehicle...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Quote Details */}
      {step === 2 && vehicleData && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Quote Details</CardTitle>
            <CardDescription>
              Vehicle: {vehicleData.make} {vehicleData.model} ({vehicleData.year}) - {vehicleData.regNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Email</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Plan Type</Label>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="essential" id="essential" />
                  <Label htmlFor="essential" className="cursor-pointer">Essential Cover</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="complete" id="complete" />
                  <Label htmlFor="complete" className="cursor-pointer">Complete Cover</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="cursor-pointer">Premium Cover</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Payment Type</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">Monthly (12 months)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="24months" id="24months" />
                  <Label htmlFor="24months" className="cursor-pointer">24 Months</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="36months" id="36months" />
                  <Label htmlFor="36months" className="cursor-pointer">36 Months</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Excess Amount (£)</Label>
                <Input
                  type="number"
                  value={excessAmount}
                  onChange={(e) => setExcessAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Claim Limit (£)</Label>
                <Input
                  type="number"
                  value={claimLimit}
                  onChange={(e) => setClaimLimit(e.target.value)}
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleCalculateQuote}
                className="flex-1"
              >
                Calculate Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Send Quote */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Send Quote</CardTitle>
            <CardDescription>
              Quote: £{finalPrice}/month for {customerName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quote Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Vehicle:</strong> {vehicleData?.make} {vehicleData?.model} ({vehicleData?.year})</p>
                <p><strong>Registration:</strong> {vehicleData?.regNumber}</p>
                <p><strong>Mileage:</strong> {parseInt(vehicleData?.mileage || '0').toLocaleString()} miles</p>
                <p><strong>Plan:</strong> {selectedPlan}</p>
                <p><strong>Payment:</strong> {paymentType}</p>
                <p><strong>Price:</strong> £{finalPrice}/month</p>
                <p><strong>Excess:</strong> £{excessAmount}</p>
                <p><strong>Claim Limit:</strong> £{parseInt(claimLimit).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handlePreviewEmail}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Quote
              </Button>
              <Button 
                onClick={generateWhatsAppMessage}
                variant="outline"
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Preview Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review & Send Email</DialogTitle>
            <DialogDescription>
              Review and edit the email before sending to {customerEmail}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Email Content</Label>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={20}
                className="mt-2 font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
