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

    // Get abandoned carts that need emails sent
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
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
        // Skip if email is not valid (might be a vehicle reg used as identifier)
        if (!cart.email || !cart.email.includes('@')) {
          console.log(`Skipping cart ${cart.id} - invalid email format:`, cart.email);
          continue;
        }
        
        // Determine trigger type based on step
        let triggerType: 'pricing_page_view' | 'plan_selected';
        if (cart.step_abandoned === 3) {
          triggerType = 'pricing_page_view';
        } else if (cart.step_abandoned === 4) {
          triggerType = 'plan_selected';
        } else {
          continue; // Skip if not a step we want to send emails for
        }

        // Get the template to check delay time
        const { data: template, error: templateError } = await supabase
          .from('abandoned_cart_email_templates')
          .select('send_delay_minutes')
          .eq('trigger_type', triggerType)
          .eq('is_active', true)
          .single();

        if (templateError || !template) {
          console.log(`No template found for trigger type: ${triggerType}`);
          continue;
        }

        // Check if enough time has passed since cart was abandoned
        const cartTime = new Date(cart.created_at).getTime();
        const delayMs = template.send_delay_minutes * 60 * 1000;
        const shouldSendAt = cartTime + delayMs;
        
        if (Date.now() < shouldSendAt) {
          console.log(`Not yet time to send email for cart ${cart.id}`);
          continue;
        }

        // Check if we already sent this type of email to this person recently
        const { data: recentEmails, error: checkError } = await supabase
          .from('triggered_emails_log')
          .select('*')
          .eq('email', cart.email)
          .eq('trigger_type', triggerType)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .limit(1);

        if (checkError) {
          console.error('Error checking recent emails:', checkError);
          continue;
        }

        if (recentEmails && recentEmails.length > 0) {
          console.log(`Already sent ${triggerType} email to ${cart.email} recently`);
          continue;
        }

        // Send the email
        const emailPayload = {
          email: cart.email,
          firstName: cart.full_name?.split(' ')[0] || 'there',
          vehicleReg: cart.vehicle_reg,
          vehicleMake: cart.vehicle_make,
          vehicleModel: cart.vehicle_model,
          vehicleType: cart.vehicle_type, // Include vehicle type for special vehicles
          triggerType,
          planName: cart.plan_name,
          paymentType: cart.payment_type
        };

        console.log('Sending abandoned cart email for:', emailPayload);

        const emailResponse = await supabase.functions.invoke('send-abandoned-cart-email', {
          body: emailPayload
        });

        if (emailResponse.error) {
          console.error('Error sending email:', emailResponse.error);
          errorsCount++;
        } else {
          console.log('Email sent successfully for cart:', cart.id);
          emailsSent++;
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