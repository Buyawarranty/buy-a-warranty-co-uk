import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, RefreshCw, LogIn, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CustomerLoginDebugTool = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const generateRandomPassword = () => {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleTestLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Testing customer login...');
      
      // First sign out any existing session
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login test error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setCustomerInfo(null);
        return;
      }

      console.log('Login test successful:', data.user?.email);
      
      // Fetch customer policies
      const { data: policies, error: policiesError } = await supabase
        .from('customer_policies')
        .select('*')
        .ilike('email', email);

      console.log('Policies:', { policies, policiesError });

      setCustomerInfo({
        email: data.user?.email,
        userId: data.user?.id,
        policiesCount: policies?.length || 0,
        policies: policies || []
      });

      toast({
        title: "Login Successful ✅",
        description: `Logged in as ${data.user?.email}. Found ${policies?.length || 0} policies.`,
      });

      // Sign out after test
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error('Login test failed:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
      setCustomerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter customer email first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate new random password
      const tempPassword = generateRandomPassword();
      setNewPassword(tempPassword);

      console.log('Generating new password for customer:', email);
      
      // Call the reset password function
      const { data, error } = await supabase.functions.invoke('reset-customer-password', {
        body: {
          email: email,
          newPassword: tempPassword
        }
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Password Reset Failed",
          description: error.message || "Failed to reset password",
          variant: "destructive",
        });
        setNewPassword('');
        return;
      }

      console.log('Password reset result:', data);
      
      // Immediately test the new password
      console.log('Testing new password...');
      await supabase.auth.signOut();
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: tempPassword,
      });

      if (loginError) {
        toast({
          title: "Password Set But Login Failed",
          description: "Password was set but test login failed. Please try again.",
          variant: "destructive",
        });
        console.error('New password test failed:', loginError);
      } else {
        toast({
          title: "✅ Password Reset Successful",
          description: `New password set and verified. Customer can now login.`,
        });
        console.log('New password verified successfully');
        
        // Fetch policies after successful login
        const { data: policies } = await supabase
          .from('customer_policies')
          .select('*')
          .ilike('email', email);

        setCustomerInfo({
          email: loginData.user?.email,
          userId: loginData.user?.id,
          policiesCount: policies?.length || 0,
          policies: policies || []
        });
      }

      // Sign out after test
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error('Password generation failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setNewPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCustomer = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter customer email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Checking customer info for:', email);
      
      const { data: policies, error } = await supabase
        .from('customer_policies')
        .select('*')
        .ilike('email', email);

      if (error) throw error;

      setCustomerInfo({
        email: email,
        userId: null,
        policiesCount: policies?.length || 0,
        policies: policies || []
      });

      toast({
        title: "Customer Info",
        description: `Found ${policies?.length || 0} policies for ${email}`,
      });
      
    } catch (error: any) {
      console.error('Customer check failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setCustomerInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Customer Login Debug Tool</CardTitle>
        <CardDescription>
          Test customer credentials and reset passwords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customer-email">Customer Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="customer-password">Password (for testing)</Label>
          <div className="relative">
            <Input
              id="customer-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to test"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {newPassword && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="space-y-2">
              <div className="font-semibold text-green-900">✅ New Password Generated & Verified:</div>
              <div className="font-mono text-lg bg-white p-2 rounded border border-green-300 text-green-900">
                {newPassword}
              </div>
              <div className="text-sm text-green-700">
                This password has been set and verified. Customer can login immediately.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {customerInfo && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="space-y-1 text-sm">
              <div><strong>Email:</strong> {customerInfo.email}</div>
              {customerInfo.userId && <div><strong>User ID:</strong> {customerInfo.userId}</div>}
              <div><strong>Policies:</strong> {customerInfo.policiesCount}</div>
              {customerInfo.policies.length > 0 && (
                <div className="mt-2 space-y-1">
                  {customerInfo.policies.map((policy: any) => (
                    <div key={policy.id} className="text-xs bg-white p-2 rounded">
                      <div><strong>Policy:</strong> {policy.policy_number}</div>
                      <div><strong>Plan:</strong> {policy.plan_type}</div>
                      <div><strong>Status:</strong> {policy.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleTestLogin}
            disabled={loading || !email || !password}
            variant="default"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? 'Testing...' : 'Test Login'}
          </Button>
          
          <Button 
            onClick={handleGenerateNewPassword}
            disabled={loading || !email}
            variant="outline"
            className="bg-orange-50 border-orange-300 hover:bg-orange-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate New Password'}
          </Button>
          
          <Button 
            onClick={handleCheckCustomer}
            disabled={loading || !email}
            variant="secondary"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Check Customer Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerLoginDebugTool;
