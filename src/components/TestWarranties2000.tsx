import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TestWarranties2000 = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');

  const testWarrantiesAPI = async () => {
    setLoading(true);
    setResponse('');

    const testData = {
      Title: "Mr",
      First: "John",
      Surname: "Test", 
      Addr1: "123 Test Street",
      Addr2: "",
      Town: "London",
      PCode: "SW1A 1AA",
      Tel: "02071234567",
      Mobile: "07700123456",
      EMail: "john.test@example.com",
      PurDate: new Date().toISOString().split('T')[0],
      Make: "Ford",
      Model: "Focus",
      RegNum: "AB12 CDE",
      Mileage: "50000",
      PurPrc: "381",
      RegDate: "2020-01-01",
      WarType: "BBASIC",
      Month: "12",
      MaxClm: "050", // Correct code for BBASIC (£500)
      MOTDue: "2025-12-31",
      Ref: "BAW-2501-400001"
    };

    try {
      console.log('Testing Warranties 2000 API with data:', testData);
      
      const { data, error } = await supabase.functions.invoke('warranties-2000-registration', {
        body: testData
      });

      console.log('Function response - data:', data);
      console.log('Function response - error:', error);

      if (error) {
        console.error('Error calling Warranties 2000 API:', error);
        setResponse(`Error: ${JSON.stringify(error, null, 2)}`);
        toast.error(`API call failed: ${error.message || 'Unknown error'}`);
      } else {
        console.log('Warranties 2000 API response:', data);
        setResponse(JSON.stringify(data, null, 2));
        if (data?.success) {
          toast.success('API call successful!');
        } else {
          toast.error(`API returned error: ${data?.error || 'Unknown error'}`);
          console.error('API error details:', data?.details);
        }
      }
    } catch (err) {
      console.error('Exception calling Warranties 2000 API:', err);
      setResponse(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      toast.error('API call failed with exception');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Warranties 2000 API</CardTitle>
        <CardDescription>
          Test the integration with Warranties 2000 registration system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testWarrantiesAPI} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing API...' : 'Test Warranties 2000 API'}
        </Button>
        
        {response && (
          <div className="space-y-2">
            <label className="text-sm font-medium">API Response:</label>
            <Textarea 
              value={response} 
              readOnly 
              className="min-h-[200px] font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestWarranties2000;