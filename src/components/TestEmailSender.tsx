import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const TestEmailSender = () => {
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email: 'prajwalchauhan2001@gmail.com' }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error(`Failed to send test email: ${error.message}`);
      } else {
        console.log('Function response:', data);
        if (data.success) {
          toast.success(`Test email sent successfully to prajwalchauhan2001@gmail.com`);
        } else {
          toast.error(`Failed to send email: ${data.error}`);
        }
      }
    } catch (err) {
      console.error('Catch error:', err);
      toast.error('Error calling email function');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Email System Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Send a test email to verify the Resend API key is working
      </p>
      <Button 
        onClick={sendTestEmail} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Sending...' : 'Send Test Email to prajwalchauhan2001@gmail.com'}
      </Button>
    </div>
  );
};