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

interface Warranties2000Registration {
  Title: string;
  First: string; 
  Surname: string;
  Addr1: string;
  Addr2?: string;
  Town: string;
  PCode: string;
  Tel: string;
  Mobile: string;
  EMail: string;
  PurDate: string; // yyyy-mm-dd
  Make: string;
  Model: string;
  RegNum: string;
  Mileage: string;
  EngSize: string;
  PurPrc: string;
  RegDate: string; // yyyy-mm-dd
  WarType: string; // Must be from predefined list
  Month: string; // Coverage period in months
  MaxClm: string; // Must be from predefined list (full amounts)
  VolEx?: string; // Voluntary excess amount
  Notes?: string;
  Ref?: string; // Your reference
  MOTDue?: string; // yyyy-mm-dd
  // Add-ons (using w2000 API field names)
  TyreCover?: string; // Y/N
  WearTear?: string; // Y/N
  EuroCover?: string; // Y/N
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const body: Warranties2000Request = await req.json();
  const { policyId, customerId } = body;
  
  console.log(`[WARRANTIES-2000] Function started with:`, { 
    policyId, 
    customerId,
    hasPolicyId: !!policyId,
    hasCustomerId: !!customerId
  });
  
  try {
    let policy = null;
    let customer = null;

    // Enhanced data fetching with better error handling (using same pattern as working manual function)
    if (policyId) {
      console.log(`[WARRANTIES-2000] Fetching policy by ID: ${policyId}`);
      const { data: policyData, error: policyError } = await supabase
        .from('customer_policies')
        .select(`
          *,
          customers!customer_id (
            id, name, email, first_name, last_name, phone,
            registration_plate, vehicle_make, vehicle_model, vehicle_year,
            mileage, flat_number, building_name, building_number,
            street, town, county, postcode, country, plan_type, payment_type,
            final_amount, warranty_reference_number, voluntary_excess
          )
        `)
        .eq('id', policyId)
        .single();

      if (policyError) {
        console.error(`[WARRANTIES-2000] Policy fetch error:`, policyError);
        throw new Error(`Failed to fetch policy: ${policyError.message}`);
      }

      policy = policyData;
      customer = policyData.customers;
      console.log(`[WARRANTIES-2000] Found policy:`, { 
        policyNumber: policy?.policy_number,
        customerEmail: customer?.email,
        planType: policy?.plan_type
      });
    } else if (customerId) {
      console.log(`[WARRANTIES-2000] Fetching customer by ID: ${customerId}`);
      
      // Get customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) {
        console.error(`[WARRANTIES-2000] Customer fetch error:`, customerError);
        throw new Error(`Failed to fetch customer: ${customerError.message}`);
      }

      customer = customerData;

      // Then get their most recent policy
      const { data: policyData, error: policyError } = await supabase
        .from('customer_policies')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (policyError) {
        console.log(`[WARRANTIES-2000] No policy found for customer, using customer data only:`, policyError);
        // Continue without policy data - use customer data only
      } else {
        policy = policyData;
      }
      
      console.log(`[WARRANTIES-2000] Found customer:`, { 
        customerEmail: customer?.email,
        policyNumber: policy?.policy_number || 'No policy',
        planType: policy?.plan_type || customer?.plan_type
      });
    } else {
      throw new Error('Either policyId or customerId must be provided');
    }

    if (!customer) {
      throw new Error('Customer data not found');
    }

    console.log(`[WARRANTIES-2000] Data validation passed:`, {
      hasPolicy: !!policy,
      hasCustomer: !!customer,
      customerName: customer.name || customer.first_name || 'Unknown',
      registrationPlate: customer.registration_plate || 'N/A'
    });

    // Get environment variables
    const warrantiesUsername = Deno.env.get('WARRANTIES_2000_USERNAME');
    const warrantiesPassword = Deno.env.get('WARRANTIES_2000_PASSWORD');

    if (!warrantiesUsername || !warrantiesPassword) {
      throw new Error('Warranties 2000 credentials not configured');
    }

    // Map plan types to warranty types (exact API values)
    const warrantyTypeMapping: Record<string, string> = {
      'basic': 'B-BASIC',
      'gold': 'B-GOLD', 
      'platinum': 'B-PLATINUM',
      'electric': 'B-EV',
      'ev': 'B-EV',
      'phev': 'B-PHEV',
      'hybrid': 'B-PHEV',
      'motorbike': 'B-MOTORBIKE',
      'motorcycle': 'B-MOTORBIKE'
    };

    // Use policy data if available, otherwise fall back to customer data
    const planType = (policy?.plan_type || customer.plan_type || 'basic').toLowerCase();
    const warrantyType = warrantyTypeMapping[planType] || 'B-BASIC';

    // Calculate coverage months using the master function from warrantyDurationUtils
    const paymentType = policy?.payment_type || customer.payment_type || 'yearly';
    
    // Use the same logic as the frontend for consistency
    function getWarrantyDurationInMonths(paymentType: string): number {
      const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '').trim();
      
      switch (normalizedPaymentType) {
        case 'monthly':
        case '1month':
        case 'month':
        case '12months':
        case '12month':
        case 'yearly':
          return 12;
        case '24months':
        case '24month':
        case 'twomonthly':
        case '2monthly':
        case 'twoyearly':
          return 24;
        case '36months':
        case '36month':
        case 'threemonthly':
        case '3monthly':
        case 'threeyearly':
          return 36;
        case '48months':
        case '48month':
        case 'fourmonthly':
        case '4monthly':
          return 48;
        case '60months':
        case '60month':
        case 'fivemonthly':
        case '5monthly':
          return 60;
        default:
          console.warn(`Unknown payment type: ${paymentType}, defaulting to 12 months`);
          return 12;
      }
    }
    
    const coverageMonths = getWarrantyDurationInMonths(paymentType).toString();

    // Calculate max claim amount based on plan type
    const maxClaimMapping: Record<string, string> = {
      'basic': '500',
      'gold': '1000', 
      'platinum': '1200',
      'electric': '1500',
      'phev': '1500',
      'hybrid': '1500',
      'motorbike': '750',
      'motorcycle': '750'
    };

    const maxClaimAmount = maxClaimMapping[planType] || '500';

    // Build the registration data with validation (using same format as working manual function)
    const registrationData: Warranties2000Registration = {
      Title: "Mr",
      First: customer.first_name || customer.name?.split(' ')[0] || "Customer",
      Surname: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || "Name",
      Addr1: customer.building_number && customer.street 
        ? `${customer.building_number} ${customer.street}` 
        : customer.street || "Address Line 1",
      Addr2: customer.building_name || customer.flat_number || "",
      Town: customer.town || "Town",
      PCode: customer.postcode || "UNKNOWN",
      Tel: customer.phone || "N/A",
      Mobile: customer.phone || "N/A",
      EMail: customer.email,
      PurDate: new Date().toISOString().split('T')[0], // Today's date
      Make: customer.vehicle_make || "UNKNOWN",
      Model: customer.vehicle_model || "UNKNOWN",
      RegNum: customer.registration_plate || "UNKNOWN",
      Mileage: customer.mileage || "50000",
      EngSize: "1968", // Default engine size
      PurPrc: "1", // Default purchase price - actual price kept private on admin dashboard
      RegDate: customer.vehicle_year ? `${customer.vehicle_year}-01-01` : "2020-01-01",
      WarType: warrantyType,
      Month: coverageMonths,
      MaxClm: maxClaimAmount,
      MOTDue: (() => {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear.toISOString().split('T')[0];
      })(),
      Ref: policy?.policy_number || policy?.warranty_number || customer.warranty_reference_number || `REF-${Date.now()}`,
      VolEx: (customer.voluntary_excess || 0).toString(),
      Notes: `Plan: ${customer.plan_type || 'N/A'} | Payment: ${paymentType || 'N/A'}`,
      // Add-ons using w2000 API field names (exclude transfer cover as requested)
      TyreCover: policy?.tyre_cover ? 'Y' : 'N',
      WearTear: policy?.wear_tear ? 'Y' : 'N',
      EuroCover: policy?.europe_cover ? 'Y' : 'N'
      // Note: Transfer cover is not sent to W2000 as per requirements
    };

    console.log(`[WARRANTIES-2000] Sending registration data:`, {
      regNum: registrationData.RegNum,
      warType: registrationData.WarType,
      customerEmail: registrationData.EMail,
      ref: registrationData.Ref
    });

    // Create basic auth header (same as working warranties-2000-registration function)
    const credentials = btoa(`${warrantiesUsername}:${warrantiesPassword}`);

    const apiUrl = Deno.env.get('W2K_API_URL') || 'https://warranties-epf.co.uk/api.php';

    console.log(`[WARRANTIES-2000] Making API call to: ${apiUrl}`);

    const response = await retryFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'BuyAWarranty-Integration/1.0',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(registrationData),
    });

    const responseText = await response.text();
    console.log(`[WARRANTIES-2000] API Response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText
    });

    // Update the customer_policies table with warranty registration status
    if (policy?.id) {
      const updateData = {
        warranties_2000_sent_at: new Date().toISOString(),
        warranties_2000_status: response.ok ? 'sent' : 'failed',
        warranties_2000_response: {
          status: response.status,
          response: responseText,
          timestamp: new Date().toISOString()
        }
      };

      const { error: updateError } = await supabase
        .from('customer_policies')
        .update(updateData)
        .eq('id', policy.id);

      if (updateError) {
        console.error(`[WARRANTIES-2000] Failed to update policy status:`, updateError);
      } else {
        console.log(`[WARRANTIES-2000] Updated policy status successfully`);
      }
    }

    if (!response.ok) {
      console.error(`[WARRANTIES-2000] API call failed:`, {
        status: response.status,
        response: responseText
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: `Warranties 2000 API error: ${response.status} ${response.statusText}`,
        response: responseText,
        registrationData: registrationData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[WARRANTIES-2000] Registration successful`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Warranty registered successfully with Warranties 2000',
      registrationData: registrationData,
      response: responseText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[WARRANTIES-2000] Error:`, error);
    
    // Update policy status on error if we have a policy ID
    if (body.policyId) {
      try {
        await supabase
          .from('customer_policies')
          .update({
            warranties_2000_sent_at: new Date().toISOString(),
            warranties_2000_status: 'failed',
            warranties_2000_response: {
              error: error.message,
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', body.policyId);
      } catch (updateError) {
        console.error(`[WARRANTIES-2000] Failed to update error status:`, updateError);
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});