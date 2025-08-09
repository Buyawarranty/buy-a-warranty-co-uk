import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Warranties2000Request {
  policyId?: string;
  customerId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Send to Warranties 2000 Started ===');
    const { policyId, customerId }: Warranties2000Request = await req.json();
    
    if (!policyId && !customerId) {
      throw new Error('Either policyId or customerId is required');
    }

    // Get policy and customer data
    let query = supabase
      .from('customer_policies')
      .select(`
        *,
        customers!customer_id (
          id,
          name,
          email,
          phone,
          first_name,
          last_name,
          flat_number,
          building_name,
          building_number,
          street,
          town,
          county,
          postcode,
          country,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_fuel_type,
          vehicle_transmission,
          registration_plate,
          mileage
        )
      `);

    if (policyId) {
      query = query.eq('id', policyId);
    } else {
      query = query.eq('customer_id', customerId);
    }

    const { data: policies, error: policyError } = await query;

    if (policyError || !policies || policies.length === 0) {
      throw new Error('Policy not found');
    }

    const policy = policies[0];
    const customer = policy.customers;

    if (!customer) {
      throw new Error('Customer data not found');
    }

    console.log('Processing Warranties 2000 submission for policy:', policy.warranty_number);

    // Check for idempotency - don't send if already sent successfully
    if (policy.warranties_2000_status === 'sent') {
      return new Response(JSON.stringify({ 
        error: 'Already sent to Warranties 2000. Check audit logs for previous response.' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare data for Warranties 2000 API
    const warranties2000Data = {
      // Customer information
      customer: {
        title: 'Mr', // Default, could be enhanced
        first_name: customer.first_name || customer.name.split(' ')[0] || '',
        last_name: customer.last_name || customer.name.split(' ').slice(1).join(' ') || '',
        email: customer.email,
        phone: customer.phone || '',
        address: {
          flat_number: customer.flat_number || '',
          building_name: customer.building_name || '',
          building_number: customer.building_number || '',
          street: customer.street || '',
          town: customer.town || '',
          county: customer.county || '',
          postcode: customer.postcode || '',
          country: customer.country || 'United Kingdom'
        }
      },
      // Vehicle information
      vehicle: {
        registration_plate: customer.registration_plate || '',
        make: customer.vehicle_make || '',
        model: customer.vehicle_model || '',
        year: customer.vehicle_year || '',
        fuel_type: customer.vehicle_fuel_type || '',
        transmission: customer.vehicle_transmission || '',
        mileage: customer.mileage || ''
      },
      // Policy information
      policy: {
        warranty_number: policy.warranty_number,
        plan_type: policy.plan_type,
        payment_type: policy.payment_type,
        policy_start_date: policy.policy_start_date,
        policy_end_date: policy.policy_end_date,
        payment_amount: policy.payment_amount,
        payment_currency: policy.payment_currency || 'GBP'
      }
    };

    console.log('Warranties 2000 payload:', JSON.stringify(warranties2000Data, null, 2));

    // Send to Warranties 2000 API
    const warranties2000Username = Deno.env.get('WARRANTIES_2000_USERNAME');
    const warranties2000Password = Deno.env.get('WARRANTIES_2000_PASSWORD');

    if (!warranties2000Username || !warranties2000Password) {
      throw new Error('Warranties 2000 credentials not configured');
    }

    const basicAuth = btoa(`${warranties2000Username}:${warranties2000Password}`);
    
    const warranties2000Response = await fetch('https://api.warranties2000.com/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify(warranties2000Data)
    });

    const responseData = await warranties2000Response.json();

    console.log('Warranties 2000 response status:', warranties2000Response.status);
    console.log('Warranties 2000 response data:', responseData);

    // Update policy with Warranties 2000 response
    const status = warranties2000Response.ok ? 'sent' : 'failed';
    
    await supabase
      .from('customer_policies')
      .update({
        warranties_2000_status: status,
        warranties_2000_sent_at: new Date().toISOString(),
        warranties_2000_response: {
          status: warranties2000Response.status,
          response: responseData,
          sent_at: new Date().toISOString()
        }
      })
      .eq('id', policy.id);

    // Log the event
    await supabase.rpc('log_warranty_event', {
      p_policy_id: policy.id,
      p_customer_id: customer.id,
      p_event_type: status === 'sent' ? 'warranties_2000_sent' : 'warranties_2000_failed',
      p_event_data: {
        status: warranties2000Response.status,
        response: responseData,
        request_data: warranties2000Data
      },
      p_created_by: 'admin'
    });

    if (!warranties2000Response.ok) {
      throw new Error(`Warranties 2000 API error: ${responseData.message || 'Unknown error'}`);
    }

    console.log('=== Send to Warranties 2000 Complete ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully sent to Warranties 2000',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      warranties2000Response: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending to Warranties 2000:", error);
    
    // If we have policy info, log the failure
    if (policyId || customerId) {
      try {
        // Update the policy to reflect the failure
        let updateQuery = supabase
          .from('customer_policies')
          .update({
            warranties_2000_status: 'failed',
            warranties_2000_sent_at: new Date().toISOString(),
            warranties_2000_response: {
              error: error.message,
              sent_at: new Date().toISOString()
            }
          });

        if (policyId) {
          updateQuery = updateQuery.eq('id', policyId);
        } else {
          updateQuery = updateQuery.eq('customer_id', customerId);
        }

        await updateQuery;
      } catch (logError) {
        console.error('Error logging failure:', logError);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);