import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SetAdminPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPasswordField] = useState('PasswordLogin123-');
  const { toast } = useToast();

  const handleSetPassword = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the user by email
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('email', email)
        .single();

      if (!adminData) {
        toast({
          title: "Error",
          description: "Admin user not found",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('set-admin-password', {
        body: {
          userId: adminData.user_id,
          email: email,
          password: password
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Set",
        description: `Password successfully set for ${email}. You can now login with the new password.`,
      });

      console.log("Password set successfully for:", email);
      
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Admin Password</CardTitle>
        <CardDescription>
          Set a specific password for an admin user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Admin Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
          />
        </div>
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPasswordField(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <Button 
          onClick={handleSetPassword} 
          disabled={loading || !email || !password}
          className="w-full"
        >
          {loading ? 'Setting Password...' : 'Set Password'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SetAdminPassword;