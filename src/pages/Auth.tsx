
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // If user is already logged in, redirect to dashboard
      navigate('/customer-dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Successfully signed in!');
      navigate('/customer-dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWarranty = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8f4fb] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 shadow-xl">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Brand Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/00df2d65-3877-4e69-8558-cd5acb7f6257.png" 
              alt="BuyAWarranty" 
              className="h-12 w-auto"
            />
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900">
            Customer Dashboard
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Sign in to access your warranty dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 text-base"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 text-base pr-12"
                  required
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>
            
            <Button 
              disabled={loading} 
              className="w-full h-12 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </Button>
            
            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => navigate('/reset-password')}
                className="text-blue-600 hover:text-blue-800"
              >
                Forgot your password?
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Don't have a warranty yet?</span>
            </div>
          </div>

          {/* Buy Warranty Section */}
          <div className="text-center space-y-4 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Need a Warranty?</h3>
            <p className="text-gray-600">
              Purchase a warranty to get access to your customer dashboard with policy details, claims, and more.
            </p>
            <Button 
              onClick={handleBuyWarranty}
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Buy a Warranty
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
