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

    // Get abandoned carts that need emails sent (exclude converted carts)
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('is_converted', false) // Only get unconverted carts
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
        
        // Get all emails sent for this cart to determine next email to send
        const { data: sentEmails, error: checkError } = await supabase
          .from('triggered_emails_log')
          .select('trigger_type, sent_at')
          .eq('cart_id', cart.id)
          .order('sent_at', { ascending: true });

        if (checkError) {
          console.error('Error checking existing emails:', checkError);
          continue;
        }

        // Check if we've already sent 3 emails (maximum)
        if (sentEmails && sentEmails.length >= 3) {
          console.log(`Maximum 3 emails already sent for cart ${cart.id}, skipping`);
          continue;
        }

        // Determine which trigger type to send next based on time elapsed and previous emails
        // Email sequence: 1st at 1 hour, 2nd at 24 hours, 3rd at 72 hours
        let triggerType: 'pricing_page_view' | 'plan_selected' | 'pricing_page_view_24h' | 'pricing_page_view_72h' | null = null;
        let requiredDelayMinutes = 0;
        
        const cartTime = new Date(cart.created_at).getTime();
        const hoursElapsed = (Date.now() - cartTime) / (1000 * 60 * 60);

        if (!sentEmails || sentEmails.length === 0) {
          // First email: send after 1 hour
          triggerType = cart.step_abandoned === 4 ? 'plan_selected' : 'pricing_page_view';
          requiredDelayMinutes = 60;
        } else if (sentEmails.length === 1) {
          // Second email: send after 24 hours from cart creation
          triggerType = 'pricing_page_view_24h';
          requiredDelayMinutes = 24 * 60;
        } else if (sentEmails.length === 2) {
          // Third email: send after 72 hours from cart creation
          triggerType = 'pricing_page_view_72h';
          requiredDelayMinutes = 72 * 60;
        }

        // Skip if not a step we want to send emails for
        if (!triggerType || (cart.step_abandoned !== 3 && cart.step_abandoned !== 4)) {
          continue;
        }

        // Check if enough time has passed since cart was abandoned
        const delayMs = requiredDelayMinutes * 60 * 1000;
        const shouldSendAt = cartTime + delayMs;
        
        if (Date.now() < shouldSendAt) {
          console.log(`Not yet time to send email ${sentEmails?.length + 1}/3 for cart ${cart.id} (${hoursElapsed.toFixed(1)}h elapsed, need ${requiredDelayMinutes / 60}h)`);
          continue;
        }

        // Send the email
        try {

            // Send the email
            const emailPayload = {
              cartId: cart.id, // Include cart ID to track individual carts
              email: cart.email,
              firstName: cart.full_name?.split(' ')[0] || 'there',
              lastName: cart.full_name?.split(' ').slice(1).join(' ') || '', // Get last name from full name
              phone: cart.phone || '',
              vehicleReg: cart.vehicle_reg,
              vehicleMake: cart.vehicle_make,
              vehicleModel: cart.vehicle_model,
              vehicleYear: cart.vehicle_year || '',
              vehicleType: cart.vehicle_type, // Include vehicle type for special vehicles
              mileage: cart.mileage || '0',
              fuelType: '', // Not stored in abandoned carts, will be empty
              transmission: '', // Not stored in abandoned carts, will be empty
              triggerType,
              planName: cart.plan_name,
              paymentType: cart.payment_type
            };

            console.log(`Sending abandoned cart email ${(sentEmails?.length || 0) + 1}/3 for:`, emailPayload);

            const emailResponse = await supabase.functions.invoke('send-abandoned-cart-email', {
              body: emailPayload
            });

          if (emailResponse.error) {
            console.error('Error sending email:', emailResponse.error);
            errorsCount++;
          } else {
            console.log(`Email ${(sentEmails?.length || 0) + 1}/3 sent successfully for cart: ${cart.id}`);
            emailsSent++;
          }
        } catch (innerError) {
          console.error('Error processing cart:', cart.id, innerError);
          errorsCount++;
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