
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

// Generate random password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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

    const { email, planType, paymentType, policyNumber } = await req.json();
    logStep("Request data", { email, planType, paymentType, policyNumber });

    if (!email || !planType || !paymentType || !policyNumber) {
      throw new Error("Missing required parameters");
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    logStep("Generated temporary password");

    // Check if user already exists first
    let userId = null;
    let userAlreadyExists = false;
    
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      logStep("User already exists", { userId: existingUser.id });
      userId = existingUser.id;
      userAlreadyExists = true;
      
      // Update existing user's password
      await supabaseClient.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });
      logStep("Updated existing user password and metadata");
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          plan_type: planType,
          policy_number: policyNumber
        }
      });

      if (authError) {
        throw authError;
      }
      
      userId = authData.user.id;
      logStep("Created new user", { userId });
    }

    // Create policy record
    const policyEndDate = calculatePolicyEndDate(paymentType);
    
    const { data: policyData, error: policyError } = await supabaseClient
      .from('customer_policies')
      .insert({
        user_id: userId,
        email: email,
        plan_type: planType.toLowerCase(),
        payment_type: paymentType,
        policy_number: policyNumber,
        policy_end_date: policyEndDate,
        status: 'active'
      })
      .select()
      .single();

    if (policyError) throw policyError;
    logStep("Created policy record", { policyId: policyData.id });

    // Record welcome email
    const { error: emailRecordError } = await supabaseClient
      .from('welcome_emails')
      .insert({
        user_id: userId,
        email: email,
        policy_id: policyData.id,
        temporary_password: tempPassword,
        email_sent_at: new Date().toISOString()
      });

    if (emailRecordError) {
      logStep("Warning: Failed to record welcome email", emailRecordError);
    }

    // Fetch plan-specific and terms & conditions documents to attach to welcome email
    const attachments = [];
    
    // Helper function to prepare document attachment
    const prepareDocumentAttachment = async (doc: any, logPrefix: string) => {
      try {
        const response = await fetch(doc.file_url);
        if (response.ok) {
          const fileBuffer = await response.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
          
          const attachment = {
            filename: doc.document_name.endsWith('.pdf') ? doc.document_name : `${doc.document_name}.pdf`,
            content: base64Content,
            type: 'application/pdf'
          };
          logStep(`${logPrefix} document prepared for attachment`, { filename: attachment.filename });
          return attachment;
        }
      } catch (error) {
        logStep(`Error preparing ${logPrefix} document`, error);
      }
      return null;
    };

    // Map plan types to document plan types in the database
    const planTypeMapping: Record<string, string> = {
      'basic': 'basic',
      'gold': 'gold', 
      'platinum': 'platinum',
      'electric': 'electric',
      'phev': 'phev',
      'motorbike': 'motorbike'
    };

    // Fetch plan-specific document
    try {
      const mappedPlanType = planTypeMapping[planType.toLowerCase()] || planType.toLowerCase();
      logStep("Fetching plan-specific document", { planType: planType, mappedPlanType });
      
      const { data: planDoc, error: planError } = await supabaseClient
        .from('customer_documents')
        .select('document_name, file_url')
        .eq('plan_type', mappedPlanType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planDoc && !planError) {
        const planAttachment = await prepareDocumentAttachment(planDoc, "Plan-specific");
        if (planAttachment) {
          attachments.push(planAttachment);
        }
      } else {
        logStep("No plan-specific document found", { planType: mappedPlanType, error: planError });
      }
    } catch (error) {
      logStep("Error fetching plan-specific document", error);
    }

    // Fetch terms and conditions document
    try {
      const { data: termsDoc, error: termsError } = await supabaseClient
        .from('customer_documents')
        .select('document_name, file_url')
        .eq('plan_type', 'terms-and-conditions')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (termsDoc && !termsError) {
        const termsAttachment = await prepareDocumentAttachment(termsDoc, "Terms and conditions");
        if (termsAttachment) {
          attachments.push(termsAttachment);
        }
      } else {
        logStep("No terms document found", termsError);
      }
    } catch (error) {
      logStep("Error fetching terms document", error);
    }

    // Send actual welcome email using send-email function
    try {
      const emailVariables = {
        customerName: email.split('@')[0], // Use email prefix as name fallback
        planType: planType,
        policyNumber: policyNumber,
        loginEmail: email,
        temporaryPassword: tempPassword,
        loginUrl: `${req.headers.get("origin")}/auth`
      };

      const emailPayload: any = {
        templateId: 'Welcome Email - Portal Signup',
        recipientEmail: email,
        variables: emailVariables
      };

      // Add attachments if any were successfully fetched
      if (attachments.length > 0) {
        emailPayload.attachments = attachments;
        logStep("Attachments added to email", { count: attachments.length, filenames: attachments.map(a => a.filename) });
      }

      const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
        body: emailPayload
      });

      if (emailError) {
        logStep("Error sending welcome email", emailError);
        // Don't fail the whole process if email fails
      } else {
        logStep("Welcome email sent successfully", emailResult);
      }
    } catch (error) {
      logStep("Error invoking send-email function", error);
      // Don't fail the whole process if email fails
    }

    // Schedule feedback email for 3 days later
    try {
      const { data: feedbackTemplate, error: templateError } = await supabaseClient
        .from('email_templates')
        .select('id')
        .eq('template_type', 'feedback')
        .eq('is_active', true)
        .single();

      if (feedbackTemplate && !templateError) {
        const feedbackDate = new Date();
        feedbackDate.setDate(feedbackDate.getDate() + 3);
        feedbackDate.setHours(10, 0, 0, 0); // Send at 10 AM

        const { error: scheduleError } = await supabaseClient
          .from('scheduled_emails')
          .insert({
            template_id: feedbackTemplate.id,
            customer_id: userId,
            recipient_email: email,
            scheduled_for: feedbackDate.toISOString(),
            metadata: {
              customerFirstName: email.split('@')[0],
              expiryDate: calculatePolicyEndDate(paymentType),
              portalUrl: 'https://buyawarranty.co.uk/customer-dashboard',
              referralLink: `https://buyawarranty.co.uk/refer/${userId || 'guest'}`
            }
          });

        if (scheduleError) {
          logStep('Failed to schedule feedback email', { error: scheduleError });
        } else {
          logStep('Feedback email scheduled successfully', { scheduledFor: feedbackDate });
        }
      }
    } catch (error) {
      logStep("Error scheduling feedback email", error);
      // Don't fail the whole process if scheduling fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email process completed",
      temporaryPassword: tempPassword, // For testing purposes - remove in production
      policyId: policyData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-welcome-email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to calculate policy end date
function calculatePolicyEndDate(paymentType: string): string {
  const startDate = new Date();
  
  switch (paymentType) {
    case 'monthly':
      startDate.setMonth(startDate.getMonth() + 1);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() + 1);
      break;
    case 'twoYear':
      startDate.setFullYear(startDate.getFullYear() + 2);
      break;
    case 'threeYear':
      startDate.setFullYear(startDate.getFullYear() + 3);
      break;
    default:
      startDate.setMonth(startDate.getMonth() + 1);
  }
  
  return startDate.toISOString();
}
