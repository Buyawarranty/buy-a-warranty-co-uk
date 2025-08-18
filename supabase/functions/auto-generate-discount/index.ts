import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTO-GENERATE-DISCOUNT] ${step}${detailsStr}`);
};

const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MULTI';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { customerEmail, orderAmount } = await req.json();
    if (!customerEmail) throw new Error("Customer email is required");

    logStep("Auto-generating discount code", { customerEmail, orderAmount });

    // Generate a unique discount code
    let discountCode = generateRandomCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const { data: existingCode } = await supabaseClient
        .from('discount_codes')
        .select('id')
        .eq('code', discountCode)
        .single();

      if (!existingCode) break;
      
      discountCode = generateRandomCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique discount code");
    }

    // Create the discount code with 24 hour expiry and single use
    const validFrom = new Date();
    const validTo = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data: newDiscountCode, error: createError } = await supabaseClient
      .from('discount_codes')
      .insert({
        code: discountCode,
        type: 'percentage',
        value: 10,
        valid_from: validFrom.toISOString(),
        valid_to: validTo.toISOString(),
        usage_limit: 1,
        used_count: 0,
        active: true,
        applicable_products: ["all"]
      })
      .select()
      .single();

    if (createError) {
      logStep("Error creating discount code", { error: createError });
      throw new Error("Failed to create discount code");
    }

    // Calculate discount amount
    const discountAmount = (orderAmount * 10) / 100;
    const finalAmount = orderAmount - discountAmount;

    logStep("Auto-generated discount code successfully", {
      code: discountCode,
      discountAmount,
      finalAmount,
      validTo
    });

    return new Response(JSON.stringify({
      success: true,
      discountCode: {
        id: newDiscountCode.id,
        code: newDiscountCode.code,
        type: newDiscountCode.type,
        value: newDiscountCode.value
      },
      discountAmount,
      finalAmount,
      expiresAt: validTo.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in auto-generate-discount", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Failed to generate discount code" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});