import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ResetCustomerPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and new password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call the reset-customer-password edge function
      const { data, error } = await supabase.functions.invoke('reset-customer-password', {
        body: { email, newPassword }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Update welcome_emails table with new password
      const { data: welcomeData, error: welcomeError } = await supabase
        .from('welcome_emails')
        .upsert({
          email: email,
          temporary_password: newPassword,
          password_reset: false,
          password_reset_by_user: false,
          email_sent_at: new Date().toISOString()
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });

      if (welcomeError) {
        console.error('Failed to update welcome_emails:', welcomeError);
      }

      toast({
        title: "Password Reset Successful",
        description: `Password has been reset for ${email}. New password: ${newPassword}`,
        duration: 10000
      });

      // Clear form
      setEmail('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to reset customer password',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please provide customer email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-customer-credentials', {
        body: { email }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to resend credentials');
      }

      toast({
        title: "Credentials Sent",
        description: `Login credentials have been sent to ${email}`,
      });
    } catch (error: any) {
      console.error('Error resending credentials:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to resend credentials',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Customer Password</CardTitle>
        <CardDescription>
          Reset password for a customer and optionally send them their credentials via email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Customer Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="flex gap-2">
            <Input
              id="password"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={generateRandomPassword}
            >
              Generate
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          
          <Button 
            onClick={handleResendCredentials}
            disabled={loading}
            variant="secondary"
          >
            {loading ? 'Sending...' : 'Resend Existing Credentials'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>"Reset Password" will set a new password</li>
            <li>"Resend Existing Credentials" will email the current password from the database</li>
            <li>After resetting, copy the new password and send it to the customer separately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
