import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

interface PolicyData {
  id: string;
  email: string;
  customer_id: string | null;
  created_at: string;
  policy_number: string;
}

interface CustomerData {
  first_name: string;
  last_name: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[TRUSTPILOT-REVIEW] Starting Trustpilot review email batch...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "trustpilot_review_request")
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      console.error("[TRUSTPILOT-REVIEW] Email template not found:", templateError);
      throw new Error("Trustpilot review email template not found");
    }

    console.log("[TRUSTPILOT-REVIEW] Template loaded:", template.name);

    // Calculate the date range for policies purchased 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0); // Start of day

    const twoDaysAgoEnd = new Date(twoDaysAgo);
    twoDaysAgoEnd.setHours(23, 59, 59, 999); // End of day

    console.log("[TRUSTPILOT-REVIEW] Searching for policies created between:", {
      start: twoDaysAgo.toISOString(),
      end: twoDaysAgoEnd.toISOString(),
    });

    // Get policies created exactly 2 days ago that haven't received the review email yet
    const { data: policies, error: policiesError } = await supabase
      .from("customer_policies")
      .select("id, email, customer_id, created_at, policy_number")
      .gte("created_at", twoDaysAgo.toISOString())
      .lte("created_at", twoDaysAgoEnd.toISOString())
      .eq("status", "active")
      .not("email", "is", null);

    if (policiesError) {
      console.error("[TRUSTPILOT-REVIEW] Error fetching policies:", policiesError);
      throw policiesError;
    }

    if (!policies || policies.length === 0) {
      console.log("[TRUSTPILOT-REVIEW] No policies found for review emails");
      return new Response(
        JSON.stringify({ success: true, message: "No policies to process", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[TRUSTPILOT-REVIEW] Found ${policies.length} policies to process`);

    // Filter out policies that have already received the review email
    const policyIds = policies.map((p: PolicyData) => p.id);
    const { data: alreadySent, error: sentError } = await supabase
      .from("trustpilot_review_emails")
      .select("policy_id")
      .in("policy_id", policyIds);

    if (sentError) {
      console.error("[TRUSTPILOT-REVIEW] Error checking sent emails:", sentError);
    }

    const sentPolicyIds = new Set(alreadySent?.map((s: { policy_id: string }) => s.policy_id) || []);
    const policiesToEmail = policies.filter((p: PolicyData) => !sentPolicyIds.has(p.id));

    if (policiesToEmail.length === 0) {
      console.log("[TRUSTPILOT-REVIEW] All eligible policies have already received the review email");
      return new Response(
        JSON.stringify({ success: true, message: "All policies already processed", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[TRUSTPILOT-REVIEW] ${policiesToEmail.length} policies need review emails`);

    let successCount = 0;
    let failCount = 0;

    // Process each policy
    for (const policy of policiesToEmail) {
      try {
        console.log(`[TRUSTPILOT-REVIEW] Processing policy ${policy.policy_number}`);

        // Get customer name if customer_id exists
        let customerFirstName = "Valued Customer";
        if (policy.customer_id) {
          const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("first_name, last_name")
            .eq("id", policy.customer_id)
            .single();

          if (!customerError && customer) {
            customerFirstName = customer.first_name || "Valued Customer";
          }
        }

        // Prepare email content from template
        const content = template.content as {
          greeting: string;
          body: string;
          cta_text: string;
          cta_url: string;
          footer: string;
        };

        const greeting = content.greeting.replace("{{customerFirstName}}", customerFirstName);

        // Build HTML email
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #eb4b00; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                ${template.subject}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 15px; line-height: 1.6; white-space: pre-line;">
                ${content.body}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${content.cta_url}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #eb4b00; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                      ${content.cta_text}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #555555; font-size: 15px; line-height: 1.6; white-space: pre-line;">
                ${content.footer}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 30px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px;">
                BuyAWarranty.co.uk
              </p>
              <p style="margin: 0; color: #888888; font-size: 13px;">
                Email: info@buyawarranty.co.uk | Phone: 0330 229 5040
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: template.from_email,
          to: [policy.email],
          subject: template.subject,
          html: htmlContent,
        });

        console.log(`[TRUSTPILOT-REVIEW] Email sent to ${policy.email}:`, emailResult);

        // Send Trustpilot invitation via API
        try {
          const trustpilotApiKey = Deno.env.get("TRUSTPILOT_API_KEY");
          const trustpilotBusinessUnitId = Deno.env.get("TRUSTPILOT_BUSINESS_UNIT_ID");

          if (trustpilotApiKey && trustpilotBusinessUnitId) {
            const trustpilotResponse = await fetch(
              `https://invitations-api.trustpilot.com/v1/private/business-units/${trustpilotBusinessUnitId}/email-invitations`,
              {
                method: "POST",
                headers: {
                  "Authorization": `ApiKey ${trustpilotApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  recipientEmail: policy.email,
                  recipientName: customerFirstName,
                  referenceId: policy.policy_number,
                  locale: "en-GB",
                  serviceReviewInvitation: {
                    preferredSendTime: new Date().toISOString(),
                  },
                }),
              }
            );

            if (trustpilotResponse.ok) {
              const trustpilotData = await trustpilotResponse.json();
              console.log(`[TRUSTPILOT-REVIEW] Trustpilot invitation created:`, trustpilotData);
            } else {
              const errorText = await trustpilotResponse.text();
              console.error(`[TRUSTPILOT-REVIEW] Trustpilot API error:`, errorText);
            }
          } else {
            console.warn("[TRUSTPILOT-REVIEW] Trustpilot API credentials not configured");
          }
        } catch (trustpilotError) {
          console.error("[TRUSTPILOT-REVIEW] Error sending Trustpilot invitation:", trustpilotError);
          // Don't fail the whole process if Trustpilot API fails
        }

        // Log the email
        const { data: emailLog, error: logError } = await supabase
          .from("email_logs")
          .insert({
            template_id: template.id,
            recipient_email: policy.email,
            customer_id: policy.customer_id,
            subject: template.subject,
            status: "sent",
            sent_at: new Date().toISOString(),
            metadata: {
              resend_id: emailResult.data?.id,
              policy_number: policy.policy_number,
              policy_id: policy.id,
            },
          })
          .select()
          .single();

        if (logError) {
          console.error(`[TRUSTPILOT-REVIEW] Error logging email for policy ${policy.policy_number}:`, logError);
        }

        // Track that this policy received the review email
        await supabase.from("trustpilot_review_emails").insert({
          policy_id: policy.id,
          customer_id: policy.customer_id,
          email: policy.email,
          email_log_id: emailLog?.id || null,
        });

        successCount++;
      } catch (error) {
        console.error(`[TRUSTPILOT-REVIEW] Error processing policy ${policy.policy_number}:`, error);
        failCount++;

        // Log failed email
        await supabase.from("email_logs").insert({
          template_id: template.id,
          recipient_email: policy.email,
          customer_id: policy.customer_id,
          subject: template.subject,
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
          metadata: {
            policy_number: policy.policy_number,
            policy_id: policy.id,
          },
        });
      }
    }

    console.log(`[TRUSTPILOT-REVIEW] Batch complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Trustpilot review emails processed`,
        sent: successCount,
        failed: failCount,
        total: policiesToEmail.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("[TRUSTPILOT-REVIEW] Fatal error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
