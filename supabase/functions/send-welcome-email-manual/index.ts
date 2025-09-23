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
    const resendFrom = 'Buy A Warranty <support@buyawarranty.co.uk>';
    
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
      // Load Terms and Conditions PDF from public folder (updated to v2.2-5 for all warranty types)
      const termsResponse = await fetch('https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-5.pdf');
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
          filename: 'Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-5.pdf',
          content: termsBase64,
          content_type: 'application/pdf'
        });
        
        console.log(JSON.stringify({ evt: "terms.pdf.attached", rid }));
      } else {
        console.log(JSON.stringify({ evt: "terms.pdf.failed", rid, status: termsResponse.status }));
      }
      
      // Load Platinum Warranty Plan PDF from public folder (updated to v2.2-4 for all warranty types)
      const platinumResponse = await fetch('https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/Platinum-warranty-plan_v2.2-4.pdf');
      if (platinumResponse.ok) {
        const platinumBuffer = await platinumResponse.arrayBuffer();
        const platinumBytes = new Uint8Array(platinumBuffer);
        let platinumBase64 = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < platinumBytes.length; i += chunkSize) {
          const chunk = platinumBytes.slice(i, i + chunkSize);
          platinumBase64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        attachments.push({
          filename: 'Platinum-warranty-plan_v2.2-4.pdf',
          content: platinumBase64,
          content_type: 'application/pdf'
        });
        
        console.log(JSON.stringify({ evt: "platinum.pdf.attached", rid }));
      } else {
        console.log(JSON.stringify({ evt: "platinum.pdf.failed", rid, status: platinumResponse.status }));
      }
    } catch (error) {
      console.log(JSON.stringify({ evt: "pdf.load.error", rid, error: error.message }));
    }
    
    console.log(JSON.stringify({ evt: "pdf.final.count", rid, attachmentCount: attachments.length }));

    // Check if welcome email already sent for this email address
    console.log(JSON.stringify({ evt: "checking.existing.welcome", rid, customerEmail: customer.email }));
    
    const { data: existingWelcomeEmail } = await supabase
      .from('welcome_emails')
      .select('temporary_password, email_sent_at')
      .eq('email', customer.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If welcome email already sent recently (within 24 hours), skip sending another one
    if (existingWelcomeEmail) {
      const sentAt = new Date(existingWelcomeEmail.email_sent_at);
      const now = new Date();
      const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSent < 24) {
        console.log(JSON.stringify({ 
          evt: "welcome.already.sent", 
          rid, 
          sentAt: existingWelcomeEmail.email_sent_at,
          hoursSinceSent 
        }));
        
        // Update policy status but don't send duplicate email
        await supabase
          .from('customer_policies')
          .update({ email_sent_status: 'sent', email_sent_at: new Date().toISOString() })
          .eq('id', policy.id);
        
        return new Response(JSON.stringify({ 
          ok: true, 
          rid, 
          message: 'Welcome email already sent recently',
          skipped: true
        }), {
          status: 200,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
    }

    // Use existing password if available, otherwise generate new one
    const tempPassword = existingWelcomeEmail?.temporary_password || (() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    })();
    
    // Set the customer dashboard URL
    const loginUrl = 'https://buyawarranty.co.uk/customer-dashboard';
    
    console.log(JSON.stringify({ 
      evt: existingWelcomeEmail ? "using.existing.password" : "generated.new.password", 
      rid, 
      loginUrl 
    }));

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === customer.email);
    
    let userId = null;
    
    if (userExists) {
      console.log(JSON.stringify({ evt: "user.exists", rid, userId: userExists.id }));
      userId = userExists.id;
      
      // Update existing user's password and metadata
      await supabase.auth.admin.updateUserById(userExists.id, {
        password: tempPassword,
        user_metadata: {
          plan_type: policy.plan_type,
          policy_number: policy.policy_number,
          warranty_number: policy.warranty_number
        }
      });
      console.log(JSON.stringify({ evt: "user.updated", rid, userId }));
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
          temporary_password: tempPassword,
          policy_id: policy.id,
          email_sent_at: new Date().toISOString()
        });
      console.log(JSON.stringify({ evt: "welcome.email.record.stored", rid }));
    } catch (auditError) {
      console.log(JSON.stringify({ evt: "welcome.email.audit.failed", rid, error: auditError.message }));
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

    // Use the standardized PDF documents for all warranty types (motorbikes, vans, cars, EV, PHEV)
    const policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/Platinum-warranty-plan_v2.2-4.pdf';
    const termsUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/Terms-and-Conditions-Your-Extended-Warranty-Guide-v2.2-5.pdf';

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
      subject: `🎉 Congratulations — Your Buyawarranty.co.uk Protection is Now Registered!`,
      ...(attachments.length > 0 && { attachments }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333; margin-bottom: 10px;">Hi ${customer.first_name || customerName},</h1>
            <h2 style="color: #28a745; margin-bottom: 15px;">Your Buy-A-Warranty Protection is Now Registered! 🎉 We're excited to have you covered and ready to enjoy peace of mind.</h2>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">
              Your policy documents are attached to this email for your records. Your policy number is: 
              <strong style="color: #ff6b35; font-size: 18px;">${policy.warranty_number || policy.policy_number}</strong>
            </p>
          </div>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin-top: 0;">🔐 Your Customer Portal Access</h3>
            <p>Access your customer portal to view your warranty details, policy documents, and manage your account:</p>
            <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #007bff;">${loginUrl}</a></p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #f1f1f1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${tempPassword}</code></p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              <em>After logging in, you will be automatically redirected to your customer dashboard where you can view your warranty details and policy documents.</em>
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 10px;">📋 What's included in your documents:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 6px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Full warranty terms and conditions</li>
              <li style="padding: 6px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Claims process information</li>
              <li style="padding: 6px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Coverage details and limitations</li>
              <li style="padding: 6px 0;"><span style="color: #28a745;">✅</span> Contact information for claims</li>
            </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 10px;">📄 Your Policy Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 6px 0; font-weight: bold; width: 40%;">Vehicle Registration:</td>
                <td style="padding: 6px 0;"><span style="${regPlateStyle}">${regPlate}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 6px 0; font-weight: bold;">Plan Type:</td>
                <td style="padding: 6px 0; text-transform: capitalize;">${getDisplayPlanType(policy.plan_type)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 6px 0;">${paymentMethod}</td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 6px 0; font-weight: bold;">Coverage Period:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #ff6b35;">${coveragePeriod}</td>
              </tr>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Policy End Date:</td>
                <td style="padding: 6px 0;">${new Date(policy.policy_end_date).toLocaleDateString('en-GB')}</td>
              </tr>
            </table>
            <div style="margin-top: 10px; padding: 10px; background-color: #fff8e1; border-radius: 6px; border-left: 4px solid #ff9800;">
              <p style="margin: 0; color: #333; font-weight: 600; line-height: 1.5;">
                📎 <strong>We've attached your documents to this email. Be sure to keep them somewhere safe so you can easily find them when you need them</strong>
              </p>
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${policyDocumentUrl}" 
               style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 8px; font-size: 16px;">
              📄 View Your Policy
            </a>
            <br>
            <a href="${termsUrl}" 
               style="display: inline-block; background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 8px; font-size: 16px;">
              📋 Terms & Conditions
            </a>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              You've made a smart choice to safeguard your vehicle and avoid unexpected repair bills. With your new warranty in place, you can drive with complete peace of mind knowing you're covered when it matters most.
            </p>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 10px;">📞 Need help?</h3>
            <p style="margin: 0; line-height: 1.6;">
              If you have any questions about your coverage or need to make a claim, please contact us on:<br>
              <strong>Customer support:</strong> <a href="tel:0330 229 5040" style="color: #ff6b35; text-decoration: none;">0330 229 5040</a><br>
              <strong>Claims line:</strong> <a href="tel:0330 229 5045" style="color: #ff6b35; text-decoration: none;">0330 229 5045</a>
            </p>
          </div>

          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 12px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c5460;">
              <strong>💡 Tip:</strong> We recommend keeping these documents safe and accessible - that way you'll have everything you need right at your fingertips if you ever need to make a claim.
            </p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; color: #28a745; font-weight: bold; margin: 0;">
              Drive safe and enjoy the confidence your new warranty brings!
            </p>
          </div>

          <div style="border-top: 2px solid #dee2e6; padding-top: 15px; margin-top: 20px; text-align: center;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              Thank you for choosing buyawarranty.co.uk
            </p>
            <p style="margin: 10px 0; font-size: 16px; line-height: 1.6;">
              Kind regards,<br>
              The Buy-A-Warranty Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">
              <strong>buyawarranty.co.uk</strong><br>
              Your trusted warranty partner<br>
              <strong>Claims line:</strong> 0330 229 5045 | <a href="mailto:claims@buyawarranty.co.uk" style="color: #ff6b35;">claims@buyawarranty.co.uk</a><br>
              <strong>Customer support:</strong> 0330 229 5040 | <a href="mailto:support@buyawarranty.co.uk" style="color: #ff6b35;">support@buyawarranty.co.uk</a>
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