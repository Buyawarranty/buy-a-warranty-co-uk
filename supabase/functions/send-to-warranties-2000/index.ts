import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Timeout wrapper for fetch
async function timedFetch(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Retry wrapper with exponential backoff
async function retryFetch(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await timedFetch(url, options);
      
      // Only retry on 5xx or 429 status codes
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      if (attempt === maxRetries) {
        return response; // Return the response even if not ok on final attempt
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff for network errors too
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

const handler = async (req: Request): Promise<Response> => {
  const rid = crypto.randomUUID();
  const t0 = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(JSON.stringify({ evt: "w2k.start", rid }));
    
    // Check environment variables at startup
    const w2kApiUrl = Deno.env.get('W2K_API_URL') || 'https://warranties-epf.co.uk/api.php';
    const w2kUsername = Deno.env.get('WARRANTIES_2000_USERNAME');
    const w2kPassword = Deno.env.get('WARRANTIES_2000_PASSWORD');
    
    console.log(JSON.stringify({ 
      evt: "env.check", 
      rid,
      hasUrl: !!w2kApiUrl,
      hasUsername: !!w2kUsername,
      hasPassword: !!w2kPassword
    }));
    
    if (!w2kUsername || !w2kPassword) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'MISSING_CREDENTIALS', 
        error: 'WARRANTIES_2000_USERNAME or WARRANTIES_2000_PASSWORD not configured' 
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Parse request body
    const body: Warranties2000Request = await req.json().catch(() => ({}));
    const { policyId, customerId } = body;
    
    console.log(JSON.stringify({ evt: "request.parsed", rid, policyId, customerId }));
    
    if (!policyId && !customerId) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'MISSING_PARAMS', 
        error: 'Either policyId or customerId is required' 
      }), {
        status: 422,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Get policy and customer data
    let query = supabase
      .from('customer_policies')
      .select(`
        *,
        customers!customer_id (
          id, name, email, phone, first_name, last_name,
          flat_number, building_name, building_number, street,
          town, county, postcode, country, vehicle_make,
          vehicle_model, vehicle_year, vehicle_fuel_type,
          vehicle_transmission, registration_plate, mileage
        )
      `);

    if (policyId) {
      query = query.eq('id', policyId);
    } else {
      query = query.eq('customer_id', customerId);
    }

    const { data: policies, error: policyError } = await query;

    if (policyError) {
      console.log(JSON.stringify({ evt: "db.error", rid, error: policyError.message }));
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'POLICY_FETCH_ERROR', 
        error: policyError.message 
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    if (!policies || policies.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'POLICY_NOT_FOUND', 
        error: 'Policy not found' 
      }), {
        status: 404,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const policy = policies[0];
    const customer = policy.customers;

    if (!customer) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'CUSTOMER_NOT_FOUND', 
        error: 'Customer data not found' 
      }), {
        status: 404,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    console.log(JSON.stringify({ 
      evt: "data.found", 
      rid, 
      policyId: policy.id, 
      warrantyNumber: policy.warranty_number 
    }));

    // Check idempotency
    if (policy.warranties_2000_status === 'sent') {
      console.log(JSON.stringify({ evt: "already.sent", rid, policyId: policy.id }));
      return new Response(JSON.stringify({ 
        ok: true, 
        rid,
        already: true, 
        message: 'Already sent to Warranties 2000' 
      }), {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Validate required fields for W2K
    const requiredFields = {
      warranty_number: policy.warranty_number,
      customer_email: customer.email,
      customer_name: customer.name,
      registration_plate: customer.registration_plate
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'MISSING_REQUIRED_FIELDS', 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }), {
        status: 422,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Prepare data for Warranties 2000 API
    const warranties2000Data = {
      Title: 'Mr', // Default, could be enhanced
      First: customer.first_name || customer.name.split(' ')[0] || '',
      Surname: customer.last_name || customer.name.split(' ').slice(1).join(' ') || '',
      Addr1: `${customer.building_number || ''} ${customer.street || ''}`.trim(),
      Addr2: customer.building_name || '',
      Town: customer.town || '',
      PCode: customer.postcode || '',
      Tel: customer.phone || '',
      Mobile: customer.phone || '',
      EMail: customer.email,
      PurDate: policy.policy_start_date ? new Date(policy.policy_start_date).toISOString().split('T')[0] : '',
      Make: customer.vehicle_make || '',
      Model: customer.vehicle_model || '',
      RegNum: customer.registration_plate || '',
      Mileage: customer.mileage || '',
      EngSize: '', // Not available in our schema
      PurPrc: String(policy.payment_amount || '0'),
      RegDate: customer.vehicle_year ? `${customer.vehicle_year}-01-01` : '',
      WarType: policy.plan_type || '',
      Month: policy.payment_type === 'yearly' ? '12' : '1',
      MaxClm: '3000', // Default claim limit
      MOTDue: '', // Not available in our schema
      Ref: policy.warranty_number
    };

    console.log(JSON.stringify({ evt: "w2k.payload.prepared", rid }));

    // Send to Warranties 2000 API with basic auth
    const basicAuth = btoa(`${w2kUsername}:${w2kPassword}`);
    const idempotencyKey = policy.warranty_number || policy.id;

    const w2kResponse = await retryFetch(w2kApiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Basic ${basicAuth}`,
        'idempotency-key': idempotencyKey
      },
      body: JSON.stringify(warranties2000Data)
    });

    const responseText = await w2kResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw_response: responseText.substring(0, 256) };
    }

    console.log(JSON.stringify({ 
      evt: "w2k.response", 
      rid, 
      status: w2kResponse.status,
      preview: responseText.substring(0, 256) 
    }));

    // Update policy with response
    const status = w2kResponse.ok ? 'sent' : 'failed';
    
    await supabase
      .from('customer_policies')
      .update({
        warranties_2000_status: status,
        warranties_2000_sent_at: new Date().toISOString(),
        warranties_2000_response: {
          status: w2kResponse.status,
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
        status: w2kResponse.status,
        response: responseData,
        idempotency_key: idempotencyKey
      },
      p_created_by: 'admin'
    });

    if (!w2kResponse.ok) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'W2K_API_ERROR', 
        error: `Warranties 2000 API error: ${responseData.message || responseData.Response || 'Unknown error'}`,
        details: {
          status: w2kResponse.status,
          response: responseData
        }
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    console.log(JSON.stringify({ evt: "w2k.success", rid, referenceId: responseData.id || 'unknown' }));
    
    return new Response(JSON.stringify({ 
      ok: true, 
      rid,
      id: responseData.id || responseData.reference || 'unknown',
      message: 'Successfully sent to Warranties 2000',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      warranties2000Response: responseData
    }), {
      status: 200,
      headers: { "content-type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(JSON.stringify({ evt: "error", rid, error: msg }));
    
    return new Response(JSON.stringify({ 
      ok: false, 
      rid,
      code: 'UNHANDLED_ERROR', 
      error: msg 
    }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  } finally {
    console.log(JSON.stringify({ evt: "edge.done", rid, ms: Date.now() - t0 }));
  }
};

serve(handler);