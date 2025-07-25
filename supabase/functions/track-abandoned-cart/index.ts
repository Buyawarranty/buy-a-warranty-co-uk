import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AbandonedCartData {
  full_name?: string;
  email: string;
  phone?: string;
  vehicle_reg?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  mileage?: string;
  plan_id?: string;
  plan_name?: string;
  payment_type?: string;
  step_abandoned: number;
}

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

    const cartData: AbandonedCartData = await req.json();

    // Only track if we have at least an email
    if (!cartData.email) {
      return new Response(
        JSON.stringify({ error: "Email is required for abandoned cart tracking" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if we already have a recent abandoned cart entry for this email and step
    const { data: existingCart, error: checkError } = await supabase
      .from('abandoned_carts')
      .select('id, created_at')
      .eq('email', cartData.email)
      .eq('step_abandoned', cartData.step_abandoned)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Error checking existing cart:', checkError);
    }

    // If we have a recent entry, update it instead of creating a new one
    if (existingCart && existingCart.length > 0) {
      const { error: updateError } = await supabase
        .from('abandoned_carts')
        .update({
          full_name: cartData.full_name,
          phone: cartData.phone,
          vehicle_reg: cartData.vehicle_reg,
          vehicle_make: cartData.vehicle_make,
          vehicle_model: cartData.vehicle_model,
          vehicle_year: cartData.vehicle_year,
          mileage: cartData.mileage,
          plan_id: cartData.plan_id,
          plan_name: cartData.plan_name,
          payment_type: cartData.payment_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCart[0].id);

      if (updateError) {
        console.error('Error updating abandoned cart:', updateError);
        throw updateError;
      }

      console.log('Updated existing abandoned cart entry for:', cartData.email);
    } else {
      // Create new abandoned cart entry
      const { error: insertError } = await supabase
        .from('abandoned_carts')
        .insert([cartData]);

      if (insertError) {
        console.error('Error inserting abandoned cart:', insertError);
        throw insertError;
      }

      console.log('Created new abandoned cart entry for:', cartData.email);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Abandoned cart tracked successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in track-abandoned-cart function:", error);
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