import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`Deleting test user with email: ${email}`)

    // Delete from customer_policies first (if any)
    const { error: policiesError } = await supabaseAdmin
      .from('customer_policies')
      .delete()
      .eq('email', email)

    if (policiesError) {
      console.error('Error deleting customer policies:', policiesError)
    } else {
      console.log('Deleted customer policies')
    }

    // Delete from welcome_emails (if any)
    const { error: welcomeEmailsError } = await supabaseAdmin
      .from('welcome_emails')
      .delete()
      .eq('email', email)

    if (welcomeEmailsError) {
      console.error('Error deleting welcome emails:', welcomeEmailsError)
    } else {
      console.log('Deleted welcome emails')
    }

    // Delete from customers table
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('email', email)

    if (customerError) {
      console.error('Error deleting customer:', customerError)
    } else {
      console.log('Deleted customer record')
    }

    // Try to delete from auth.users if exists
    try {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const userToDelete = users.users.find(user => user.email === email)
      
      if (userToDelete) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id)
        if (authError) {
          console.error('Error deleting auth user:', authError)
        } else {
          console.log('Deleted auth user')
        }
      }
    } catch (authError) {
      console.error('Error handling auth user deletion:', authError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test user ${email} deleted successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})