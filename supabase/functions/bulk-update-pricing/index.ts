import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PricingRow {
  plan_name: string;
  vehicle_type?: string;
  monthly_price: string;
  yearly_price?: string;
  two_yearly_price?: string;
  three_yearly_price?: string;
}

interface UpdateRequest {
  pricingData: PricingRow[];
}

function logStep(step: string, details?: any) {
  console.log(`[BULK-PRICING] ${step}`, details ? JSON.stringify(details) : '');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting bulk pricing update");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { pricingData }: UpdateRequest = await req.json();
    logStep("Received pricing data", { count: pricingData.length });

    const results = {
      success: 0,
      errors: [] as string[]
    };

    // Process each pricing row
    for (let i = 0; i < pricingData.length; i++) {
      const row = pricingData[i];
      const rowNum = i + 1;
      
      try {
        logStep(`Processing row ${rowNum}`, row);

        // Determine which table to update based on vehicle_type
        const isSpecialVehicle = row.vehicle_type && row.vehicle_type !== 'standard';
        const tableName = isSpecialVehicle ? 'special_vehicle_plans' : 'plans';
        
        // Build update object
        const updateData: any = {
          monthly_price: parseFloat(row.monthly_price)
        };

        if (row.yearly_price) {
          updateData.yearly_price = parseFloat(row.yearly_price);
        }
        if (row.two_yearly_price) {
          updateData.two_yearly_price = parseFloat(row.two_yearly_price);
        }
        if (row.three_yearly_price) {
          updateData.three_yearly_price = parseFloat(row.three_yearly_price);
        }

        updateData.updated_at = new Date().toISOString();

        // Build query conditions
        let query = supabaseClient
          .from(tableName)
          .update(updateData)
          .eq('name', row.plan_name);

        // Add vehicle_type condition for special vehicles
        if (isSpecialVehicle) {
          query = query.eq('vehicle_type', row.vehicle_type);
        }

        const { data, error } = await query;

        if (error) {
          logStep(`Error updating row ${rowNum}`, error);
          results.errors.push(`Row ${rowNum}: ${error.message}`);
          continue;
        }

        // Check if any rows were actually updated
        const { count } = await supabaseClient
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .eq('name', row.plan_name)
          .eq('vehicle_type', row.vehicle_type || 'standard');

        if (count === 0) {
          results.errors.push(`Row ${rowNum}: Plan "${row.plan_name}" with vehicle type "${row.vehicle_type || 'standard'}" not found`);
          continue;
        }

        results.success++;
        logStep(`Successfully updated row ${rowNum}`);

      } catch (rowError: any) {
        logStep(`Exception processing row ${rowNum}`, rowError);
        results.errors.push(`Row ${rowNum}: ${rowError.message}`);
      }
    }

    logStep("Bulk pricing update completed", results);

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    logStep("Error in bulk pricing update", error);
    return new Response(
      JSON.stringify({ 
        success: 0,
        errors: [`Failed to process bulk pricing update: ${error.message}`]
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);