// Test script to resend email for warranty BAW-2508-400117
import { supabase } from "./src/integrations/supabase/client.js";

async function testEmailResend() {
  try {
    console.log('Testing email resend for warranty BAW-2508-400117...');
    
    const { data, error } = await supabase.functions.invoke('send-welcome-email-manual', {
      body: {
        policyId: '5e0dfd8c-77ec-4a1d-b4eb-ff6c91363d25',
        customerId: '106e5c62-94f9-4eeb-a72a-e135cd976196'
      }
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testEmailResend();