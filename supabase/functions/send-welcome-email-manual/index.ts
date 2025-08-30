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

    // Get PDF documents - try multiple approaches
    console.log(JSON.stringify({ evt: "pdf.lookup.start", rid, planType: policy.plan_type }));
    
    let attachments = [];
    
    // Determine vehicle type based on plan and customer data
    const isSpecialVehicle = ['motorcycle', 'van', 'motorhome', 'caravan', 'motorbike'].some(type => 
      policy.plan_type.toLowerCase().includes(type)
    );
    const vehicleType = isSpecialVehicle ? 'special_vehicle' : 'standard';

    // 1. Try plan_document_mapping first with correct vehicle type
    const { data: documentMapping } = await supabase
      .from('plan_document_mapping')
      .select('document_path')
      .eq('plan_name', policy.plan_type)
      .eq('vehicle_type', vehicleType)
      .maybeSingle();

    console.log(JSON.stringify({ 
      evt: "plan.mapping.result", 
      rid, 
      documentMapping, 
      planType: policy.plan_type,
      vehicleType
    }));

    // 2. Build list of possible PDF paths to try
    let pdfPaths = [];
    if (documentMapping?.document_path) {
      pdfPaths.push(documentMapping.document_path);
    }
    
    // Map plan types to match customer_documents table exactly
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
    
    const normalizedPlanType = planTypeMapping[policy.plan_type.toLowerCase()] || policy.plan_type.toLowerCase();
    console.log(JSON.stringify({ evt: "plan.mapping", rid, originalPlan: policy.plan_type, normalizedPlan: normalizedPlanType }));
    
    // Add common plan naming patterns using normalized plan type
    const planLower = normalizedPlanType.replace(/\s+/g, '-');
    const possiblePaths = [
      `${planLower}-warranty.pdf`,
      `${planLower}.pdf`,
      `plan-${planLower}.pdf`,
      `${normalizedPlanType}.pdf`,
      `${normalizedPlanType}-warranty.pdf`,
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

          // Convert to base64 for attachment using chunked approach to avoid stack overflow
          const buffer = await fileData.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          let base64Content = '';
          const chunkSize = 8192;
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            base64Content += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
          }
          
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
    
    // Also try customer_documents table with normalized plan type if no documents found yet
    if (attachments.length === 0) {
      console.log(JSON.stringify({ evt: "trying.customer.documents.table", rid, normalizedPlanType }));
      
      const { data: planDoc, error: planError } = await supabase
        .from('customer_documents')
        .select('document_name, file_url')
        .eq('plan_type', normalizedPlanType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planDoc && !planError) {
        try {
          console.log(JSON.stringify({ evt: "customer.doc.found", rid, url: planDoc.file_url, name: planDoc.document_name }));
          const response = await fetch(planDoc.file_url);
          
          if (response.ok) {
            const fileBuffer = await response.arrayBuffer();
            // Use chunked approach to avoid stack overflow
            const bytes = new Uint8Array(fileBuffer);
            let base64Content = '';
            const chunkSize = 8192;
            
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.slice(i, i + chunkSize);
              base64Content += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
            }
            
            attachments.push({
              filename: planDoc.document_name.endsWith('.pdf') ? planDoc.document_name : `${planDoc.document_name}.pdf`,
              content: base64Content,
              content_type: 'application/pdf'
            });
            console.log(JSON.stringify({ evt: "customer.doc.attached", rid, filename: planDoc.document_name }));
          }
        } catch (error) {
          console.log(JSON.stringify({ evt: "customer.doc.error", rid, error: error.message }));
        }
      }
      
      // Also try to get terms and conditions
      const { data: termsDoc, error: termsError } = await supabase
        .from('customer_documents')
        .select('document_name, file_url')
        .eq('plan_type', 'terms-and-conditions')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (termsDoc && !termsError) {
        try {
          console.log(JSON.stringify({ evt: "terms.doc.found", rid, url: termsDoc.file_url }));
          const response = await fetch(termsDoc.file_url);
          
          if (response.ok) {
            const fileBuffer = await response.arrayBuffer();
            // Use chunked approach to avoid stack overflow
            const bytes = new Uint8Array(fileBuffer);
            let base64Content = '';
            const chunkSize = 8192;
            
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.slice(i, i + chunkSize);
              base64Content += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
            }
            
            attachments.push({
              filename: termsDoc.document_name.endsWith('.pdf') ? termsDoc.document_name : `${termsDoc.document_name}.pdf`,
              content: base64Content,
              content_type: 'application/pdf'
            });
            console.log(JSON.stringify({ evt: "terms.doc.attached", rid, filename: termsDoc.document_name }));
          }
        } catch (error) {
          console.log(JSON.stringify({ evt: "terms.doc.error", rid, error: error.message }));
        }
      }
    }
    
    console.log(JSON.stringify({ evt: "pdf.final.count", rid, attachmentCount: attachments.length }));

    // CREATE USER ACCOUNT AND SEND LOGIN CREDENTIALS
    console.log(JSON.stringify({ evt: "user.creation.start", rid, customerEmail: customer.email }));
    
    // Set the specific login URL for customers
    const loginUrl = 'https://pricing.buyawarranty.co.uk/customer-dashboard';
    
    console.log(JSON.stringify({ evt: "login.url.set", rid, loginUrl }));
    
    // Generate temporary password for customer login
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const tempPassword = generateTempPassword();
    console.log(JSON.stringify({ evt: "temp.password.generated", rid }));

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

    // Generate policy document URL based on plan type
    const planTypeLower = policy.plan_type.toLowerCase();
    let policyDocumentUrl;
    
    if (planTypeLower.includes('basic')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/basic/Basic-Cover-Warranty-Plan-Buyawarranty%202.0-1754464740490.pdf';
    } else if (planTypeLower.includes('gold')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/gold/Gold-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464758473.pdf';
    } else if (planTypeLower.includes('platinum')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/platinum/Platinum-Extended-Warranty%202.0-1754464769023.pdf';
    } else if (planTypeLower.includes('electric') || planTypeLower.includes('ev')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/electric/EV-Extended-Warranty-Plan-Buy-a-Warranty%202.0-1754464859338.pdf';
    } else if (planTypeLower.includes('motorbike') || planTypeLower.includes('motorcycle')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/motorbike/Motorbike-Extended-Warranty-Plan%202.0-1754464869722.pdf';
    } else if (planTypeLower.includes('hybrid') || planTypeLower.includes('phev')) {
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/phev/Hybrid-PHEV-Warranty-Plan%202.0-1754464878940.pdf';
    } else {
      // Default to basic if plan type doesn't match any specific type
      policyDocumentUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/basic/Basic-Cover-Warranty-Plan-Buyawarranty%202.0-1754464740490.pdf';
    }

    const termsUrl = 'https://mzlpuxzwyrcyrgrongeb.supabase.co/storage/v1/object/public/policy-documents/terms-and-conditions/Terms%20and%20conditions-1754666518644.pdf';

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
      subject: `🎉 Congratulations — Your Buyawarranty.co.uk Protection is Now Registered! ✅`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Hi ${customer.first_name || customerName},</h1>
            <h2 style="color: #28a745; margin-bottom: 20px;">Congratulations on your new warranty! 🎉 We're excited to have you covered and ready to enjoy peace of mind.</h2>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">
              Your policy documents are attached to this email for your records. Your policy number is: 
              <strong style="color: #ff6b35; font-size: 18px;">${policy.warranty_number || policy.policy_number}</strong>
            </p>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin-top: 0;">🔐 Your Customer Portal Access</h3>
            <p>Access your customer portal to view your warranty details, policy documents, and manage your account:</p>
            <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #007bff;">${loginUrl}</a></p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #f1f1f1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${tempPassword}</code></p>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              <em>Please change your password after your first login for security.</em>
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 What's included in your documents:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Full warranty terms and conditions</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Claims process information</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #f1f1f1;"><span style="color: #28a745;">✅</span> Coverage details and limitations</li>
              <li style="padding: 8px 0;"><span style="color: #28a745;">✅</span> Contact information for claims</li>
            </ul>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📄 Your Policy Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Vehicle Registration:</td>
                <td style="padding: 8px 0;"><span style="${regPlateStyle}">${regPlate}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px 0; font-weight: bold;">Plan Type:</td>
                <td style="padding: 8px 0; text-transform: capitalize;">${getDisplayPlanType(policy.plan_type)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0;">${paymentMethod}</td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 8px 0; font-weight: bold;">Coverage Period:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #ff6b35;">${coveragePeriod}</td>
              </tr>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Policy End Date:</td>
                <td style="padding: 8px 0;">${new Date(policy.policy_end_date).toLocaleDateString('en-GB')}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${policyDocumentUrl}" 
               style="display: inline-block; background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px; font-size: 16px;">
              📄 View Your Policy
            </a>
            <br>
            <a href="${termsUrl}" 
               style="display: inline-block; background-color: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px; font-size: 16px;">
              📋 Terms & Conditions
            </a>
          </div>

          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              You've made a smart choice to safeguard your vehicle and avoid unexpected repair bills. With your new warranty in place, you can drive with complete peace of mind knowing you're covered when it matters most.
            </p>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">📞 Need help?</h3>
            <p style="margin: 0; line-height: 1.6;">
              If you have any questions about your coverage or need to make a claim, please contact us on:<br>
              <strong>Customer care:</strong> <a href="tel:0330 229 5040" style="color: #ff6b35; text-decoration: none;">0330 229 5040</a><br>
              <strong>Claims line:</strong> <a href="tel:0330 229 5045" style="color: #ff6b35; text-decoration: none;">0330 229 5045</a>
            </p>
          </div>

          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c5460;">
              <strong>💡 Tip:</strong> We recommend keeping these documents safe and accessible - that way you'll have everything you need right at your fingertips if you ever need to make a claim.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #28a745; font-weight: bold; margin: 0;">
              Drive safe and enjoy the confidence your new warranty brings!
            </p>
          </div>

          <div style="border-top: 2px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Best regards,</strong><br>
              The Customer Care Team<br>
              <a href="https://buyawarranty.co.uk" style="color: #ff6b35; text-decoration: none; font-weight: bold;">Buyawarranty.co.uk</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">
              If you have any questions, please contact us at 
              <a href="mailto:info@buyawarranty.co.uk" style="color: #ff6b35;">info@buyawarranty.co.uk</a>
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