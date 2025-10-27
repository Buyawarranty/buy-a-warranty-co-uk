import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log('Processing abandoned cart emails...');

    // List of email patterns to exclude from abandoned cart emails (test/internal accounts)
    const excludedEmailPatterns = [
      'buyawarranty.co.uk',
      'prajwalchauhan',
      '1fairdeal',
      'test@',
      'demo@',
      'admin@'
    ];

    // Get abandoned carts from step 4 (checkout) from the last 5 days
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('step_abandoned', 4) // Only process step 4 (checkout) carts
      .gte('created_at', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()) // Last 5 days
      .order('created_at', { ascending: false });

    if (cartsError) {
      console.error('Error fetching abandoned carts:', cartsError);
      throw cartsError;
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      console.log('No abandoned carts found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No abandoned carts to process" 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${abandonedCarts.length} abandoned carts to process`);

    let emailsSent = 0;
    let errorsCount = 0;

    // Process each abandoned cart
    for (const cart of abandonedCarts) {
      try {
        // Skip test/internal email addresses
        const cartEmail = cart.email?.toLowerCase() || '';
        const isTestEmail = excludedEmailPatterns.some(pattern => 
          cartEmail.includes(pattern.toLowerCase())
        );
        
        if (isTestEmail) {
          console.log(`Skipping test/internal email: ${cart.email}`);
          continue;
        }

        // Check if customer has completed a purchase (has an active policy)
        const { data: existingPolicy, error: policyCheckError } = await supabase
          .from('customer_policies')
          .select('id, policy_number, created_at')
          .eq('email', cart.email)
          .in('status', ['active', 'Active'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingPolicy && existingPolicy.length > 0) {
          console.log(`Skipping abandoned cart for ${cart.email} - Customer has completed purchase (Policy: ${existingPolicy[0].policy_number})`);
          
          // Optionally update the abandoned cart status to mark it as converted
          await supabase
            .from('abandoned_carts')
            .update({ 
              contact_status: 'converted',
              contact_notes: `Customer completed purchase - Policy ${existingPolicy[0].policy_number}`
            })
            .eq('id', cart.id);
          
          continue;
        }

        const triggerType = 'checkout_abandoned';
        const cartTime = new Date(cart.created_at).getTime();
        const timeSinceAbandoned = Date.now() - cartTime;

        // Get all email templates for this trigger type
        const { data: templates, error: templateError } = await supabase
          .from('abandoned_cart_email_templates')
          .select('*')
          .eq('trigger_type', triggerType)
          .eq('is_active', true)
          .order('email_sequence', { ascending: true });

        if (templateError || !templates || templates.length === 0) {
          console.log(`No templates found for trigger type: ${triggerType}`);
          continue;
        }

        // Check each email sequence
        for (const template of templates) {
          const delayMs = template.send_delay_minutes * 60 * 1000;
          const shouldSendAt = cartTime + delayMs;

          // Check if it's time to send this email
          if (Date.now() < shouldSendAt) {
            continue;
          }

          // Check if we already sent this specific email sequence
          const { data: sentEmails, error: checkError } = await supabase
            .from('triggered_emails_log')
            .select('*')
            .eq('abandoned_cart_id', cart.id)
            .eq('trigger_type', triggerType)
            .eq('email_sequence', template.email_sequence)
            .limit(1);

          if (checkError) {
            console.error('Error checking sent emails:', checkError);
            continue;
          }

          if (sentEmails && sentEmails.length > 0) {
            console.log(`Email sequence ${template.email_sequence} already sent for cart ${cart.id}`);
            continue;
          }

          // Send the email
          const emailPayload = {
            cartId: cart.id,
            email: cart.email,
            firstName: cart.full_name?.split(' ')[0] || 'there',
            planName: cart.plan_name || 'Warranty Plan',
            paymentType: cart.payment_type || 'monthly',
            totalPrice: cart.total_price || 0,
            vehicleReg: cart.vehicle_reg,
            vehicleMake: cart.vehicle_make,
            vehicleModel: cart.vehicle_model,
            subject: template.subject,
            content: template.content,
            discountCode: template.discount_code,
            emailSequence: template.email_sequence,
            triggerType: triggerType,
            // Include all cart data for restoration
            cartData: {
              vehicle_reg: cart.vehicle_reg,
              vehicle_make: cart.vehicle_make,
              vehicle_model: cart.vehicle_model,
              vehicle_year: cart.vehicle_year,
              mileage: cart.mileage,
              plan_id: cart.plan_id,
              plan_name: cart.plan_name,
              payment_type: cart.payment_type,
              total_price: cart.total_price,
              voluntary_excess: cart.voluntary_excess,
              claim_limit: cart.claim_limit,
              address: cart.address,
              protection_addons: cart.protection_addons,
              full_name: cart.full_name,
              phone: cart.phone,
              email: cart.email
            }
          };

          console.log(`Sending email sequence ${template.email_sequence} for cart:`, cart.id);

          const emailResponse = await supabase.functions.invoke('send-abandoned-cart-email', {
            body: emailPayload
          });

          if (emailResponse.error) {
            console.error('Error sending email:', emailResponse.error);
            errorsCount++;
          } else {
            // Log that we sent this email
            await supabase
              .from('triggered_emails_log')
              .insert({
                email: cart.email,
                trigger_type: triggerType,
                email_sequence: template.email_sequence,
                abandoned_cart_id: cart.id
              });
            
            console.log(`Email sequence ${template.email_sequence} sent successfully for cart:`, cart.id);
            emailsSent++;
          }
        }

      } catch (error) {
        console.error('Error processing cart:', cart.id, error);
        errorsCount++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${abandonedCarts.length} abandoned carts`,
      emailsSent,
      errors: errorsCount
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in schedule-abandoned-cart-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);