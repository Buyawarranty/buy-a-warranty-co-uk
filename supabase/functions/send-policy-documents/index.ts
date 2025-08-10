import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-POLICY-DOCUMENTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { recipientEmail, variables } = await req.json();
    const { planType, customerName } = variables || {};
    logStep("Request data", { recipientEmail, planType, customerName });

    if (!recipientEmail || !planType) {
      throw new Error("Missing required parameters");
    }

    // Get the policy documents email template
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', 'Policy Documents Email')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error("Policy Documents Email template not found");
    }

    logStep("Found policy documents template", { templateId: template.id });

    // Fetch plan-specific document
    const attachments = [];
    
    const planTypeMapping: Record<string, string> = {
      'basic': 'basic',
      'gold': 'gold', 
      'platinum': 'platinum',
      'electric': 'electric',
      'ev': 'electric',  // Map EV to electric
      'phev': 'phev',
      'hybrid': 'phev',  // Map hybrid to phev
      'motorbike': 'motorbike',
      'motorbike extended warranty': 'motorbike'
    };

    const mappedPlanType = planTypeMapping[planType.toLowerCase()] || planType.toLowerCase();
    logStep("Fetching plan-specific document", { planType, mappedPlanType });
    
    const { data: planDoc, error: planError } = await supabaseClient
      .from('customer_documents')
      .select('document_name, file_url')
      .eq('plan_type', mappedPlanType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planDoc && !planError) {
      try {
        logStep("Attempting to fetch plan document", { url: planDoc.file_url });
        const response = await fetch(planDoc.file_url);
        logStep("Fetch response status", { status: response.status, ok: response.ok });
        
        if (response.ok) {
          const fileBuffer = await response.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
          
          attachments.push({
            filename: planDoc.document_name.endsWith('.pdf') ? planDoc.document_name : `${planDoc.document_name}.pdf`,
            content: base64Content,
            type: 'application/pdf'
          });
          logStep("Plan document prepared for attachment", { filename: planDoc.document_name, size: fileBuffer.byteLength });
        } else {
          logStep("Failed to fetch plan document", { status: response.status, statusText: response.statusText });
        }
      } catch (error) {
        logStep("Error preparing plan document", { error: error.message, stack: error.stack });
      }
    } else {
      logStep("No plan-specific document found", { planType: mappedPlanType, error: planError });
    }

    // Fetch terms and conditions document
    const { data: termsDoc, error: termsError } = await supabaseClient
      .from('customer_documents')
      .select('document_name, file_url')
      .eq('plan_type', 'terms-and-conditions')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (termsDoc && !termsError) {
      try {
        logStep("Attempting to fetch terms document", { url: termsDoc.file_url });
        const response = await fetch(termsDoc.file_url);
        logStep("Fetch response status for terms", { status: response.status, ok: response.ok });
        
        if (response.ok) {
          const fileBuffer = await response.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
          
          attachments.push({
            filename: termsDoc.document_name.endsWith('.pdf') ? termsDoc.document_name : `${termsDoc.document_name}.pdf`,
            content: base64Content,
            type: 'application/pdf'
          });
          logStep("Terms document prepared for attachment", { filename: termsDoc.document_name, size: fileBuffer.byteLength });
        } else {
          logStep("Failed to fetch terms document", { status: response.status, statusText: response.statusText });
        }
      } catch (error) {
        logStep("Error preparing terms document", { error: error.message, stack: error.stack });
      }
    }

    // Send policy documents email using the template
    const emailVariables = {
      customerName: customerName || recipientEmail.split('@')[0],
      planType: planType
    };

    const emailPayload: any = {
      templateId: template.name,
      recipientEmail: recipientEmail,
      variables: emailVariables
    };

    // Add attachments if any were successfully fetched
    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
      logStep("Attachments added to email", { count: attachments.length });
    }

    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: emailPayload
    });

    if (emailError) {
      throw new Error(`Failed to send policy documents email: ${emailError.message}`);
    }

    logStep("Policy documents email sent successfully", emailResult);

    // Log the email send
    await supabaseClient
      .from('email_logs')
      .insert({
        template_id: template.id,
        recipient_email: recipientEmail,
        subject: template.subject,
        status: 'sent',
        metadata: {
          plan_type: planType,
          attachments_count: attachments.length
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Policy documents email sent successfully",
      attachments_sent: attachments.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-policy-documents", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});