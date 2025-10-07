// Temporary script to resend welcome email for BAW-2510-400478
// Run this once and then delete this file

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bHB1eHp3eXJjeXJncm9uZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODc0MjUsImV4cCI6MjA2NjQ2MzQyNX0.bFu0Zj4ic61GN0LwipkINg9YJtgd8RnMgEmzE139MPU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resendWelcomeEmail() {
  try {
    console.log('Resending welcome email for customer: smith.nicking@gmail.com');
    
    const { data, error } = await supabase.functions.invoke('resend-welcome-email', {
      body: {
        customerEmail: 'smith.nicking@gmail.com'
      }
    });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Email resent:', data);
    }
  } catch (error) {
    console.error('Exception:', error);
  }
}

resendWelcomeEmail();
