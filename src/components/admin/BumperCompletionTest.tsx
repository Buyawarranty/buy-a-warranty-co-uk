import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const BumperCompletionTest = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const triggerManualCompletion = async () => {
    setLoading(true);
    setResponse('');
    
    try {
      const { data, error } = await supabase.functions.invoke('manual-bumper-completion', {
        body: { email: 'buyawarranty1@gmail.com' }
      });

      if (error) {
        console.error('Manual completion error:', error);
        setResponse(`Error: ${error.message}`);
        toast.error('Manual completion failed');
      } else {
        console.log('Manual completion response:', data);
        setResponse(JSON.stringify(data, null, 2));
        toast.success('Manual completion triggered successfully');
      }
    } catch (error) {
      console.error('Request failed:', error);
      setResponse(`Error: ${error}`);
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Manual Bumper Completion</CardTitle>
        <CardDescription>
          Manually trigger Warranties 2000 registration and welcome email for the incomplete Bumper order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={triggerManualCompletion} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Complete Bumper Order (buyawarranty1@gmail.com)'}
        </Button>
        
        {response && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Response:</label>
            <Textarea
              value={response}
              readOnly
              className="h-40 font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};