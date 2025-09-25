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
  phone?: string;
  firstName?: string;
  lastName?: string;
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
  const [customerData, setCustomerData] = useState<any>(null);
  const [address, setAddress] = useState<AddressData>({
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    firstName: '',
    lastName: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showRenewalBanner, setShowRenewalBanner] = useState(false);
  const [renewalDiscount, setRenewalDiscount] = useState<string | null>(null);
  
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

  // Map plan types to document types - all warranties now use premium plan
  const mapPlanTypeToDocumentType = (planType: string): string => {
    // Map all plan types to premium for unified premium warranty coverage
    const premiumPlans = [
      'basic', 'Basic', 'Basic Car Plan',
      'gold', 'Gold', 'Gold Car Plan', 
      'platinum', 'Platinum', 'Platinum Car Plan',
      'premium', 'Premium', 'Premium Car Plan'
    ];
    
    if (premiumPlans.some(plan => planType.toLowerCase().includes(plan.toLowerCase()))) {
      return 'premium';
    }
    
    // Keep special vehicle types unchanged
    const mapping: Record<string, string> = {
      'phev hybrid extended warranty': 'phev',
      'PHEV Hybrid Extended Warranty': 'phev',
      'electric': 'electric',
      'Electric': 'electric',
      'motorbike': 'motorbike',
      'Motorbike': 'motorbike'
    };
    
    return mapping[planType] || 'premium'; // Default to premium
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
        
        // Fetch customer data for address and phone
        await fetchCustomerData(user.email);
        
        // Set address from the first policy
        const firstPolicy = policiesWithDocuments[0];
        if (firstPolicy.address && typeof firstPolicy.address === 'object') {
          const addressData = firstPolicy.address as Record<string, any>;
          setAddress(prev => ({
            ...prev,
            street: addressData.street || prev.street,
            city: addressData.city || prev.city,
            postcode: addressData.postcode || prev.postcode,
            country: addressData.country || 'United Kingdom'
          }));
        }

        // Check for renewal notification
        checkRenewalNotification(policiesWithDocuments[0]);
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

      // Also update customer data
      await supabase
        .from('customers')
        .update({
          first_name: address.firstName,
          last_name: address.lastName,
          phone: address.phone,
          street: address.street,
          town: address.city,
          postcode: address.postcode,
          country: address.country
        })
        .eq('email', user?.email);

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
    
    // Fallback to old PDF fields for backward compatibility - all now point to premium
    switch (policy.plan_type.toLowerCase()) {
      case 'basic':
      case 'gold':  
      case 'platinum':
      case 'premium':
        return policy.pdf_platinum_url || policy.pdf_gold_url || policy.pdf_basic_url;
      default:
        return policy.pdf_platinum_url || policy.pdf_gold_url || policy.pdf_basic_url;
    }
  };

  const getTimeRemaining = (policy: CustomerPolicy) => {
    if (!policy) return '';
    
    const endDate = new Date(policy.policy_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime < 0) return 'Expired';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day remaining';
    if (diffDays < 30) return `${diffDays} days remaining`;
    
    // Calculate years, months, and days
    let years = 0;
    let months = 0;
    let days = diffDays;
    
    // Calculate years
    while (days >= 365) {
      years++;
      days -= 365;
    }
    
    // Calculate months  
    while (days >= 30) {
      months++;
      days -= 30;
    }
    
    // Build the display string
    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0 && years === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? `${parts.join(', ')} remaining` : 'Less than a day remaining';
  };

  const fetchCustomerData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer data:', error);
        return;
      }

      if (data) {
        console.log('Customer data fetched:', data);
        setCustomerData(data);
        setAddress(prev => ({
          ...prev,
          phone: data.phone || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          street: [
            data.flat_number,
            data.building_name,
            data.building_number,
            data.street
          ].filter(Boolean).join(', ') || prev.street,
          city: data.town || prev.city,
          postcode: data.postcode || prev.postcode,
          country: data.country || prev.country
        }));
      }
    } catch (error) {
      console.error('Error in fetchCustomerData:', error);
    }
  };

  const checkRenewalNotification = (policy: CustomerPolicy) => {
    if (!policy) return;
    
    const endDate = new Date(policy.policy_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Show renewal banner if within 30 days of expiry
    if (diffDays > 0 && diffDays <= 30) {
      setShowRenewalBanner(true);
      generateRenewalDiscount();
    }
  };

  const generateRenewalDiscount = async () => {
    try {
      const discountCode = `RENEW10-${Date.now().toString().slice(-6)}`;
      setRenewalDiscount(discountCode);
      
      // Create the discount code in the database
      const { error } = await supabase.functions.invoke('create-discount-code', {
        body: {
          code: discountCode,
          type: 'percentage',
          value: 10,
          validDays: 30,
          usageLimit: 1,
          applicableProducts: ['all']
        }
      });

      if (error) {
        console.error('Error creating renewal discount:', error);
      }
    } catch (error) {
      console.error('Error generating renewal discount:', error);
    }
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
        {/* Renewal Notification Banner */}
        {showRenewalBanner && selectedPolicy && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Your warranty expires soon!</strong> Renew now and get 10% off your next policy.
                  {renewalDiscount && (
                    <div className="mt-2">
                      <span className="text-sm">Use code: <strong>{renewalDiscount}</strong></span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate('/')}>
                    Renew Now
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRenewalBanner(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="policies">All Policies</TabsTrigger>
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
                              <p className="font-semibold text-sm sm:text-base">
                                {selectedPolicy.plan_type.includes('motorbike') || selectedPolicy.plan_type.includes('Motorbike') 
                                  ? 'Motorbike Plan' 
                                  : selectedPolicy.plan_type.includes('van') || selectedPolicy.plan_type.includes('Van')
                                  ? 'Van Plan'
                                  : selectedPolicy.plan_type.includes('phev') || selectedPolicy.plan_type.includes('electric') || selectedPolicy.plan_type.includes('Electric')
                                  ? 'Electric/Hybrid Plan'
                                  : 'Car Plan'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-500">Vehicle Registration</Label>
                              <p className="font-semibold text-sm sm:text-base text-black">
                                {customerData?.registration_plate || 'Not provided'}
                              </p>
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
                          
                          {/* Claim Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-700">Claim Limit</Label>
                              <p className="font-bold text-lg text-blue-900">£1250 per claim</p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium text-gray-700">Excess</Label>
                              <p className="font-bold text-lg text-blue-900">£50</p>
                            </div>
                          </div>
                          
                          {/* Order Summary */}
                          {selectedPolicy.payment_amount && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <Label className="text-xs sm:text-sm font-medium text-gray-700">Order Summary</Label>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Total Amount Paid</span>
                                <span className="font-bold text-lg text-gray-900">£{selectedPolicy.payment_amount}</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-gray-600">Payment Type</span>
                                <span className="text-sm text-gray-900">{getPaymentTypeDisplay(selectedPolicy.payment_type)}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-4 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open("/lovable-uploads/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2.pdf", "_blank")}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View T's and C's
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open("/lovable-uploads/Platinum-warranty-plan_v2.2.pdf", "_blank")}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View your warranty plan
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
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                  id="firstName"
                                  value={address.firstName}
                                  onChange={(e) => setAddress({...address, firstName: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  value={address.lastName}
                                  onChange={(e) => setAddress({...address, lastName: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                value={address.phone}
                                onChange={(e) => setAddress({...address, phone: e.target.value})}
                              />
                            </div>
                             <div>
                               <Label htmlFor="street">Address Line 1</Label>
                               <Input
                                 id="street"
                                 placeholder="Flat/Building Number, Building Name, Street"
                                 value={address.street}
                                 onChange={(e) => setAddress({...address, street: e.target.value})}
                               />
                             </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="city">City/Town</Label>
                                <Input
                                  id="city"
                                  value={address.city}
                                  onChange={(e) => setAddress({...address, city: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="postcode">Post Code</Label>
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
                           <div className="space-y-3">
                             {/* Customer Name */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                               <p className="font-semibold text-base">
                                 {address.firstName && address.lastName 
                                   ? `${address.firstName} ${address.lastName}` 
                                   : (address.firstName || address.lastName || 'N/A')}
                               </p>
                             </div>
                             
                             {/* Email Address */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                               <p className="font-semibold text-base">{user?.email}</p>
                             </div>
                             
                             {/* Phone Number */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                               <p className="font-semibold text-base">
                                 {address.phone || 'N/A'}
                               </p>
                             </div>
                             
                             {/* Address Line 1 */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Address Line 1</Label>
                               <p className="font-semibold text-base">
                                 {address.street || 'N/A'}
                               </p>
                             </div>
                             
                             {/* Post Code */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Post Code</Label>
                               <p className="font-semibold text-base">
                                 {address.postcode || 'N/A'}
                               </p>
                             </div>
                             
                             {/* City/Town */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">City/Town</Label>
                               <p className="font-semibold text-base">
                                 {address.city || 'N/A'}
                               </p>
                             </div>
                             
                             {/* Country */}
                             <div>
                               <Label className="text-sm font-medium text-gray-500">Country</Label>
                               <p className="font-semibold text-base">
                                 {address.country || 'United Kingdom'}
                               </p>
                             </div>
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


                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6">
              <div className="space-y-6">
                {policies.map((policy) => (
                  <Card 
                    key={policy.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setActiveTab('overview');
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Your Active Policy
                        </span>
                        <span className="text-sm font-normal text-gray-600">
                          {policies.length} total policies
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-500">Policy Number</Label>
                          <p className="font-semibold text-sm sm:text-base">{policy.policy_number}</p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-500">Plan Type</Label>
                          <p className="font-semibold text-sm sm:text-base">
                            {policy.plan_type.includes('motorbike') || policy.plan_type.includes('Motorbike') 
                              ? 'Motorbike Plan' 
                              : policy.plan_type.includes('van') || policy.plan_type.includes('Van')
                              ? 'Van Plan'
                              : policy.plan_type.includes('phev') || policy.plan_type.includes('electric') || policy.plan_type.includes('Electric')
                              ? 'Electric/Hybrid Plan'
                              : 'Car Plan'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-500">Vehicle Registration</Label>
                          <p className="font-semibold text-sm sm:text-base text-black">
                            {customerData?.registration_plate || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-500">Warranty Duration</Label>
                          <p className="font-semibold text-sm sm:text-base">
                            {getWarrantyDurationDisplay(policy.payment_type)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-500">Status</Label>
                          <p className={`font-semibold capitalize text-sm sm:text-base flex items-center gap-2 ${
                            policy.status === 'active' ? 'text-green-600' : 
                            policy.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {policy.status === 'active' && <CheckCircle className="h-4 w-4" />}
                            {policy.status === 'expired' && <X className="h-4 w-4" />}
                            {policy.status === 'pending' && <AlertCircle className="h-4 w-4" />}
                            {policy.status}
                          </p>
                        </div>
                      </div>
                      
                      {/* Claim Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Claim Limit</Label>
                          <p className="font-bold text-lg text-blue-900">£1250 per claim</p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Excess</Label>
                          <p className="font-bold text-lg text-blue-900">£50</p>
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      {policy.payment_amount && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Order Summary</Label>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">Total Amount Paid</span>
                            <span className="font-bold text-lg text-gray-900">£{policy.payment_amount}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Payment Type</span>
                            <span className="text-sm text-gray-900">{getPaymentTypeDisplay(policy.payment_type)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="sm:text-right">
                            <Label className="text-xs sm:text-sm font-medium text-gray-500">Expires On</Label>
                            <p className="font-semibold text-sm sm:text-base">
                              {new Date(policy.policy_end_date).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t">
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open("/lovable-uploads/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2.pdf", "_blank")}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View T's and C's
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open("/lovable-uploads/Platinum-warranty-plan_v2.2.pdf", "_blank")}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View your warranty plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">General Support</h4>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Phone Support</p>
                          <p className="text-sm text-gray-600">0330 229 5040</p>
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
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium text-sm text-gray-700">Claims and Repairs</h4>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Claims Phone</p>
                          <p className="text-sm text-gray-600">0330 229 5045</p>
                          <p className="text-xs text-gray-500">Mon-Fri: 9AM-6PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Claims Email</p>
                          <p className="text-sm text-gray-600">claims@buyawarranty.co.uk</p>
                          <p className="text-xs text-gray-500">For warranty claims and repairs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>


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