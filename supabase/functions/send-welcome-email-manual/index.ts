import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface ManualEmailRequest {
  policyId?: string;
  customerId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Manual Welcome Email Send Started ===');
    
    // Validate environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'MISSING_ENV', 
        message: 'RESEND_API_KEY not configured' 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { policyId, customerId }: ManualEmailRequest = await req.json();
    console.log('Request body parsed:', { policyId, customerId });
    
    if (!policyId && !customerId) {
      console.error('Missing required parameters');
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
    console.log('Looking up policy and customer data...');
    let policy;
    let customer;

    if (policyId) {
      console.log('Getting policy by ID:', policyId);
      const { data: policyData, error: policyError } = await supabase
        .from('customer_policies')
        .select('*')
        .eq('id', policyId)
        .maybeSingle();

      console.log('Policy query result:', { policyData, policyError });

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

      if (!policyData) {
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

      policy = policyData;

      // Get customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', policy.customer_id)
        .maybeSingle();

      console.log('Customer query result:', { customerData, customerError });

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        return new Response(JSON.stringify({ 
          ok: false, 
          code: 'CUSTOMER_FETCH_ERROR', 
          message: customerError.message 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      customer = customerData;
    } else {
      console.log('Getting customer by ID:', customerId);
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_policies!customer_id(*)
        `)
        .eq('id', customerId)
        .maybeSingle();

      console.log('Customer with policies result:', { customerData, customerError });

      if (customerError) {
        console.error('Error fetching customer:', customerError);
        return new Response(JSON.stringify({ 
          ok: false, 
          code: 'CUSTOMER_FETCH_ERROR', 
          message: customerError.message 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (!customerData) {
        console.error('Customer not found');
        return new Response(JSON.stringify({ 
          ok: false, 
          code: 'CUSTOMER_NOT_FOUND', 
          message: 'Customer not found' 
        }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      customer = customerData;
      
      if (!customer.customer_policies || customer.customer_policies.length === 0) {
        console.error('No policies found for customer');
        return new Response(JSON.stringify({ 
          ok: false, 
          code: 'NO_POLICIES', 
          message: 'No policies found for this customer' 
        }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Use the first policy
      policy = customer.customer_policies[0];
    }

    console.log('Found policy and customer:', { 
      policyId: policy.id, 
      customerEmail: customer.email,
      warrantyNumber: policy.warranty_number 
    });

    // Check for idempotency
    if (policy.email_sent_status === 'sent') {
      console.log('Email already sent for this policy');
      return new Response(JSON.stringify({ 
        ok: true, 
        already: true, 
        message: 'Email already sent for this policy',
        policyId: policy.id 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate warranty number if missing
    if (!policy.warranty_number) {
      console.log('Generating warranty number...');
      try {
        const warrantyNumber = await supabase.rpc('generate_warranty_number');
        if (warrantyNumber.error) {
          console.error('Error generating warranty number:', warrantyNumber.error);
          return new Response(JSON.stringify({ 
            ok: false, 
            code: 'WARRANTY_NUMBER_ERROR', 
            message: warrantyNumber.error.message 
          }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        policy.warranty_number = warrantyNumber.data;

        // Update the policy with warranty number
        await supabase
          .from('customer_policies')
          .update({ warranty_number: policy.warranty_number })
          .eq('id', policy.id);

        console.log('Generated and saved warranty number:', policy.warranty_number);
      } catch (error) {
        console.error('Failed to generate warranty number:', error);
        return new Response(JSON.stringify({ 
          ok: false, 
          code: 'WARRANTY_NUMBER_GENERATION_FAILED', 
          message: 'Failed to generate warranty number' 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Get document path
    console.log('Looking up document path...');
    const { data: documentMapping, error: docError } = await supabase
      .from('plan_document_mapping')
      .select('document_path')
      .eq('plan_name', policy.plan_type)
      .eq('vehicle_type', 'standard')
      .maybeSingle();

    console.log('Document mapping result:', { documentMapping, docError });

    let attachmentData;
    if (documentMapping && documentMapping.document_path) {
      try {
        console.log('Downloading PDF from:', documentMapping.document_path);
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('policy-documents')
          .download(documentMapping.document_path);

        if (downloadError) {
          console.error('Error downloading PDF:', downloadError);
        } else if (fileData) {
          const fileSize = fileData.size;
          console.log('PDF file size:', fileSize);
          
          if (fileSize > 10 * 1024 * 1024) { // 10MB limit
            console.error('PDF file too large:', fileSize);
            return new Response(JSON.stringify({ 
              ok: false, 
              code: 'FILE_TOO_LARGE', 
              message: 'PDF file is too large (>10MB)' 
            }), {
              status: 422,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          const buffer = await fileData.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          
          attachmentData = {
            filename: `warranty-${policy.warranty_number}.pdf`,
            content: base64Content,
            contentType: 'application/pdf'
          };
          console.log('PDF prepared for attachment, base64 length:', base64Content.length);
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
      }
    }

    // Send email via Resend
    console.log('Sending email via Resend...');
    const emailPayload = {
      from: 'Buy A Warranty <info@buyawarranty.co.uk>',
      to: [customer.email],
      subject: `Welcome — Your Warranty ${policy.warranty_number}`,
      html: `
        <h1>Welcome ${customer.name}!</h1>
        <p>Thank you for purchasing your warranty. Your warranty number is: <strong>${policy.warranty_number}</strong></p>
        <p>Your policy details:</p>
        <ul>
          <li>Plan: ${policy.plan_type}</li>
          <li>Payment Type: ${policy.payment_type}</li>
          <li>Policy Start: ${new Date(policy.policy_start_date).toLocaleDateString()}</li>
          <li>Policy End: ${new Date(policy.policy_end_date).toLocaleDateString()}</li>
        </ul>
        <p>Your warranty document is attached to this email.</p>
        <p>If you have any questions, please contact us at info@buyawarranty.co.uk</p>
      `,
      attachments: attachmentData ? [attachmentData] : undefined
    };

    console.log('Email payload prepared (without attachment data):', {
      ...emailPayload,
      attachments: attachmentData ? '[PDF attachment included]' : 'none'
    });

    const emailResponse = await resend.emails.send(emailPayload);
    console.log('Resend response:', emailResponse);

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return new Response(JSON.stringify({ 
        ok: false, 
        code: 'EMAIL_SEND_FAILED', 
        message: emailResponse.error.message,
        details: emailResponse.error 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update policy status
    console.log('Updating policy email status...');
    await supabase
      .from('customer_policies')
      .update({
        email_sent_status: 'sent',
        email_sent_at: new Date().toISOString()
      })
      .eq('id', policy.id);

    // Log the event
    console.log('Logging audit event...');
    await supabase.rpc('log_warranty_event', {
      p_policy_id: policy.id,
      p_customer_id: customer.id,
      p_event_type: 'welcome_email_sent',
      p_event_data: {
        resend_id: emailResponse.data?.id,
        email: customer.email,
        warranty_number: policy.warranty_number,
        attachment_included: !!attachmentData
      },
      p_created_by: 'admin'
    });

    console.log('=== Manual Welcome Email Send Complete ===');
    
    return new Response(JSON.stringify({ 
      ok: true, 
      id: emailResponse.data?.id,
      message: 'Welcome email sent successfully',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number,
      email: customer.email
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Unhandled error in manual welcome email send:", error);
    
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