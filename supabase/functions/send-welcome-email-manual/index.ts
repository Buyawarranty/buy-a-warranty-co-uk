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

// Generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
    const resendFrom = 'Buy A Warranty <noreply@buyawarranty.co.uk>';
    
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

    // Skip idempotency check for manual resends - force send
    console.log(JSON.stringify({ evt: "force.resend", rid, policyId: policy.id, previousStatus: policy.email_sent_status }));

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

    // Load the required PDF attachments
    console.log(JSON.stringify({ evt: "pdf.load.start", rid }));
    
    let attachments = [];
    
    try {
      // Load Terms and Conditions PDF from public folder
      const termsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-7.pdf`);
      if (termsResponse.ok) {
        const termsBuffer = await termsResponse.arrayBuffer();
        const termsBytes = new Uint8Array(termsBuffer);
        let termsBase64 = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < termsBytes.length; i += chunkSize) {
          const chunk = termsBytes.slice(i, i + chunkSize);
          termsBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        attachments.push({
          filename: 'Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-7.pdf',
          content: termsBase64,
          type: 'application/pdf'
        });
        
        console.log(JSON.stringify({ evt: "terms.pdf.attached", rid }));
      } else {
        console.log(JSON.stringify({ evt: "terms.pdf.failed", rid, status: termsResponse.status }));
      }
      
      // Load Premium Extended Warranty Plan PDF from public folder
      const premiumResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf`);
      if (premiumResponse.ok) {
        const premiumBuffer = await premiumResponse.arrayBuffer();
        const premiumBytes = new Uint8Array(premiumBuffer);
        let premiumBase64 = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < premiumBytes.length; i += chunkSize) {
          const chunk = premiumBytes.slice(i, i + chunkSize);
          premiumBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        attachments.push({
          filename: 'Premium-Extended-Warranty-Plan-2.0.pdf',
          content: premiumBase64,
          type: 'application/pdf'
        });
        
        console.log(JSON.stringify({ evt: "premium.pdf.attached", rid }));
      } else {
        console.log(JSON.stringify({ evt: "premium.pdf.failed", rid, status: premiumResponse.status }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(JSON.stringify({ evt: "pdf.load.error", rid, error: errorMessage }));
    }
    
    console.log(JSON.stringify({ evt: "pdf.final.count", rid, attachmentCount: attachments.length }));

    // ============= IMPROVED PASSWORD LOGIC =============
    // 1. First purchase: Generate new temporary password
    // 2. Subsequent purchases (before password reset): Use SAME existing temporary password  
    // 3. After user resets password: No login credentials in emails (they manage their own password)
    // This ensures consistent password experience and proper account ownership transition
    // ====================================================
    
    // Check if user has reset their password and get existing password if available
    console.log(JSON.stringify({ evt: "checking.password.reset.status", rid, customerEmail: customer.email }));
    
    const { data: latestWelcomeEmail } = await supabase
      .from('welcome_emails')
      .select('temporary_password, password_reset_by_user')
      .eq('email', customer.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasResetPassword = latestWelcomeEmail?.password_reset_by_user || false;
    const shouldIncludeLoginDetails = !hasResetPassword;
    
    console.log(JSON.stringify({ 
      evt: "password.reset.check", 
      rid, 
      hasResetPassword, 
      shouldIncludeLoginDetails 
    }));

    // Always send welcome email for new purchases, but reuse password if exists and not reset
    let tempPassword = '';
    if (shouldIncludeLoginDetails) {
      // Use existing password if available, or generate new one
      tempPassword = latestWelcomeEmail?.temporary_password || generateRandomPassword();
      console.log(JSON.stringify({ 
        evt: "password.handling", 
        rid, 
        usingExistingPassword: !!latestWelcomeEmail?.temporary_password 
      }));
    }

    // Check if user already exists and handle authentication
    console.log(JSON.stringify({ evt: "checking.user.existence", rid, customerEmail: customer.email }));
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === customer.email);
    
    let userId = null;
    
    if (shouldIncludeLoginDetails && tempPassword) {
      if (userExists) {
        console.log(JSON.stringify({ evt: "user.exists", rid, userId: userExists.id }));
        userId = userExists.id;
        
        // Only update password if this is a new temporary password (first time)
        if (!latestWelcomeEmail?.temporary_password) {
          // First time customer - create password
          await supabase.auth.admin.updateUserById(userExists.id, {
            password: tempPassword,
            user_metadata: {
              plan_type: policy.plan_type,
              policy_number: policy.policy_number,
              warranty_number: policy.warranty_number
            }
          });
          console.log(JSON.stringify({ evt: "user.password.set.first.time", rid, userId }));
        } else {
          // Existing customer with existing password - just update metadata
          await supabase.auth.admin.updateUserById(userExists.id, {
            user_metadata: {
              plan_type: policy.plan_type,
              policy_number: policy.policy_number,
              warranty_number: policy.warranty_number
            }
          });
          console.log(JSON.stringify({ evt: "user.metadata.updated.same.password", rid, userId }));
        }
      } else {
        // Create new user account
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: customer.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            plan_type: policy.plan_type,
            policy_number: policy.policy_number,
            warranty_number: policy.warranty_number
          }
        });

        if (userError) {
          console.log(JSON.stringify({ evt: "user.creation.failed", rid, error: userError.message }));
          throw new Error(`Failed to create user: ${userError.message}`);
        }

        if (!userData.user) {
          throw new Error("User creation returned no user data");
        }

        userId = userData.user.id;
        console.log(JSON.stringify({ evt: "user.created", rid, userId }));
      }
    } else {
      // User has reset password, so they manage their own account
      console.log(JSON.stringify({ evt: "user.password.reset", rid, message: "User has reset password, no account management needed" }));
      if (userExists) {
        userId = userExists.id;
      }
    }

    // Link the customer policy to the user account
    if (userId && !policy.user_id) {
      await supabase
        .from('customer_policies')
        .update({ user_id: userId })
        .eq('id', policy.id);
      console.log(JSON.stringify({ evt: "policy.linked.to.user", rid, policyId: policy.id, userId }));
    }

    // Store welcome email record for audit
    try {
      await supabase
        .from('welcome_emails')
        .insert({
          user_id: userId,
          email: customer.email,
          temporary_password: tempPassword || '',
          policy_id: policy.id,
          email_sent_at: new Date().toISOString(),
          password_reset_by_user: hasResetPassword
        });
      console.log(JSON.stringify({ evt: "welcome.email.record.stored", rid }));
    } catch (auditError) {
      const errorMessage = auditError instanceof Error ? auditError.message : String(auditError);
      console.log(JSON.stringify({ evt: "welcome.email.audit.failed", rid, error: errorMessage }));
    }

    // Get customer data with vehicle info from the customers table
    const { data: customerDetails } = await supabase
      .from('customers')
      .select('*')
      .eq('id', policy.customer_id)
      .single();

    const customerName = customer.first_name && customer.last_name 
      ? `${customer.first_name} ${customer.last_name}` 
      : customer.name;

    // Calculate coverage period based on payment type
    // Note: All warranties provide minimum 12 months coverage regardless of payment frequency
    const calculatePeriodInMonths = (paymentType: string): number => {
      const normalizedPaymentType = paymentType?.toLowerCase().replace(/[_-]/g, '');
      
      switch (normalizedPaymentType) {
        case 'monthly':
        case '1month':
        case 'month':
          return 12; // Monthly payments still get 12 months coverage
        case 'yearly':
        case 'annual':
        case '12months':
        case '12month':
        case 'year':
          return 12;
        case 'twoyearly':
        case '2yearly':
        case '24months':
        case '24month':
        case '2years':
        case '2year':
          return 24;
        case 'threeyearly':
        case '3yearly':
        case '36months':
        case '36month':
        case '3years':
        case '3year':
          return 36;
        default:
          return 12;
      }
    };

    // Normalize plan type for consistent display
    const getDisplayPlanType = (planType: string): string => {
      const planLower = planType.toLowerCase();
      
      if (planLower.includes('basic') || planLower.includes('blue')) {
        return 'Basic';
      } else if (planLower.includes('gold')) {
        return 'Gold';
      } else if (planLower.includes('platinum')) {
        return 'Platinum';
      } else if (planLower.includes('phev') || planLower.includes('hybrid')) {
        return 'PHEV';
      } else if (planLower.includes('ev') || planLower.includes('electric')) {
        return 'EV';
      } else if (planLower.includes('motorbike') || planLower.includes('motorcycle')) {
        return 'Motorbike';
      }
      
      return planType.charAt(0).toUpperCase() + planType.slice(1).toLowerCase();
    };

    const periodInMonths = calculatePeriodInMonths(policy.payment_type);
    const coveragePeriod = `${periodInMonths} month${periodInMonths === 1 ? '' : 's'}`;

    // Determine payment method based on available data
    let paymentMethod = 'Online Payment';
    if (policy.stripe_session_id) {
      paymentMethod = 'Stripe';
    } else if (policy.bumper_order_id) {
      paymentMethod = 'Bumper';
    }

    // Use the new Premium Plan PDF for all warranty types
    const policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf';
    const termsUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-5.pdf';

    // Define login URL for customer portal
    const loginUrl = 'https://buyawarranty.co.uk/auth';

    // Registration plate styling - optimized for both light and dark modes
    const regPlate = customerDetails?.registration_plate || 'N/A';
    const regPlateStyle = `
      display: inline-block;
      background: #1a1a1a;
      color: #ffffff;
      font-family: 'Charles Wright', monospace;
      font-weight: bold;
      font-size: 18px;
      padding: 8px 12px;
      border: 2px solid #1a1a1a;
      border-radius: 4px;
      letter-spacing: 2px;
      text-align: center;
      min-width: 120px;
      text-shadow: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    const emailPayload = {
      from: resendFrom,
      to: [customer.email],
      subject: `Your Buy-A-Warranty Protection is Now Active`,
      ...(attachments.length > 0 && { attachments }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; line-height: 1.6;">
          
          <div style="margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Dear ${customer.first_name || customerName},</h1>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
              Congratulations! Your Buy-A-Warranty protection is now fully registered. You've made a smart choice to safeguard your vehicle and drive with confidence.
            </p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Your Policy Details</h2>
            
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Vehicle Registration:</strong> <span style="${regPlateStyle}">${regPlate}</span>
              </li>
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Plan Type:</strong> ${getDisplayPlanType(policy.plan_type)}
              </li>
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Payment Method:</strong> ${paymentMethod}
              </li>
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Coverage Period:</strong> ${coveragePeriod}
              </li>
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Policy Number:</strong> <span style="color: #ff6b35; font-weight: bold;">${policy.warranty_number || policy.policy_number}</span>
              </li>
            </ul>
          </div>

          ${shouldIncludeLoginDetails ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Access Your Customer Portal</h2>
            
            <p style="color: #333; margin-bottom: 15px;">
              Manage your warranty, view policy details, and submit claims online:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <p style="margin: 0; color: #333;">
                <a href="${loginUrl}" style="color: #ff6b35; text-decoration: none; font-weight: bold; font-size: 18px;">Customer Portal</a>
              </p>
            </div>
            
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Login Email:</strong> ${customer.email}
              </li>
              <li style="margin-bottom: 8px; color: #333;">
                <strong>Access Code:</strong> <code style="background-color: #f1f1f1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${tempPassword}</code>
              </li>
            </ul>
          </div>
          ` : `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Access Your Customer Portal</h2>
            
            <p style="color: #333; margin-bottom: 15px;">
              Manage your warranty, view policy details, and submit claims online:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
              <p style="margin: 0; color: #333;">
                <a href="${loginUrl}" style="color: #ff6b35; text-decoration: none; font-weight: bold; font-size: 18px;">Customer Portal</a>
              </p>
            </div>
            
            <p style="color: #333;">
              <strong>Login Email:</strong> ${customer.email}<br>
              Use your existing password to access your account.
            </p>
          </div>
          `}

          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Your Policy Documents</h2>
            
            <p style="color: #333; margin-bottom: 15px;">
              We've attached your full policy documents, including:
            </p>
            
            <ul style="color: #333; padding-left: 20px;">
              <li style="margin-bottom: 5px;">Warranty terms and conditions</li>
              <li style="margin-bottom: 5px;">Coverage details and limitations</li>
              <li style="margin-bottom: 5px;">Claims process information</li>
              <li style="margin-bottom: 5px;">Contact details for support</li>
            </ul>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Need Help? We're Here for You</h2>
            
            <ul style="list-style: none; padding: 0; margin: 0; color: #333;">
              <li style="margin-bottom: 8px;">
                <strong>Claims Line:</strong> <a href="tel:03302295045" style="color: #ff6b35; text-decoration: none;">0330 229 5045</a> | <a href="mailto:claims@buyawarranty.co.uk" style="color: #ff6b35; text-decoration: none;">claims@buyawarranty.co.uk</a>
              </li>
              <li style="margin-bottom: 8px;">
                <strong>Customer Support:</strong> <a href="tel:03302295040" style="color: #ff6b35; text-decoration: none;">0330 229 5040</a> | <a href="mailto:support@buyawarranty.co.uk" style="color: #ff6b35; text-decoration: none;">support@buyawarranty.co.uk</a>
              </li>
            </ul>
          </div>

          <div style="margin-bottom: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="color: #333; margin: 0; text-align: center; font-size: 16px;">
              Thank you for choosing Buy-A-Warranty. We're committed to giving you peace of mind when it matters most.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #333; margin: 0; font-size: 16px;">
              Best regards,<br>
              <strong>The Buy-A-Warranty Team</strong>
            </p>
          </div>

          <div style="text-align: center; border-top: 1px solid #dee2e6; padding-top: 20px;">
            <p style="color: #333; margin-bottom: 10px; font-weight: bold;">buyawarranty.co.uk</p>
            <p style="color: #666; margin-bottom: 15px; font-style: italic;">Your trusted warranty partner</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px; line-height: 1.4; margin: 0;">
              Buyawarranty.co.uk is a trading name of One Warranty Limited. Registered in the UK under Company number: 10314863 since 2016.<br>
              Registered address: Warranty House, 62 Berkhamsted Ave, Wembley, HA9 6DT, England.
            </p>
          </div>

        </div>
      `,
      attachments: attachments
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