import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, firstName, lastName, customerId } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating customer account for:', email);

    // Create user account with admin privileges
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || ''
      }
    });

    if (signUpError) {
      console.error('Error creating user:', signUpError);
      throw signUpError;
    }

    console.log('User created successfully:', authData.user.id);

    // Log credentials in admin note if customerId provided
    if (customerId) {
      const { error: noteError } = await supabase
        .from('admin_notes')
        .insert({
          customer_id: customerId,
          note: `Dashboard credentials created:\nEmail: ${email}\nPassword: ${password}\nUser ID: ${authData.user.id}`
        });

      if (noteError) {
        console.error('Error creating admin note:', noteError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        userId: authData.user.id,
        email: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-customer-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});