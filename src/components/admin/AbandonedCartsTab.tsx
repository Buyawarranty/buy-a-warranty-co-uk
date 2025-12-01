import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Mail, 
  Phone, 
  Car, 
  Calendar, 
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Shield,
  Trash2
} from 'lucide-react';

interface AbandonedCart {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  vehicle_data: any;
  step_abandoned: string | null;
  contact_status: string | null;
  contact_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_contacted_at: string | null;
  converted: boolean | null;
  converted_at: string | null;
  cart_metadata?: {
    total_price?: number;
    voluntary_excess?: number;
    claim_limit?: number;
    plan_name?: string;
    payment_type?: string;
    address?: {
      flat_number?: string;
      building_name?: string;
      building_number?: string;
      street?: string;
      town?: string;
      county?: string;
      postcode?: string;
      country?: string;
    };
    protection_addons?: {
      breakdown?: boolean;
      motFee?: boolean;
      motRepair?: boolean;
      wearTear?: boolean;
      tyre?: boolean;
      european?: boolean;
      rental?: boolean;
      transfer?: boolean;
      lostKey?: boolean;
      consequential?: boolean;
    };
  };
}

// Helper functions to extract data from abandoned cart
const getFullName = (cart: AbandonedCart) => {
  if (cart.first_name && cart.last_name) {
    return `${cart.first_name} ${cart.last_name}`;
  }
  return cart.first_name || cart.last_name || null;
};

const getVehicleReg = (cart: AbandonedCart) => cart.vehicle_data?.regNumber || cart.vehicle_data?.registration || null;
const getVehicleMake = (cart: AbandonedCart) => cart.vehicle_data?.make || null;
const getVehicleModel = (cart: AbandonedCart) => cart.vehicle_data?.model || null;
const getVehicleYear = (cart: AbandonedCart) => cart.vehicle_data?.registrationYear || cart.vehicle_data?.year || null;
const getMileage = (cart: AbandonedCart) => cart.vehicle_data?.mileage || null;
const getPlanName = (cart: AbandonedCart) => cart.vehicle_data?.selectedPlan || cart.cart_metadata?.plan_name || null;
const getPaymentType = (cart: AbandonedCart) => cart.vehicle_data?.paymentType || cart.cart_metadata?.payment_type || null;

export const AbandonedCartsTab: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [contactNotes, setContactNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [newCartsCount, setNewCartsCount] = useState(0);

  useEffect(() => {
    fetchAbandonedCarts();
    
    // Set up real-time subscription for new abandoned carts
    const channel = supabase
      .channel('abandoned_carts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'abandoned_carts'
        },
        (payload) => {
          console.log('New abandoned cart:', payload);
          setNewCartsCount(prev => prev + 1);
          toast.info('New abandoned cart detected!', {
            description: `Customer: ${payload.new.email}`,
            duration: 5000
          });
          fetchAbandonedCarts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCarts((data || []) as AbandonedCart[]);
      setNewCartsCount(0);
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (cartId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ 
          contact_status: status,
          last_contacted_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) throw error;

      toast.success('Status updated successfully');
      fetchAbandonedCarts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const saveContactNotes = async () => {
    if (!selectedCart) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ 
          contact_notes: contactNotes,
          last_contacted_at: new Date().toISOString()
        })
        .eq('id', selectedCart.id);

      if (error) throw error;

      toast.success('Notes saved successfully');
      fetchAbandonedCarts();
      setSelectedCart(null);
      setContactNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteCart = async (cartId: string) => {
    if (!confirm('Are you sure you want to delete this abandoned cart? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .delete()
        .eq('id', cartId);

      if (error) throw error;

      toast.success('Abandoned cart deleted successfully');
      fetchAbandonedCarts();
    } catch (error) {
      console.error('Error deleting cart:', error);
      toast.error('Failed to delete cart');
    }
  };

  const sendReminderEmail = async (cart: AbandonedCart) => {
    try {
      const vehicleReg = getVehicleReg(cart);
      const vehicleMake = getVehicleMake(cart);
      const vehicleModel = getVehicleModel(cart);

      const { error } = await supabase.functions.invoke('send-abandoned-cart-email', {
        body: {
          email: cart.email,
          firstName: cart.first_name || 'Customer',
          vehicleReg,
          vehicleMake,
          vehicleModel,
          triggerType: 'pricing_page_view',
          cartId: cart.id
        }
      });

      if (error) throw error;

      // Update contact status
      await updateContactStatus(cart.id, 'contacted');

      toast.success('Reminder email sent successfully');
    } catch (error) {
      console.error('Error sending reminder email:', error);
      toast.error('Failed to send reminder email');
    }
  };

  const filteredCarts = carts.filter(cart => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = getFullName(cart);
    const vehicleReg = getVehicleReg(cart);
    const vehicleMake = getVehicleMake(cart);
    const vehicleModel = getVehicleModel(cart);
    
    return (
      cart.email?.toLowerCase().includes(searchLower) ||
      fullName?.toLowerCase().includes(searchLower) ||
      vehicleReg?.toLowerCase().includes(searchLower) ||
      vehicleMake?.toLowerCase().includes(searchLower) ||
      vehicleModel?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_contacted':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_contacted':
        return <AlertCircle className="w-4 h-4" />;
      case 'contacted':
        return <Clock className="w-4 h-4" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'lost':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading abandoned carts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abandoned Carts</h1>
          <p className="text-gray-600 mt-2">
            Track and follow up with customers who didn't complete their purchase
          </p>
        </div>
        {newCartsCount > 0 && (
          <Badge className="bg-red-500 text-white text-lg px-4 py-2">
            {newCartsCount} New
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Carts</p>
                <p className="text-2xl font-bold">{carts.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Contacted</p>
                <p className="text-2xl font-bold text-red-600">
                  {carts.filter(c => c.contact_status === 'not_contacted').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {carts.filter(c => c.contact_status === 'contacted').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">
                  {carts.filter(c => c.contact_status === 'converted').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by email, name, registration, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchAbandonedCarts} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Carts List */}
      <div className="grid gap-4">
        {filteredCarts.map((cart) => (
          <Card key={cart.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Customer Info */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {getFullName(cart) || 'Anonymous Customer'}
                    </h3>
                    <Badge className={getStatusColor(cart.contact_status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(cart.contact_status)}
                        {cart.contact_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{cart.email}</span>
                    </div>
                    {cart.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{cart.phone}</span>
                      </div>
                    )}
                    {getVehicleReg(cart) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Car className="w-4 h-4" />
                        <span>
                          {getVehicleReg(cart)} - {getVehicleMake(cart)} {getVehicleModel(cart)} ({getVehicleYear(cart)})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(cart.created_at).toLocaleDateString()} at{' '}
                        {new Date(cart.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Plan Info with Pricing */}
                  {getPlanName(cart) && (
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                      <p className="text-sm font-medium">Selected Plan</p>
                      <p className="text-sm text-gray-600">
                        {getPlanName(cart)} - {getPaymentType(cart)} 
                        {getMileage(cart) && ` | ${parseInt(getMileage(cart)).toLocaleString()} miles`}
                      </p>
                      {cart.cart_metadata?.total_price && (
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-green-600">
                            Total Price: £{cart.cart_metadata.total_price.toFixed(2)}
                          </p>
                          {cart.cart_metadata.voluntary_excess && (
                            <p className="text-xs text-gray-600">
                              Voluntary Excess: £{cart.cart_metadata.voluntary_excess}
                            </p>
                          )}
                          {cart.cart_metadata.claim_limit && (
                            <p className="text-xs text-gray-600">
                              Claim Limit: £{cart.cart_metadata.claim_limit.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Abandoned at step {cart.step_abandoned}
                      </p>
                    </div>
                  )}

                  {/* Address Information */}
                  {cart.cart_metadata?.address && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Customer Address
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {[
                          cart.cart_metadata.address.flat_number,
                          cart.cart_metadata.address.building_name,
                          cart.cart_metadata.address.building_number,
                          cart.cart_metadata.address.street,
                          cart.cart_metadata.address.town,
                          cart.cart_metadata.address.county,
                          cart.cart_metadata.address.postcode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Protection Add-ons */}
                  {cart.cart_metadata?.protection_addons && 
                   Object.values(cart.cart_metadata.protection_addons).some(v => v) && (
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Selected Add-ons
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cart.cart_metadata.protection_addons.breakdown && (
                          <Badge variant="secondary" className="text-xs">Breakdown Recovery</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.motFee && (
                          <Badge variant="secondary" className="text-xs">MOT Fee</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.motRepair && (
                          <Badge variant="secondary" className="text-xs">MOT Repair</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.wearTear && (
                          <Badge variant="secondary" className="text-xs">Wear & Tear</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.tyre && (
                          <Badge variant="secondary" className="text-xs">Tyre Cover</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.european && (
                          <Badge variant="secondary" className="text-xs">European Cover</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.rental && (
                          <Badge variant="secondary" className="text-xs">Vehicle Rental</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.transfer && (
                          <Badge variant="secondary" className="text-xs">Transfer Cover</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.lostKey && (
                          <Badge variant="secondary" className="text-xs">Lost Key</Badge>
                        )}
                        {cart.cart_metadata.protection_addons.consequential && (
                          <Badge variant="secondary" className="text-xs">Consequential Loss</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Notes */}
                  {cart.contact_notes && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Contact Notes
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{cart.contact_notes}</p>
                      {cart.last_contacted_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last contacted: {new Date(cart.last_contacted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => sendReminderEmail(cart)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCart(cart);
                      setContactNotes(cart.contact_notes || '');
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                  
                  {cart.contact_status === 'not_contacted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateContactStatus(cart.id, 'contacted')}
                    >
                      Mark Contacted
                    </Button>
                  )}
                  
                  {cart.contact_status === 'contacted' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600"
                        onClick={() => updateContactStatus(cart.id, 'converted')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Converted
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600"
                        onClick={() => updateContactStatus(cart.id, 'lost')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Lost
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => deleteCart(cart.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCarts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No abandoned carts found
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try a different search term' : 'Abandoned carts will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Notes Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add Contact Notes</CardTitle>
              <p className="text-sm text-gray-600">
                {getFullName(selectedCart) || selectedCart.email}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Enter your notes about the contact attempt..."
                rows={6}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCart(null);
                    setContactNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveContactNotes} disabled={savingNotes}>
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
