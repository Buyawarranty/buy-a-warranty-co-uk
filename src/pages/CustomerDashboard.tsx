import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, User, Mail, Lock, MapPin, CreditCard, Eye, EyeOff, Phone, MessageSquare, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import TrustpilotHeader from '@/components/TrustpilotHeader';
import { getWarrantyDurationDisplay, getPaymentTypeDisplay } from '@/lib/warrantyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  payment_amount?: number;
  document_url?: string; // Add this for fetched documents
}

interface PolicyDocument {
  id: string;
  plan_type: string;
  document_name: string;
  file_url: string;
  vehicle_type: string;
}

interface AddressData {
  street: string;
  city: string;
  postcode: string;
  country: string;
}

const CustomerDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<CustomerPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<CustomerPolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [address, setAddress] = useState<AddressData>({
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [isFloatingBarVisible, setIsFloatingBarVisible] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log("CustomerDashboard: useEffect triggered");
    console.log("CustomerDashboard: user", user, "loading", loading);
    
    // Don't redirect if still loading auth state
    if (loading) {
      return;
    }
    
    // If user is logged in, fetch their policies
    if (user) {
      fetchPolicies();
    } else {
      // User not logged in, show login form (don't redirect)
      setPolicyLoading(false);
    }
  }, [user, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Use the customer-login edge function instead of direct Supabase auth
      const { data, error } = await supabase.functions.invoke('customer-login', {
        body: {
          email,
          password,
        }
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.user && data?.session) {
        // Set the session in Supabase auth
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        // User state will be updated by the auth listener
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Map plan types to document types
  const mapPlanTypeToDocumentType = (planType: string): string => {
    const mapping: Record<string, string> = {
      'basic': 'basic',
      'Basic': 'basic',
      'gold': 'gold', 
      'Gold': 'gold',
      'platinum': 'platinum',
      'Platinum': 'platinum',
      'phev hybrid extended warranty': 'phev',
      'PHEV Hybrid Extended Warranty': 'phev',
      'electric': 'electric',
      'Electric': 'electric',
      'motorbike': 'motorbike',
      'Motorbike': 'motorbike'
    };
    
    return mapping[planType] || planType.toLowerCase();
  };

  // Fetch documents for policies
  const fetchPolicyDocuments = async (policies: CustomerPolicy[]): Promise<CustomerPolicy[]> => {
    try {
      console.log("Fetching documents for policies");
      
      // Get all unique plan types
      const planTypes = [...new Set(policies.map(p => mapPlanTypeToDocumentType(p.plan_type)))];
      console.log("Plan types to fetch documents for:", planTypes);
      
      // Fetch documents for these plan types
      const { data: documents, error } = await supabase
        .from('customer_documents')
        .select('*')
        .in('plan_type', planTypes)
        .eq('vehicle_type', 'standard');

      if (error) {
        console.error('Error fetching documents:', error);
        return policies;
      }

      console.log("Found documents:", documents);

      // Attach document URLs to policies
      const policiesWithDocuments = policies.map(policy => {
        const documentType = mapPlanTypeToDocumentType(policy.plan_type);
        const document = documents?.find(doc => doc.plan_type === documentType);
        
        return {
          ...policy,
          document_url: document?.file_url || null
        };
      });

      console.log("Policies with documents:", policiesWithDocuments);
      return policiesWithDocuments;
      
    } catch (error) {
      console.error('Error in fetchPolicyDocuments:', error);
      return policies;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsFloatingBarVisible(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPolicies = async () => {
    if (!user) {
      console.log("fetchPolicies: No user available");
      return;
    }
    
    console.log("fetchPolicies: Fetching policies for user:", user.id, "email:", user.email);
    
    try {
      // First try to get policies by user_id, then by email if none found
      let { data, error } = await supabase
        .from('customer_policies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log("fetchPolicies: Query by user_id result:", { data, error, count: data?.length });

      // If no policies found by user_id, try by email
      if ((!data || data.length === 0) && user.email) {
        console.log("fetchPolicies: No policies found by user_id, trying by email");
        const emailResult = await supabase
          .from('customer_policies')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });
        
        data = emailResult.data;
        error = emailResult.error;
        console.log("fetchPolicies: Query by email result:", { data, error, count: data?.length });
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching policies:', error);
        toast({
          title: "Error fetching policies",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        console.log("fetchPolicies: Found policies:", data.length);
        
        // Fetch documents for policies
        const policiesWithDocuments = await fetchPolicyDocuments(data);
        
        setPolicies(policiesWithDocuments);
        setSelectedPolicy(policiesWithDocuments[0]); // Set first policy as selected (latest)
        
        // Set address from the first policy
        const firstPolicy = policiesWithDocuments[0];
        if (firstPolicy.address && typeof firstPolicy.address === 'object') {
          const addressData = firstPolicy.address as Record<string, any>;
          setAddress({
            street: addressData.street || '',
            city: addressData.city || '',
            postcode: addressData.postcode || '',
            country: addressData.country || 'United Kingdom'
          });
        }
      } else {
        console.log("fetchPolicies: No policies found for user");
        setPolicies([]);
        setSelectedPolicy(null);
      }
    } catch (error) {
      console.error('fetchPolicies: Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch policies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPolicyLoading(false);
    }
  };

  const updateAddress = async () => {
    if (!selectedPolicy) return;

    try {
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
        .eq('id', selectedPolicy.id);

      if (error) throw error;

      toast({
        title: "Address updated",
        description: "Your address has been successfully updated.",
      });
      setEditingAddress(false);
      fetchPolicies();
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

  const submitSupportRequest = async () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'support@buyawarranty.co.uk',
          subject: `Support Request: ${supportSubject}`,
          html: `
            <h3>Support Request from Customer</h3>
            <p><strong>Email:</strong> ${user?.email}</p>
            <p><strong>Subject:</strong> ${supportSubject}</p>
            <p><strong>Message:</strong></p>
            <p>${supportMessage.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><em>This message was sent from the customer dashboard.</em></p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Support request sent",
        description: "Your support request has been sent successfully. We'll get back to you soon.",
      });
      
      setShowSupportForm(false);
      setSupportSubject('');
      setSupportMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      toast({
        title: "Loading billing portal...",
        description: "Please wait while we redirect you to the billing portal.",
      });

      const { data, error } = await supabase.functions.invoke('create-billing-portal');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No billing portal URL returned');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      toast({
        title: "Error",
        description: "Unable to access billing portal. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const downloadPolicyDocument = (policy: CustomerPolicy) => {
    const pdfUrl = getPolicyPdf(policy);
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Policy_${policy.policy_number}.pdf`;
      link.click();
      
      toast({
        title: "Download started",
        description: `Downloading policy ${policy.policy_number}`,
      });
    }
  };

  const getPolicyPdf = (policy: CustomerPolicy) => {
    if (!policy) return null;
    
    // Use the fetched document URL first, then fallback to the old fields
    if (policy.document_url) {
      return policy.document_url;
    }
    
    // Fallback to old PDF fields for backward compatibility
    switch (policy.plan_type.toLowerCase()) {
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

  const getTimeRemaining = (policy: CustomerPolicy) => {
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

  if (loading || policyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Customer Dashboard | BuyAWarranty Account Portal"
          description="Access your warranty policies, download documents, manage your account details, and get support for your vehicle warranty coverage."
          keywords="customer dashboard, warranty portal, policy documents, account management, vehicle warranty"
        />
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/lovable-uploads/baw-logo-new-2025.png" 
                    alt="BuyAWarranty" 
                    className="h-6 sm:h-8 w-auto mr-3 sm:mr-4"
                  />
                </button>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Customer Login</h1>
              </div>
              <div className="hidden sm:block">
                <TrustpilotHeader />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your customer dashboard to view your warranty details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loginLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={loginLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loginLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginLoading || !email || !password}
                >
                  {loginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help accessing your account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Get login credentials resent
                  </Button>
                </p>
              </div>

              <div className="mt-4 text-center">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      First time logging in? Use the temporary password from your welcome email.
                    </p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
                alt="BuyAWarranty" 
                className="h-6 sm:h-8 w-auto mr-3 sm:mr-4"
              />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Customer Dashboard</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <TrustpilotHeader />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {policies.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Policies Found</CardTitle>
              <CardDescription>
                We couldn't find any active policies for your account. Please contact support if you believe this is an error.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Debug info: User ID: {user?.id}
              </p>
              <div className="flex gap-4">
                <Button onClick={fetchPolicies} variant="outline">
                  Refresh Policy Data
                </Button>
                <Button onClick={() => setShowSupportForm(true)} variant="default">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="policies">All Policies</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Policy Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Your Active Policy
                        </span>
                        {policies.length > 1 && (
                          <span className="text-sm font-normal text-gray-600">
                            {policies.length} total policies
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedPolicy && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-500">Policy Number</Label>
                              <p className="font-semibold text-sm sm:text-base">{selectedPolicy.policy_number}</p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-500">Plan Type</Label>
                              <p className="font-semibold capitalize text-sm sm:text-base">{selectedPolicy.plan_type}</p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-500">Warranty Duration</Label>
                              <p className="font-semibold text-sm sm:text-base">
                                {getWarrantyDurationDisplay(selectedPolicy.payment_type)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-500">Status</Label>
                              <p className={`font-semibold capitalize text-sm sm:text-base flex items-center gap-2 ${
                                selectedPolicy.status === 'active' ? 'text-green-600' : 
                                selectedPolicy.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {selectedPolicy.status === 'active' && <CheckCircle className="h-4 w-4" />}
                                {selectedPolicy.status === 'expired' && <X className="h-4 w-4" />}
                                {selectedPolicy.status === 'pending' && <AlertCircle className="h-4 w-4" />}
                                {selectedPolicy.status}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <Label className="text-xs sm:text-sm font-medium text-gray-500">Time Remaining</Label>
                                <p className="text-lg font-semibold text-blue-600">{getTimeRemaining(selectedPolicy)}</p>
                              </div>
                              <div className="sm:text-right">
                                <Label className="text-xs sm:text-sm font-medium text-gray-500">Expires On</Label>
                                <p className="font-semibold text-sm sm:text-base">
                                  {new Date(selectedPolicy.policy_end_date).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-4 border-t">
                            <div className="flex flex-wrap gap-3">
                              {getPolicyPdf(selectedPolicy) ? (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    asChild
                                  >
                                    <a href={getPolicyPdf(selectedPolicy)} target="_blank" rel="noopener noreferrer">
                                      <FileText className="mr-2 h-4 w-4" />
                                      View PDF
                                    </a>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadPolicyDocument(selectedPolicy)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                  </Button>
                                </>
                              ) : (
                                <Alert className="w-full">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    Policy documents are being processed. Please contact support if you need immediate access.
                                  </AlertDescription>
                                </Alert>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleManageBilling}
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Manage Billing
                              </Button>
                            </div>
                          </div>
                        </>
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
                        <CreditCard className="mr-2 h-5 w-5" />
                        Billing & Renewal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage your payment methods and renewal settings.
                      </p>
                      <Button onClick={handleManageBilling} variant="outline" className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Need Help?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Contact our support team for assistance.
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => setShowSupportForm(true)} 
                          variant="outline" 
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Support
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          asChild
                        >
                          <a href="tel:+441234567890">
                            <Phone className="mr-2 h-4 w-4" />
                            Call Support
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Your Policies</CardTitle>
                  <CardDescription>
                    Complete list of your warranty policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {policies.map((policy) => (
                      <div 
                        key={policy.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedPolicy?.id === policy.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{policy.policy_number}</h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {policy.plan_type} - {getPaymentTypeDisplay(policy.payment_type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(policy.policy_end_date).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              policy.status === 'active' ? 'bg-green-100 text-green-800' :
                              policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {policy.status}
                            </span>
                            {getPolicyPdf(policy) && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={getPolicyPdf(policy)} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                      <p className="font-semibold">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                      <p className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Total Policies</Label>
                      <p className="font-semibold">{policies.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setEditingPassword(true)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Keep your account secure by using a strong password and logging out on shared devices.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                      Send us a message and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="supportSubject">Subject</Label>
                        <Input
                          id="supportSubject"
                          placeholder="Brief description of your issue"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="supportMessage">Message</Label>
                        <Textarea
                          id="supportMessage"
                          placeholder="Please describe your issue in detail..."
                          rows={6}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                        />
                      </div>
                      <Button onClick={submitSupportRequest} className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Support Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Other Ways to Reach Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Phone Support</p>
                        <p className="text-sm text-gray-600">+44 123 456 7890</p>
                        <p className="text-xs text-gray-500">Mon-Fri: 9AM-6PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-gray-600">support@buyawarranty.co.uk</p>
                        <p className="text-xs text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Sticky Bottom Price Bar */}
      {isFloatingBarVisible && selectedPolicy && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex-1">
                <h4 className={`font-bold text-base ${
                  selectedPolicy.plan_type === 'basic' ? 'text-blue-900' :
                  selectedPolicy.plan_type === 'gold' ? 'text-yellow-600' :
                  'text-orange-600'
                }`}>
                  {selectedPolicy.plan_type.charAt(0).toUpperCase() + selectedPolicy.plan_type.slice(1)}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs">Current Plan</span>
                  <span className="text-xs text-gray-600">
                    - {selectedPolicy.payment_type === 'twoYear' ? '2 Year' : 
                       selectedPolicy.payment_type === 'threeYear' ? '3 Year' : 
                       selectedPolicy.payment_type.charAt(0).toUpperCase() + selectedPolicy.payment_type.slice(1)}
                  </span>
                </div>
              </div>
              {getPolicyPdf(selectedPolicy) && (
                <Button
                  size="sm"
                  className={`ml-4 px-4 py-1.5 font-semibold rounded-lg transition-colors duration-200 ${
                    selectedPolicy.plan_type === 'basic' ? 'bg-[#1a365d] hover:bg-[#2d4a6b] text-white' :
                    selectedPolicy.plan_type === 'gold' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                    'bg-[#eb4b00] hover:bg-[#d44300] text-white'
                  }`}
                  asChild
                >
                  <a href={getPolicyPdf(selectedPolicy)} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-1 h-3 w-3" />
                    View PDF
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Form Modal */}
      {showSupportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contact Support</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSupportForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="modalSubject">Subject</Label>
                <Input
                  id="modalSubject"
                  placeholder="Brief description of your issue"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="modalMessage">Message</Label>
                <Textarea
                  id="modalMessage"
                  placeholder="Please describe your issue in detail..."
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={submitSupportRequest} className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSupportForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;