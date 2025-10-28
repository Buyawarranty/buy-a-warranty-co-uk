import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { createBrevoClient } from "../_shared/brevo-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  email: string;
  event_type: 'cart_updated' | 'order_completed' | 'contact_created' | 'contact_updated';
  contact_data?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    vehicleReg?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    planName?: string;
    paymentType?: string;
    policyNumber?: string;
    orderValue?: number;
  };
  event_data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Starting Brevo sync...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Brevo client
    const brevo = createBrevoClient();

    // Parse request body
    const syncRequest: SyncRequest = await req.json();
    console.log(`📧 Syncing ${syncRequest.event_type} for ${syncRequest.email}`);

    // Log the sync attempt
    const { data: logEntry, error: logError } = await supabase
      .from('brevo_sync_log')
      .insert({
        customer_email: syncRequest.email,
        event_type: syncRequest.event_type,
        event_data: syncRequest.event_data || {},
        sync_status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error("Error creating sync log:", logError);
      throw logError;
    }

    const logId = logEntry.id;

    try {
      // Step 1: Create or update contact if contact data is provided
      let brevoContactId: string | undefined;

      if (syncRequest.contact_data) {
        console.log("👤 Creating/updating Brevo contact...");
        
        const contactResult = await brevo.createOrUpdateContact({
          email: syncRequest.email,
          attributes: {
            FIRSTNAME: syncRequest.contact_data.firstName,
            LASTNAME: syncRequest.contact_data.lastName,
            PHONE: syncRequest.contact_data.phone,
            VEHICLE_REG: syncRequest.contact_data.vehicleReg,
            VEHICLE_MAKE: syncRequest.contact_data.vehicleMake,
            VEHICLE_MODEL: syncRequest.contact_data.vehicleModel,
            PLAN_NAME: syncRequest.contact_data.planName,
            PAYMENT_TYPE: syncRequest.contact_data.paymentType,
            POLICY_NUMBER: syncRequest.contact_data.policyNumber,
            ORDER_VALUE: syncRequest.contact_data.orderValue,
          },
          updateEnabled: true,
        });

        if (!contactResult.success) {
          throw new Error(`Failed to create/update contact: ${contactResult.error}`);
        }

        brevoContactId = contactResult.contactId;
        console.log("✅ Contact created/updated:", brevoContactId);

        // Update customer record with Brevo contact ID
        if (brevoContactId && syncRequest.event_type === 'order_completed') {
          await supabase
            .from('customers')
            .update({ brevo_contact_id: brevoContactId })
            .eq('email', syncRequest.email);
        }
      }

      // Step 2: Track event in Brevo (for cart_updated and order_completed)
      if (syncRequest.event_type === 'cart_updated' || syncRequest.event_type === 'order_completed') {
        console.log(`📊 Tracking ${syncRequest.event_type} event...`);
        
        const eventResult = await brevo.trackEvent({
          email: syncRequest.email,
          event: syncRequest.event_type,
          eventdata: syncRequest.event_data || {},
        });

        if (!eventResult.success) {
          throw new Error(`Failed to track event: ${eventResult.error}`);
        }

        console.log(`✅ Event ${syncRequest.event_type} tracked successfully`);
      }

      // Update sync log with success
      await supabase
        .from('brevo_sync_log')
        .update({
          sync_status: 'success',
          brevo_contact_id: brevoContactId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId);

      console.log("✅ Brevo sync completed successfully");

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully synced ${syncRequest.event_type} to Brevo`,
          brevo_contact_id: brevoContactId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (syncError) {
      // Update sync log with failure
      await supabase
        .from('brevo_sync_log')
        .update({
          sync_status: 'failed',
          error_message: String(syncError),
          updated_at: new Date().toISOString(),
        })
        .eq('id', logId);

      throw syncError;
    }

  } catch (error: any) {
    console.error("❌ Error in sync-to-brevo:", error);
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
