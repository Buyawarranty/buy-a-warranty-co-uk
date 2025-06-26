
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PasswordReset = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  
  useEffect(() => {
    // Check if we have access and refresh tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session using the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive",
          });
          navigate('/auth');
        } else if (data.session) {
          console.log('Session set successfully:', data.session);
          setIsValidSession(true);
        }
      });
    } else {
      // Check if user is already authenticated
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        } else {
          toast({
            title: "Access required",
            description: "Please use the reset link from your email to access this page.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      });
    }
  }, [searchParams, navigate, toast]);

  const handlePasswordReset = async () => {
    if (!isValidSession) {
      toast({
        title: "Session expired",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated. You can now access your dashboard.",
      });

      // Clear the URL parameters and redirect to dashboard
      navigate('/customer-dashboard', { replace: true });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
              alt="BuyAWarranty" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle>Validating Reset Link</CardTitle>
            <CardDescription>
              Please wait while we validate your password reset link...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src="/lovable-uploads/9b53da8c-70f3-4fc2-8497-e1958a650b4a.png" 
            alt="BuyAWarranty" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>
            Create a new password for your BuyAWarranty account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </div>
          <Button 
            onClick={handlePasswordReset} 
            disabled={loading || !password || !confirmPassword}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
