import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-DISCOUNT-EMAIL] ${step}${detailsStr}`);
};

interface DiscountEmailRequest {
  email: string;
  discountCode: string;
  discountAmount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    
    const { email, discountCode, discountAmount }: DiscountEmailRequest = await req.json();
    
    logStep("Sending discount email", { email, discountCode, discountAmount });

    const emailResponse = await resend.emails.send({
      from: "BuyaWarranty <onboarding@resend.dev>",
      to: [email],
      subject: "Your £25 Discount Code is Here! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Discount Code</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">
              <span style="color: #3b82f6;">buya</span><span style="color: #f97316;">warranty</span>
            </h1>
          </div>

          <div style="background: linear-gradient(135deg, #3b82f6, #f97316); padding: 30px; border-radius: 15px; text-align: center; color: white; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 28px;">🎉 Your Discount Code!</h2>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">Save £${discountAmount} on your warranty</p>
          </div>

          <div style="background: #f8f9fa; border: 2px dashed #e9ecef; border-radius: 10px; padding: 25px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #666;">Your discount code:</p>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 2px; font-family: 'Courier New', monospace;">
              ${discountCode}
            </div>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">💡 How to use your code:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Choose your warranty coverage</li>
              <li>Enter code <strong>${discountCode}</strong> at checkout</li>
              <li>Enjoy £${discountAmount} off your total!</li>
            </ol>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://id-preview--8037b426-cb66-497b-bb9a-14209b3fb079.lovable.app/" 
               style="background: #f97316; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Get Your Warranty Now
            </a>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>This discount code expires in 24 hours. Don't miss out!</p>
            <p style="margin: 20px 0 0 0;">
              Best regards,<br>
              The BuyaWarranty Team
            </p>
          </div>

        </body>
        </html>
      `,
    });

    logStep("Email sent successfully", { emailId: emailResponse.data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-discount-email", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});