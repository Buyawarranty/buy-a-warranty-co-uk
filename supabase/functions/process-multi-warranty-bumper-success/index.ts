import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-MULTI-WARRANTY-BUMPER-SUCCESS] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing multi-warranty Bumper success");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const url = new URL(req.url);
    const items = JSON.parse(url.searchParams.get('items') || '[]');
    const customerData = JSON.parse(url.searchParams.get('customer_data') || '{}');
    const discountCode = url.searchParams.get('discount_code') || '';
    const totalAmount = parseFloat(url.searchParams.get('total_amount') || '0');
    const redirectUrl = url.searchParams.get('redirect') || 'https://buyawarranty.com/thank-you';

    logStep("Extracted parameters", { 
      itemCount: items.length, 
      totalAmount, 
      customerEmail: customerData.email,
      discountCode,
      redirectUrl
    });

    // Process each warranty item
    const processedWarranties = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      logStep(`Processing warranty ${i + 1}`, { 
        planName: item.planName, 
        vehicleReg: item.vehicleData.regNumber,
        totalPrice: item.totalPrice
      });

      try {
        // Generate warranty number
        const warrantyNumber = await generateWarrantyNumber(supabaseService);
        
        // Insert warranty record
        const { data: warrantyData, error: warrantyError } = await supabaseService
          .from('warranties')
          .insert({
            warranty_number: warrantyNumber,
            customer_email: customerData.email,
            customer_first_name: customerData.first_name,
            customer_last_name: customerData.last_name,
            customer_mobile: customerData.mobile,
            customer_address_line_1: customerData.street,
            customer_town: customerData.town,
            customer_county: customerData.county,
            customer_postcode: customerData.postcode,
            customer_country: customerData.country,
            vehicle_reg: item.vehicleData.regNumber,
            vehicle_make: item.vehicleData.make,
            vehicle_model: item.vehicleData.model,
            vehicle_year: item.vehicleData.year,
            vehicle_fuel_type: item.vehicleData.fuelType,
            vehicle_transmission: item.vehicleData.transmission,
            mileage: item.vehicleData.mileage,
            plan_type: item.planName.toLowerCase(),
            payment_type: 'monthly', // Bumper always uses monthly
            voluntary_excess: item.voluntaryExcess || 0,
            total_price: item.totalPrice,
            payment_method: 'bumper',
            payment_status: 'completed',
            policy_start_date: new Date().toISOString(),
            policy_end_date: calculatePolicyEndDate('yearly'), // Default to yearly for warranties
            status: 'active'
          })
          .select()
          .single();

        if (warrantyError) {
          logStep(`Error creating warranty ${i + 1}`, { error: warrantyError });
          throw warrantyError;
        }

        processedWarranties.push({
          warrantyNumber,
          vehicleReg: item.vehicleData.regNumber,
          planName: item.planName,
          totalPrice: item.totalPrice
        });

        logStep(`Warranty ${i + 1} created successfully`, { 
          warrantyNumber, 
          vehicleReg: item.vehicleData.regNumber 
        });

      } catch (error) {
        logStep(`Failed to process warranty ${i + 1}`, { error: error.message });
        throw error;
      }
    }

    // Send welcome email for all warranties
    try {
      const { error: emailError } = await supabaseService.functions.invoke('send-welcome-email', {
        body: {
          customer_email: customerData.email,
          customer_name: `${customerData.first_name} ${customerData.last_name}`,
          warranties: processedWarranties,
          payment_method: 'bumper',
          total_amount: totalAmount,
          is_multi_warranty: true
        }
      });

      if (emailError) {
        logStep("Warning: Failed to send welcome email", { error: emailError });
      } else {
        logStep("Welcome email sent successfully");
      }
    } catch (emailError) {
      logStep("Warning: Error sending welcome email", { error: emailError });
    }

    logStep("Multi-warranty Bumper success processing completed", { 
      processedCount: processedWarranties.length,
      totalAmount,
      customerEmail: customerData.email
    });

    // Redirect to success page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-multi-warranty-bumper-success", { message: errorMessage });
    
    // Redirect to error page
    const errorRedirect = req.headers.get("origin") || "https://buyawarranty.com";
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${errorRedirect}/payment-fallback?error=processing_failed`
      }
    });
  }
});

async function generateWarrantyNumber(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('generate_warranty_number');
    
    if (error) {
      console.error('Error generating warranty number:', error);
      // Fallback to time-based warranty number
      return `BAW-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    }
    
    return data;
  } catch (error) {
    console.error('Error calling generate_warranty_number:', error);
    // Fallback to time-based warranty number
    return `BAW-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  }
}

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
      startDate.setFullYear(startDate.getFullYear() + 1);
  }
  
  return startDate.toISOString();
}