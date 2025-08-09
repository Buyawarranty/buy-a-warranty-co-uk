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
    
    // Validate environment variables
    const warranties2000Username = Deno.env.get('WARRANTIES_2000_USERNAME');
    const warranties2000Password = Deno.env.get('WARRANTIES_2000_PASSWORD');

    if (!warranties2000Username || !warranties2000Password) {
      console.error('Warranties 2000 credentials not configured');
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'MISSING_CREDENTIALS', 
        message: 'Warranties 2000 credentials not configured' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { policyId, customerId }: Warranties2000Request = await req.json();
    console.log('Request body parsed:', { policyId, customerId });
    
    if (!policyId && !customerId) {
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'MISSING_PARAMS', 
        message: 'Either policyId or customerId is required' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
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

    if (policyError) {
      console.error('Error fetching policy:', policyError);
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'POLICY_FETCH_ERROR', 
        message: policyError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!policies || policies.length === 0) {
      console.error('Policy not found');
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'POLICY_NOT_FOUND', 
        message: 'Policy not found' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const policy = policies[0];
    const customer = policy.customers;

    if (!customer) {
      console.error('Customer data not found');
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'CUSTOMER_NOT_FOUND', 
        message: 'Customer data not found' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Processing Warranties 2000 submission for policy:', policy.warranty_number);

    // Check for idempotency - don't send if already sent successfully
    if (policy.warranties_2000_status === 'sent') {
      console.log('Already sent to Warranties 2000');
      return new Response(JSON.stringify({ 
        ok: true, 
        already: true, 
        message: 'Already sent to Warranties 2000. Check audit logs for previous response.',
        policyId: policy.id 
      }), {
        status: 200,
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

    console.log('Warranties 2000 payload prepared');

    // Send to Warranties 2000 API with timeout and retry
    const basicAuth = btoa(`${warranties2000Username}:${warranties2000Password}`);
    
    let warranties2000Response;
    let responseData;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      warranties2000Response = await fetch('https://api.warranties2000.com/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify(warranties2000Data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Get response data
      const responseText = await warranties2000Response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw_response: responseText };
      }

      console.log('Warranties 2000 response status:', warranties2000Response.status);
      console.log('Warranties 2000 response data:', responseData);

    } catch (error: any) {
      console.error('Warranties 2000 API request failed:', error);
      
      // Update policy with failure
      await supabase
        .from('customer_policies')
        .update({
          warranties_2000_status: 'failed',
          warranties_2000_sent_at: new Date().toISOString(),
          warranties_2000_response: {
            error: error.message,
            sent_at: new Date().toISOString()
          }
        })
        .eq('id', policy.id);

      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'API_REQUEST_FAILED', 
        message: `Warranties 2000 API request failed: ${error.message}`,
        details: error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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
      console.error('Warranties 2000 API returned error status');
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'API_ERROR', 
        message: `Warranties 2000 API error: ${responseData.message || 'Unknown error'}`,
        details: {
          status: warranties2000Response.status,
          response: responseData
        }
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('=== Send to Warranties 2000 Complete ===');
    
    return new Response(JSON.stringify({ 
      ok: true, 
      id: responseData.id || responseData.reference || 'unknown',
      message: 'Successfully sent to Warranties 2000',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      warranties2000Response: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Unhandled error sending to Warranties 2000:", error);
    
    return new Response(JSON.stringify({ 
      ok: false, 
      code: 'UNHANDLED_ERROR', 
      message: error.message || 'Unknown error occurred',
      details: error.stack 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);