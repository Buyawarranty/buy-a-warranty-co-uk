import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface WarrantySelectionRequest {
  sessionId: string;
  customerEmail: string;
  selectedPlanId?: string;
  selectedPlanName: string;
  paymentType: string;
  quotedPrice: number;
  vehicleData: any;
  customerData: any;
  addOns?: any;
  discountApplied?: any;
  action: 'log' | 'verify' | 'sync' | 'retry';
  auditId?: string;
}

// Log warranty selection at checkout with tamper-proof checksum
async function logWarrantySelection(data: WarrantySelectionRequest) {
  console.log('[WARRANTY-LOGGER] Logging warranty selection:', {
    sessionId: data.sessionId,
    customerEmail: data.customerEmail,
    planName: data.selectedPlanName,
    paymentType: data.paymentType,
    price: data.quotedPrice
  });

  // Generate tamper-proof checksum
  const { data: checksumData, error: checksumError } = await supabase
    .rpc('generate_warranty_audit_checksum', {
      session_id: data.sessionId,
      customer_email: data.customerEmail,
      selected_plan_name: data.selectedPlanName,
      payment_type: data.paymentType,
      quoted_price: data.quotedPrice
    });

  if (checksumError) {
    console.error('[WARRANTY-LOGGER] Checksum generation failed:', checksumError);
    throw new Error('Failed to generate security checksum');
  }

  // Insert audit record
  const { data: auditRecord, error: insertError } = await supabase
    .from('warranty_selection_audit')
    .insert({
      session_id: data.sessionId,
      customer_email: data.customerEmail,
      selected_plan_id: data.selectedPlanId,
      selected_plan_name: data.selectedPlanName,
      payment_type: data.paymentType,
      quoted_price: data.quotedPrice,
      vehicle_data: data.vehicleData,
      customer_data: data.customerData,
      add_ons: data.addOns || {},
      discount_applied: data.discountApplied || {},
      checksum: checksumData
    })
    .select()
    .single();

  if (insertError) {
    console.error('[WARRANTY-LOGGER] Insert failed:', insertError);
    throw new Error('Failed to log warranty selection');
  }

  console.log('[WARRANTY-LOGGER] Selection logged successfully:', auditRecord.id);
  
  // Start background verification and sync (using Promise.resolve for Deno compatibility)
  Promise.resolve().then(() => verifyAndSyncWarrantySelection(auditRecord.id));

  return auditRecord;
}

// Verify warranty selection against available plans
async function verifyWarrantySelection(auditId: string) {
  console.log('[WARRANTY-LOGGER] Verifying warranty selection:', auditId);

  const { data, error } = await supabase
    .rpc('verify_warranty_selection', { audit_id: auditId });

  if (error) {
    console.error('[WARRANTY-LOGGER] Verification failed:', error);
    throw new Error('Failed to verify warranty selection');
  }

  console.log('[WARRANTY-LOGGER] Verification result:', data);
  return data;
}

// Sync to admin dashboard and W2000 with retry logic
async function verifyAndSyncWarrantySelection(auditId: string) {
  try {
    console.log('[WARRANTY-LOGGER] Starting verification and sync for:', auditId);

    // Step 1: Verify selection
    const verificationResult = await verifyWarrantySelection(auditId);
    
    if (verificationResult.status !== 'valid') {
      console.error('[WARRANTY-LOGGER] Verification failed:', verificationResult.errors);
      return;
    }

    // Step 2: Get audit record for sync
    const { data: auditRecord, error: fetchError } = await supabase
      .from('warranty_selection_audit')
      .select('*')
      .eq('id', auditId)
      .single();

    if (fetchError || !auditRecord) {
      console.error('[WARRANTY-LOGGER] Failed to fetch audit record:', fetchError);
      return;
    }

    // Step 3: Sync to admin dashboard (create customer/policy records)
    await syncToAdminDashboard(auditRecord);

    // Step 4: Sync to Warranties 2000
    await syncToWarranties2000(auditRecord);

  } catch (error) {
    console.error('[WARRANTY-LOGGER] Sync failed:', error);
    
    // Implement retry logic
    await scheduleRetry(auditId);
  }
}

// Sync to admin dashboard by creating customer and policy records
async function syncToAdminDashboard(auditRecord: any) {
  try {
    console.log('[WARRANTY-LOGGER] Syncing to admin dashboard:', auditRecord.id);

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', auditRecord.customer_email)
      .maybeSingle();

    let customerId = existingCustomer?.id;

    if (!customerId) {
      // Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: auditRecord.customer_data.name || `${auditRecord.customer_data.firstName} ${auditRecord.customer_data.lastName}`,
          email: auditRecord.customer_email,
          first_name: auditRecord.customer_data.firstName,
          last_name: auditRecord.customer_data.lastName,
          phone: auditRecord.customer_data.phone,
          plan_type: auditRecord.selected_plan_name,
          payment_type: auditRecord.payment_type,
          registration_plate: auditRecord.vehicle_data.registrationNumber,
          vehicle_make: auditRecord.vehicle_data.make,
          vehicle_model: auditRecord.vehicle_data.model,
          vehicle_year: auditRecord.vehicle_data.year,
          mileage: auditRecord.vehicle_data.mileage,
          // Address data
          building_number: auditRecord.customer_data.addressLine1?.split(' ')[0],
          street: auditRecord.customer_data.addressLine1,
          town: auditRecord.customer_data.city,
          county: auditRecord.customer_data.county,
          postcode: auditRecord.customer_data.postcode,
          // Add-ons
          tyre_cover: auditRecord.add_ons.tyreCover || false,
          breakdown_recovery: auditRecord.add_ons.breakdown || false,
          vehicle_rental: auditRecord.add_ons.vehicleRental || false,
          mot_fee: auditRecord.add_ons.motFee || false,
          // Pricing
          final_amount: auditRecord.quoted_price,
          discount_code: auditRecord.discount_applied.code,
          discount_amount: auditRecord.discount_applied.amount || 0
        })
        .select()
        .single();

      if (customerError) {
        console.error('[WARRANTY-LOGGER] Customer creation failed:', customerError);
        throw customerError;
      }

      customerId = newCustomer.id;
    }

    // Create policy record
    const policyEndDate = new Date();
    const durationMonths = getWarrantyDurationInMonths(auditRecord.payment_type);
    policyEndDate.setMonth(policyEndDate.getMonth() + durationMonths);

    const { error: policyError } = await supabase
      .from('customer_policies')
      .insert({
        customer_id: customerId,
        email: auditRecord.customer_email,
        plan_type: auditRecord.selected_plan_name,
        payment_type: auditRecord.payment_type,
        policy_start_date: new Date().toISOString(),
        policy_end_date: policyEndDate.toISOString(),
        payment_amount: auditRecord.quoted_price,
        // Add-ons
        tyre_cover: auditRecord.add_ons.tyreCover || false,
        breakdown_recovery: auditRecord.add_ons.breakdown || false,
        vehicle_rental: auditRecord.add_ons.vehicleRental || false,
        mot_fee: auditRecord.add_ons.motFee || false,
        // Default values
        claim_limit: 1250,
        voluntary_excess: 150,
        status: 'active'
      });

    if (policyError) {
      console.error('[WARRANTY-LOGGER] Policy creation failed:', policyError);
      throw policyError;
    }

    // Update audit record
    await supabase
      .from('warranty_selection_audit')
      .update({
        admin_sync_status: 'completed',
        admin_sync_at: new Date().toISOString()
      })
      .eq('id', auditRecord.id);

    console.log('[WARRANTY-LOGGER] Admin dashboard sync completed');

  } catch (error) {
    console.error('[WARRANTY-LOGGER] Admin sync failed:', error);
    
    await supabase
      .from('warranty_selection_audit')
      .update({
        admin_sync_status: 'failed'
      })
      .eq('id', auditRecord.id);
    
    throw error;
  }
}

// Sync to Warranties 2000 API
async function syncToWarranties2000(auditRecord: any) {
  try {
    console.log('[WARRANTY-LOGGER] Syncing to Warranties 2000:', auditRecord.id);

    // Find customer and policy records
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', auditRecord.customer_email)
      .single();

    const { data: policy } = await supabase
      .from('customer_policies')
      .select('*')
      .eq('customer_id', customer?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!customer || !policy) {
      throw new Error('Customer or policy not found for W2000 sync');
    }

    // Call send-to-warranties-2000 function
    const { data: w2000Response, error: w2000Error } = await supabase.functions.invoke(
      'send-to-warranties-2000',
      {
        body: {
          policyId: policy.id,
          customerId: customer.id
        }
      }
    );

    if (w2000Error) {
      throw w2000Error;
    }

    // Update audit record
    await supabase
      .from('warranty_selection_audit')
      .update({
        w2000_sync_status: 'completed',
        w2000_sync_at: new Date().toISOString(),
        w2000_response: w2000Response
      })
      .eq('id', auditRecord.id);

    console.log('[WARRANTY-LOGGER] W2000 sync completed');

  } catch (error) {
    console.error('[WARRANTY-LOGGER] W2000 sync failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await supabase
      .from('warranty_selection_audit')
      .update({
        w2000_sync_status: 'failed',
        w2000_response: { error: errorMessage }
      })
      .eq('id', auditRecord.id);
    
    throw error;
  }
}

// Schedule retry for failed operations
async function scheduleRetry(auditId: string) {
  const { data: auditRecord } = await supabase
    .from('warranty_selection_audit')
    .select('retry_count')
    .eq('id', auditId)
    .single();

  const retryCount = (auditRecord?.retry_count || 0) + 1;
  const maxRetries = 5;

  if (retryCount <= maxRetries) {
    await supabase
      .from('warranty_selection_audit')
      .update({
        retry_count: retryCount,
        last_retry_at: new Date().toISOString()
      })
      .eq('id', auditId);

    // Schedule retry with exponential backoff
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
    
    setTimeout(() => {
      Promise.resolve().then(() => verifyAndSyncWarrantySelection(auditId));
    }, retryDelay);

    console.log(`[WARRANTY-LOGGER] Scheduled retry ${retryCount}/${maxRetries} in ${retryDelay}ms`);
  } else {
    console.error(`[WARRANTY-LOGGER] Max retries (${maxRetries}) exceeded for audit ID: ${auditId}`);
  }
}

// Utility function for warranty duration
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
      return 12;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: WarrantySelectionRequest = await req.json();
    
    console.log('[WARRANTY-LOGGER] Request received:', {
      action: requestData.action,
      sessionId: requestData.sessionId,
      customerEmail: requestData.customerEmail
    });

    let result;

    switch (requestData.action) {
      case 'log':
        result = await logWarrantySelection(requestData);
        break;
        
      case 'verify':
        if (!requestData.auditId) {
          throw new Error('Audit ID required for verification');
        }
        result = await verifyWarrantySelection(requestData.auditId);
        break;
        
      case 'sync':
        if (!requestData.auditId) {
          throw new Error('Audit ID required for sync');
        }
        Promise.resolve().then(() => verifyAndSyncWarrantySelection(requestData.auditId!));
        result = { message: 'Sync started' };
        break;
        
      case 'retry':
        if (!requestData.auditId) {
          throw new Error('Audit ID required for retry');
        }
        Promise.resolve().then(() => verifyAndSyncWarrantySelection(requestData.auditId!));
        result = { message: 'Retry started' };
        break;
        
      default:
        throw new Error('Invalid action specified');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[WARRANTY-LOGGER] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});