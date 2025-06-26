import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, User, Mail, Lock, MapPin, CreditCard } from 'lucide-react';

interface CustomerPolicy {
  id: string;
  plan_type: string;
  payment_type: string;
  policy_number: string;
  policy_start_date: string;
  policy_end_date: string;
  status: string;
  address: any;
  pdf_basic_url?: string;
  pdf_gold_url?: string;
  pdf_platinum_url?: string;
}

interface AddressData {
  street: string;
  city: string;
  postcode: string;
  country: string;
}

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<CustomerPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [address, setAddress] = useState<AddressData>({
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPolicy();
  }, [user, navigate]);

  const fetchPolicy = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('customer_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching policy:', error);
        return;
      }

      if (data) {
        setPolicy(data);
        // Properly handle the address JSON data
        if (data.address && typeof data.address === 'object') {
          const addressData = data.address as Record<string, any>;
          setAddress({
            street: addressData.street || '',
            city: addressData.city || '',
            postcode: addressData.postcode || '',
            country: addressData.country || 'United Kingdom'
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async () => {
    if (!policy) return;

    try {
      // Convert AddressData to a plain object that matches Json type
      const addressJson = {
        street: address.street,
        city: address.city,
        postcode: address.postcode,
        country: address.country
      };

      const { error } = await supabase
        .from('customer_policies')
        .update({ 
          address: addressJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', policy.id);

      if (error) throw error;

      toast({
        title: "Address updated",
        description: "Your address has been successfully updated.",
      });
      setEditingAddress(false);
      fetchPolicy();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPolicyPdf = () => {
    if (!policy) return null;
    
    switch (policy.plan_type) {
      case 'basic':
        return policy.pdf_basic_url;
      case 'gold':
        return policy.pdf_gold_url;
      case 'platinum':
        return policy.pdf_platinum_url;
      default:
        return null;
    }
  };

  const getTimeRemaining = () => {
    if (!policy) return '';
    
    const endDate = new Date(policy.policy_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day remaining';
    if (diffDays < 30) return `${diffDays} days remaining`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months remaining`;
    return `${Math.ceil(diffDays / 365)} years remaining`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
                alt="BuyAWarranty" 
                className="h-8 w-auto mr-4"
              />
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!policy ? (
          <Card>
            <CardHeader>
              <CardTitle>No Policy Found</CardTitle>
              <CardDescription>
                We couldn't find any active policies for your account. Please contact support if you believe this is an error.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Policy Overview */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Your Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Policy Number</Label>
                      <p className="font-semibold">{policy.policy_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Plan Type</Label>
                      <p className="font-semibold capitalize">{policy.plan_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Payment Type</Label>
                      <p className="font-semibold">
                        {policy.payment_type === 'twoYear' ? '2 Year' : 
                         policy.payment_type === 'threeYear' ? '3 Year' : 
                         policy.payment_type.charAt(0).toUpperCase() + policy.payment_type.slice(1)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <p className={`font-semibold capitalize ${
                        policy.status === 'active' ? 'text-green-600' : 
                        policy.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {policy.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Time Remaining</Label>
                        <p className="text-lg font-semibold text-blue-600">{getTimeRemaining()}</p>
                      </div>
                      <div className="text-right">
                        <Label className="text-sm font-medium text-gray-500">Expires On</Label>
                        <p className="font-semibold">
                          {new Date(policy.policy_end_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {getPolicyPdf() && (
                    <div className="pt-4 border-t">
                      <Button asChild className="w-full">
                        <a href={getPolicyPdf()} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" />
                          Download Policy Document
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Address Details
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingAddress(!editingAddress)}
                    >
                      {editingAddress ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingAddress ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input
                            id="postcode"
                            value={address.postcode}
                            onChange={(e) => setAddress({...address, postcode: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button onClick={updateAddress} className="w-full">
                        Update Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>{address.street || 'No street address provided'}</p>
                      <p>{address.city} {address.postcode}</p>
                      <p>{address.country}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Management Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setEditingPassword(!editingPassword)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {editingPassword && (
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={updatePassword} className="w-full">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Renewal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Your policy will automatically renew unless cancelled.
                  </p>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
