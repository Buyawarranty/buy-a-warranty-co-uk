import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    // Prevent test data from being sent to live API
    const testIndicators = [
      'test', 'slack', 'qureshi', 'guest', 'demo', 'unknown', 'tand band',
      'ab12', 'test123', 'monshot', 'limited', 'qureshitest', 'threeyear'
    ];
    
    const isTestData = testIndicators.some(indicator => 
      customer.name?.toLowerCase().includes(indicator) ||
      customer.email?.toLowerCase().includes(indicator) ||
      customer.registration_plate?.toLowerCase().includes(indicator) ||
      customer.vehicle_make?.toLowerCase().includes(indicator) ||
      customer.vehicle_model?.toLowerCase().includes(indicator)
    );

    if (isTestData) {
      console.log(JSON.stringify({ 
        evt: "w2k.test_data_blocked", 
        rid, 
        customer: customer.email,
        registration: customer.registration_plate 
      }));
      
      // Update policy status to indicate it was blocked
      await supabase
        .from('customer_policies')
        .update({
          warranties_2000_status: 'blocked_test_data',
          warranties_2000_response: {
            status: 'blocked',
            reason: 'Test data blocked from live API',
            blocked_at: new Date().toISOString()
          }
        })
        .eq('id', policy.id);
      
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'TEST_DATA_BLOCKED', 
        error: 'Test data blocked from being sent to live Warranties 2000 API',
        details: {
          customer: customer.email,
          registration: customer.registration_plate
        }
      }), {
        status: 400,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Check for duplicate registration with DIFFERENT vehicle data (prevent data corruption)
    // Allow renewals for the same vehicle (same make/model)
    const { data: duplicateRegistrations, error: dupError } = await supabase
      .from('customer_policies')
      .select(`
        id, warranty_number, warranties_2000_status, 
        customers!customer_id(registration_plate, email, name, vehicle_make, vehicle_model)
      `)
      .neq('id', policy.id)
      .eq('warranties_2000_status', 'sent');

    if (duplicateRegistrations && !dupError) {
      const conflictingReg = duplicateRegistrations.find(p => {
        const sameReg = p.customers?.registration_plate?.toLowerCase() === customer.registration_plate?.toLowerCase();
        const differentMake = p.customers?.vehicle_make?.toLowerCase() !== customer.vehicle_make?.toLowerCase();
        const differentModel = p.customers?.vehicle_model?.toLowerCase() !== customer.vehicle_model?.toLowerCase();
        
        // Block only if same registration but different vehicle data
        return sameReg && (differentMake || differentModel);
      });
      
      if (conflictingReg) {
        console.log(JSON.stringify({ 
          evt: "w2k.vehicle_data_conflict_blocked", 
          rid, 
          duplicate_warranty: conflictingReg.warranty_number,
          original_customer: conflictingReg.customers?.email,
          current_customer: customer.email,
          conflict: {
            registration: customer.registration_plate,
            existing_make_model: `${conflictingReg.customers?.vehicle_make} ${conflictingReg.customers?.vehicle_model}`,
            current_make_model: `${customer.vehicle_make} ${customer.vehicle_model}`
          }
        }));
        
        return new Response(JSON.stringify({ 
          ok: false, 
          rid,
          code: 'VEHICLE_DATA_CONFLICT', 
          error: `Registration ${customer.registration_plate} already exists with different vehicle data`,
          details: {
            existing_warranty: conflictingReg.warranty_number,
            original_customer: conflictingReg.customers?.email,
            existing_vehicle: `${conflictingReg.customers?.vehicle_make} ${conflictingReg.customers?.vehicle_model}`,
            current_vehicle: `${customer.vehicle_make} ${customer.vehicle_model}`,
            note: "Renewals for the same vehicle are allowed, but vehicle data must match"
          }
        }), {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
      
      // Log if this is a valid renewal (same vehicle data)
      const validRenewal = duplicateRegistrations.find(p => {
        const sameReg = p.customers?.registration_plate?.toLowerCase() === customer.registration_plate?.toLowerCase();
        const sameMake = p.customers?.vehicle_make?.toLowerCase() === customer.vehicle_make?.toLowerCase();
        const sameModel = p.customers?.vehicle_model?.toLowerCase() === customer.vehicle_model?.toLowerCase();
        
        return sameReg && sameMake && sameModel;
      });
      
      if (validRenewal) {
        console.log(JSON.stringify({ 
          evt: "w2k.warranty_renewal_detected", 
          rid, 
          previous_warranty: validRenewal.warranty_number,
          vehicle: `${customer.vehicle_make} ${customer.vehicle_model}`,
          registration: customer.registration_plate
        }));
      }
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

    // Prepare data for Warranties 2000 API per specification
    const warranties2000Data = {
      Title: extractTitle(customer.name) || 'Mr',
      First: customer.first_name || extractFirstName(customer.name) || '',
      Surname: customer.last_name || extractSurname(customer.name) || '',
      Addr1: buildAddressLine1(customer),
      Addr2: customer.building_name || customer.county || '',
      Town: customer.town || '',
      PCode: customer.postcode || '',
      Tel: customer.phone || '',
      Mobile: customer.phone || '',
      EMail: customer.email,
      PurDate: policy.policy_start_date ? new Date(policy.policy_start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      Make: customer.vehicle_make || '',
      Model: customer.vehicle_model || '',
      RegNum: customer.registration_plate || '',
      Mileage: String(Math.floor(parseFloat(customer.mileage || '50000'))), // Whole number as string
      EngSize: estimateEngineSize(customer.vehicle_make, customer.vehicle_model),
      PurPrc: String(Math.floor(policy.payment_amount || 0)),
      RegDate: customer.vehicle_year ? `${customer.vehicle_year}-01-01` : '2020-01-01',
      WarType: getWarrantyType(policy.plan_type || ''),
      Month: getWarrantyDuration(policy.payment_type || ''),
      MaxClm: getMaxClaimAmount(policy.plan_type || ''),
      Notes: `Policy: ${policy.policy_number || ''} | Customer: ${customer.name}`,
      Ref: policy.warranty_number || policy.id,
      MOTDue: estimateMOTDue(customer.vehicle_year)
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

// Helper functions for Warranties 2000 API mapping per specification

function getWarrantyDuration(paymentType: string): string {
  // Duration must be from predefined list - using standard monthly values
  switch (paymentType.toLowerCase()) {
    case 'monthly': return '12';
    case 'yearly': return '12'; 
    case 'twoyear': return '24';
    case 'threeyear': return '36';
    default: return '12';
  }
}

function getMaxClaimAmount(planType: string): string {
  // MaxClm expects full amounts as strings per API specification
  switch (planType.toLowerCase()) {
    case 'basic': return '500'; // £500
    case 'gold': return '1000'; // £1000
    case 'platinum': return '1200'; // £1200
    case 'phev': return '1000'; // £1000
    case 'ev': return '1000'; // £1000
    case 'motorbike': return '1000'; // £1000
    default: return '500'; // £500 default
  }
}

function getWarrantyType(planType: string): string {
  // WarType must be from predefined values in their system
  switch (planType.toLowerCase()) {
    case 'basic': return 'BBASIC';
    case 'gold': return 'BGOLD';
    case 'platinum': return 'BPLATINUM';
    case 'phev': return 'BPHEV';
    case 'ev': return 'BEV';
    case 'motorbike': return 'BMOTORBIKE';
    default: return 'BBASIC';
  }
}

function extractTitle(fullName: string): string {
  const name = fullName.toLowerCase();
  if (name.includes('mr.') || name.includes('mr ')) return 'Mr';
  if (name.includes('mrs.') || name.includes('mrs ')) return 'Mrs';
  if (name.includes('ms.') || name.includes('ms ')) return 'Ms';
  if (name.includes('miss')) return 'Miss';
  if (name.includes('dr.') || name.includes('dr ')) return 'Dr';
  return 'Mr'; // Default
}

function extractFirstName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    const firstPart = parts[0].toLowerCase();
    if (['mr', 'mrs', 'ms', 'miss', 'dr', 'mr.', 'mrs.', 'ms.', 'dr.'].includes(firstPart)) {
      return parts[1] || 'Unknown';
    }
    return parts[0] || 'Unknown';
  }
  return fullName || 'Unknown';
}

function extractSurname(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    const firstPart = parts[0].toLowerCase();
    if (['mr', 'mrs', 'ms', 'miss', 'dr', 'mr.', 'mrs.', 'ms.', 'dr.'].includes(firstPart)) {
      return parts.slice(2).join(' ') || parts[1] || 'Unknown';
    }
    return parts.slice(1).join(' ') || 'Unknown';
  }
  return 'Unknown';
}

function buildAddressLine1(customer: any): string {
  const addressParts = [];
  if (customer.flat_number) addressParts.push(customer.flat_number);
  if (customer.building_number) addressParts.push(customer.building_number);
  if (customer.street) addressParts.push(customer.street);
  return addressParts.join(' ').trim() || '123 Unknown Street';
}

function estimateEngineSize(make?: string, model?: string): string {
  // Provide reasonable engine size estimates based on common vehicles
  if (!make || !model) return '1.6';
  
  const makeModel = `${make} ${model}`.toLowerCase();
  
  // Common engine sizes for popular makes/models
  if (makeModel.includes('mini') || makeModel.includes('smart')) return '1.0';
  if (makeModel.includes('fiesta') || makeModel.includes('polo') || makeModel.includes('corsa')) return '1.2';
  if (makeModel.includes('focus') || makeModel.includes('golf') || makeModel.includes('astra')) return '1.6';
  if (makeModel.includes('bmw') || makeModel.includes('audi') || makeModel.includes('mercedes')) return '2.0';
  if (makeModel.includes('range rover') || makeModel.includes('x5') || makeModel.includes('q7')) return '3.0';
  
  return '1.6'; // Default
}

function estimateMOTDue(vehicleYear?: string): string {
  if (!vehicleYear) return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const year = parseInt(vehicleYear);
  const currentYear = new Date().getFullYear();
  
  // MOT due is typically annual after the vehicle is 3 years old
  if (currentYear - year > 3) {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
  // For newer vehicles, MOT due would be when they turn 3
  const motDueYear = year + 3;
  return `${motDueYear}-01-01`;
}

serve(handler);