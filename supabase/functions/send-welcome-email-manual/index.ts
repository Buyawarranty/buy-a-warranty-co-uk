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
    
    const { policyId, customerId }: ManualEmailRequest = await req.json();
    console.log('Request body parsed:', { policyId, customerId });
    
    if (!policyId && !customerId) {
      console.error('Missing required parameters');
      throw new Error('Either policyId or customerId is required');
    }

    // Get policy and customer data
    console.log('Looking up policy and customer data...');
    let policy;
    let customer;

    if (policyId) {
      console.log('Getting policy by ID:', policyId);
      // Get policy by ID
      const { data: policyData, error: policyError } = await supabase
        .from('customer_policies')
        .select('*')
        .eq('id', policyId)
        .maybeSingle();

      console.log('Policy query result:', { policyData, policyError });

      if (policyError || !policyData) {
        console.error('Policy not found:', policyError);
        throw new Error(`Policy not found: ${policyError?.message || 'Unknown error'}`);
      }

      policy = policyData;

      // Get customer by customer_id or email
      if (policy.customer_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', policy.customer_id)
          .maybeSingle();

        if (customerError || !customerData) {
          throw new Error(`Customer not found: ${customerError?.message || 'Unknown error'}`);
        }
        customer = customerData;
      } else {
        // Fallback: find customer by email
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', policy.email)
          .maybeSingle();

        if (customerError || !customerData) {
          // Create a minimal customer object from policy data
          customer = {
            id: policy.id, // Use policy ID as customer ID for this case
            name: policy.customer_full_name || 'Customer',
            email: policy.email
          };
        } else {
          customer = customerData;
        }
      }
    } else {
      // Get customer by customerId and their policies
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          *,
          customer_policies!customer_id(*)
        `)
        .eq('id', customerId)
        .maybeSingle();

      if (customerError || !customerData) {
        throw new Error(`Customer not found: ${customerError?.message || 'Unknown error'}`);
      }

      customer = customerData;
      
      if (!customer.customer_policies || customer.customer_policies.length === 0) {
        throw new Error('No policies found for this customer');
      }

      policy = customer.customer_policies[0]; // Use the first policy
    }

    console.log('Sending manual welcome email for policy:', policy.warranty_number);

    console.log('Checking for idempotency...');
    // Check for idempotency - don't send if already sent recently (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (policy.email_sent_status === 'sent' && 
        policy.email_sent_at && 
        new Date(policy.email_sent_at) > oneHourAgo) {
      
      console.log('Email already sent within the last hour');
      return new Response(JSON.stringify({ 
        error: 'Email already sent within the last hour. Please wait before resending.' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Getting welcome email template...');
    // Get the welcome email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'welcome')
      .eq('is_active', true)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if no template

    console.log('Template query result:', { template, templateError });

    if (templateError) {
      console.error('Template query error:', templateError);
      throw new Error(`Template query failed: ${templateError.message}`);
    }
    
    if (!template) {
      console.error('No welcome email template found');
      throw new Error('Welcome email template not found');
    }

    // Validate mandatory fields
    if (!customer.name) {
      throw new Error('Missing customer name - cannot send email');
    }

    // Generate warranty number if missing
    if (!policy.warranty_number) {
      console.log('Warranty number missing, generating new one...');
      const { data: newWarrantyNumber, error: warrantyError } = await supabase.rpc('generate_warranty_number');
      
      if (warrantyError) {
        throw new Error('Failed to generate warranty number');
      }
      
      // Update the policy with the new warranty number
      const { error: updateError } = await supabase
        .from('customer_policies')
        .update({ warranty_number: newWarrantyNumber })
        .eq('id', policy.id);
        
      if (updateError) {
        console.warn('Failed to update warranty number:', updateError);
      }
      
      policy.warranty_number = newWarrantyNumber;
    }

    // Prepare email variables
    const emailVariables = {
      customer_name: customer.name,
      warranty_number: policy.warranty_number,
      policy_start_date: new Date(policy.policy_start_date).toLocaleDateString('en-GB'),
      policy_end_date: new Date(policy.policy_end_date).toLocaleDateString('en-GB'),
      secure_download_link: `https://buyawarranty.co.uk/download-policy/${policy.id}`,
      plan_type: policy.plan_type || 'Basic'
    };

    // Prepare PDF attachment only if document path exists
    const attachments = [];
    if (policy.pdf_document_path) {
      attachments.push({
        filename: `warranty-policy-${policy.warranty_number}.pdf`,
        content: policy.pdf_document_path,
        type: 'application/pdf'
      });
    }

    // Send welcome email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        templateId: template.id,
        recipientEmail: customer.email,
        customerId: customer.id,
        variables: emailVariables,
        attachments: attachments
      }
    });

    if (emailResponse.error) {
      console.error('Error sending welcome email:', emailResponse.error);
      
      // Update policy status to indicate email failed
      await supabase
        .from('customer_policies')
        .update({ 
          email_sent_status: 'failed',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', policy.id);

      // Log the email failure
      await supabase.rpc('log_warranty_event', {
        p_policy_id: policy.id,
        p_customer_id: customer.id,
        p_event_type: 'email_failed_manual',
        p_event_data: { error: emailResponse.error },
        p_created_by: 'admin'
      });

      throw new Error(`Failed to send email: ${emailResponse.error.message || 'Unknown error'}`);
    } else {
      console.log('Welcome email sent successfully');
      
      // Update policy status to indicate email sent
      await supabase
        .from('customer_policies')
        .update({ 
          email_sent_status: 'sent',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', policy.id);

      // Log the email success
      await supabase.rpc('log_warranty_event', {
        p_policy_id: policy.id,
        p_customer_id: customer.id,
        p_event_type: 'email_sent_manual',
        p_event_data: { 
          template_id: template.id,
          email_id: emailResponse.data?.emailId 
        },
        p_created_by: 'admin'
      });
    }

    console.log('=== Manual Welcome Email Send Complete ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email sent successfully',
      policyId: policy.id,
      warrantyNumber: policy.warranty_number
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in manual welcome email send:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);