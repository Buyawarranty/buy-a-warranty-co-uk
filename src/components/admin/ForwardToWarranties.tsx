import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, Truck } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  street?: string;
  town?: string;
  county?: string;
  postcode?: string;
  registration_plate: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_fuel_type?: string;
  vehicle_transmission?: string;
  mileage?: string;
  plan_type: string;
  payment_type?: string;
  final_amount?: number;
}

interface ForwardToWarrantiesProps {
  customer: Customer;
}

export const ForwardToWarranties: React.FC<ForwardToWarrantiesProps> = ({ customer }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const forwardToWarranties = async () => {
    setLoading(true);
    
    try {
      console.log('Forwarding customer to Warranties 2000:', customer.email);
      
      const { data, error } = await supabase.functions.invoke('manual-bumper-completion', {
        body: { email: customer.email }
      });

      if (error) {
        console.error('Error forwarding to Warranties 2000:', error);
        toast.error(`Failed to forward order: ${error.message}`);
        return;
      }

      console.log('Forward response:', data);
      toast.success('Order successfully forwarded to Warranties 2000!');
      setOpen(false);
      
    } catch (error) {
      console.error('Error forwarding order:', error);
      toast.error('Failed to forward order to Warranties 2000');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    const parts = [customer.street, customer.town, customer.county, customer.postcode];
    return parts.filter(Boolean).join(', ') || 'N/A';
  };

  const formatVehicleDetails = () => {
    const parts = [customer.vehicle_make, customer.vehicle_model, customer.vehicle_year];
    return parts.filter(Boolean).join(' ') || 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Forward to Warranties 2000
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Forward Order to Warranties 2000
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Order Summary</h4>
            <div className="text-sm text-yellow-700">
              This will send the customer's order information to Warranties 2000 API and trigger a welcome email.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Customer Details</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Name:</span> {customer.name}</div>
                <div><span className="font-medium">Email:</span> {customer.email}</div>
                <div><span className="font-medium">Phone:</span> {customer.phone || 'N/A'}</div>
                <div><span className="font-medium">Address:</span> {formatAddress()}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Vehicle & Plan Details</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Registration:</span> {customer.registration_plate}</div>
                <div><span className="font-medium">Vehicle:</span> {formatVehicleDetails()}</div>
                <div><span className="font-medium">Mileage:</span> {customer.mileage || 'N/A'}</div>
                <div><span className="font-medium">Plan:</span> <Badge variant="secondary">{customer.plan_type}</Badge></div>
                <div><span className="font-medium">Payment Type:</span> <Badge variant="outline">{customer.payment_type || 'N/A'}</Badge></div>
                {customer.final_amount && (
                  <div><span className="font-medium">Amount:</span> £{customer.final_amount}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={forwardToWarranties} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Forward Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};