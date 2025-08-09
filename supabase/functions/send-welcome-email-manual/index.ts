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

interface EmailRequest {
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
    console.log(JSON.stringify({ evt: "email.start", rid }));
    
    // Check environment variables at startup
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const resendFrom = Deno.env.get('RESEND_FROM') || 'Buy A Warranty <info@buyawarranty.co.uk>';
    
    console.log(JSON.stringify({ 
      evt: "env.check", 
      rid,
      hasResendKey: !!resendApiKey,
      hasFrom: !!resendFrom
    }));
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid, 
        code: 'MISSING_ENV', 
        error: 'RESEND_API_KEY not configured' 
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Parse request body
    const body: EmailRequest = await req.json().catch(() => ({}));
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
          id, name, email, first_name, last_name
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
      email: customer.email,
      warrantyNumber: policy.warranty_number,
      planType: policy.plan_type
    }));

    // Check idempotency
    if (policy.email_sent_status === 'sent') {
      console.log(JSON.stringify({ evt: "already.sent", rid, policyId: policy.id }));
      return new Response(JSON.stringify({ 
        ok: true, 
        rid,
        already: true, 
        message: 'Email already sent for this policy'
      }), {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Generate warranty number if missing
    if (!policy.warranty_number) {
      const { data: warrantyNumber, error: warrantyError } = await supabase.rpc('generate_warranty_number');
      if (warrantyError) {
        return new Response(JSON.stringify({ 
          ok: false, 
          rid,
          code: 'WARRANTY_NUMBER_ERROR', 
          error: warrantyError.message 
        }), {
          status: 500,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }

      policy.warranty_number = warrantyNumber;
      await supabase
        .from('customer_policies')
        .update({ warranty_number: policy.warranty_number })
        .eq('id', policy.id);
    }

    // Get PDF documents - try multiple approaches
    console.log(JSON.stringify({ evt: "pdf.lookup.start", rid, planType: policy.plan_type }));
    
    let attachments = [];
    
    // 1. Try plan_document_mapping first
    const { data: documentMapping } = await supabase
      .from('plan_document_mapping')
      .select('document_path')
      .eq('plan_name', policy.plan_type.toLowerCase())
      .eq('vehicle_type', 'standard')
      .maybeSingle();

    console.log(JSON.stringify({ evt: "plan.mapping.result", rid, documentMapping }));

    // 2. Build list of possible PDF paths to try
    let pdfPaths = [];
    if (documentMapping?.document_path) {
      pdfPaths.push(documentMapping.document_path);
    }
    
    // Add common plan naming patterns
    const planLower = policy.plan_type.toLowerCase().replace(/\s+/g, '-');
    const possiblePaths = [
      `${planLower}-warranty.pdf`,
      `${planLower}.pdf`,
      `plan-${planLower}.pdf`,
      `${policy.plan_type}.pdf`,
      `${policy.plan_type}-warranty.pdf`,
      'terms-and-conditions.pdf'
    ];
    
    pdfPaths.push(...possiblePaths);
    
    console.log(JSON.stringify({ evt: "pdf.paths.to.try", rid, paths: pdfPaths }));

    // Try to download each PDF
    for (const pdfPath of pdfPaths) {
      try {
        console.log(JSON.stringify({ evt: "pdf.download.attempt", rid, path: pdfPath }));
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('policy-documents')
          .download(pdfPath);

        if (!downloadError && fileData) {
          const fileSize = fileData.size;
          console.log(JSON.stringify({ evt: "pdf.found", rid, path: pdfPath, bytes: fileSize }));
          
          if (fileSize > 10 * 1024 * 1024) { // 10MB limit
            console.log(JSON.stringify({ evt: "pdf.too.large", rid, path: pdfPath, bytes: fileSize }));
            continue;
          }

          // Convert to base64 for attachment
          const buffer = await fileData.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          const base64Content = btoa(String.fromCharCode(...uint8Array));
          
          let filename;
          if (pdfPath.includes('terms')) {
            filename = 'Terms-and-Conditions.pdf';
          } else {
            filename = `${policy.plan_type}-Warranty-${policy.warranty_number}.pdf`;
          }
          
          attachments.push({
            filename,
            content: base64Content,
            content_type: 'application/pdf'
          });
          
          console.log(JSON.stringify({ 
            evt: "pdf.prepared", 
            rid, 
            path: pdfPath,
            filename,
            base64Length: base64Content.length 
          }));
          
          // Only get first plan document, but continue looking for terms
          if (!pdfPath.includes('terms') && attachments.length >= 1) {
            break;
          }
        } else {
          console.log(JSON.stringify({ evt: "pdf.not.found", rid, path: pdfPath, error: downloadError?.message }));
        }
      } catch (error) {
        console.log(JSON.stringify({ 
          evt: "pdf.error", 
          rid, 
          path: pdfPath,
          error: error instanceof Error ? error.message : String(error) 
        }));
      }
    }
    
    console.log(JSON.stringify({ evt: "pdf.final.count", rid, attachmentCount: attachments.length }));

    // Send email via Resend REST API
    const customerName = customer.first_name && customer.last_name 
      ? `${customer.first_name} ${customer.last_name}` 
      : customer.name;

    const attachmentText = attachments.length > 0 
      ? `Your warranty documents are attached to this email (${attachments.length} document${attachments.length > 1 ? 's' : ''}).`
      : 'Your warranty documents will be sent separately.';

    const emailPayload = {
      from: resendFrom,
      to: [customer.email],
      subject: `Welcome — Your Warranty ${policy.warranty_number}`,
      html: `
        <h1>Welcome ${customerName}!</h1>
        <p>Thank you for purchasing your ${policy.plan_type} warranty. Your warranty number is: <strong>${policy.warranty_number}</strong></p>
        <p>Your policy details:</p>
        <ul>
          <li>Plan: ${policy.plan_type}</li>
          <li>Payment Type: ${policy.payment_type}</li>
          <li>Policy Start: ${new Date(policy.policy_start_date).toLocaleDateString()}</li>
          <li>Policy End: ${new Date(policy.policy_end_date).toLocaleDateString()}</li>
        </ul>
        <p>${attachmentText}</p>
        <p>If you have any questions, please contact us at info@buyawarranty.co.uk</p>
      `,
      ...(attachments.length > 0 && { attachments })
    };

    console.log(JSON.stringify({ 
      evt: "email.sending", 
      rid, 
      to: customer.email,
      attachmentCount: attachments.length,
      attachmentNames: attachments.map(a => a.filename)
    }));

    const emailResponse = await retryFetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${resendApiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const responseText = await emailResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw_response: responseText.substring(0, 256) };
    }

    console.log(JSON.stringify({ 
      evt: "resend.response", 
      rid, 
      status: emailResponse.status,
      preview: responseText.substring(0, 256) 
    }));

    if (!emailResponse.ok) {
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'EMAIL_SEND_FAILED', 
        error: responseData.message || 'Email send failed',
        details: {
          status: emailResponse.status,
          response: responseData
        }
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Update policy status
    await supabase
      .from('customer_policies')
      .update({
        email_sent_status: 'sent',
        email_sent_at: new Date().toISOString()
      })
      .eq('id', policy.id);

    // Log the event
    await supabase.rpc('log_warranty_event', {
      p_policy_id: policy.id,
      p_customer_id: customer.id,
      p_event_type: 'welcome_email_sent',
      p_event_data: {
        resend_id: responseData.id,
        email: customer.email,
        warranty_number: policy.warranty_number,
        attachments_included: attachments.length,
        attachment_names: attachments.map(a => a.filename)
      },
      p_created_by: 'admin'
    });

    console.log(JSON.stringify({ evt: "email.success", rid, resendId: responseData.id }));
    
    return new Response(JSON.stringify({ 
      ok: true, 
      rid,
      id: responseData.id,
      message: 'Welcome email sent successfully',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      email: customer.email,
      attachmentsIncluded: attachments.length
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