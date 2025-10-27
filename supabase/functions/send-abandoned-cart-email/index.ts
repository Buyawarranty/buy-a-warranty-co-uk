import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  cartId?: string;
  email: string;
  firstName: string;
  planName: string;
  paymentType: string;
  totalPrice: number;
  vehicleReg?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  subject: string;
  content: string;
  discountCode?: string;
  emailSequence: number;
  triggerType: string;
  cartData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();
    const { email, firstName, planName, paymentType, totalPrice, subject, content, cartData } = emailData;

    console.log("Sending abandoned cart email to:", email);

    // Generate cart restoration link with encoded data
    const cartRestoreData = cartData ? btoa(JSON.stringify(cartData)) : '';
    const discountParam = emailData.discountCode ? `&discount=${emailData.discountCode}` : '';
    const restoreLink = `https://buyawarranty.co.uk/cart?restore=${cartRestoreData}&returnFromAbandoned=true${discountParam}`;

    // Replace placeholders in content
    let processedContent = content
      .replace(/{firstName}/g, firstName)
      .replace(/{planName}/g, planName)
      .replace(/{paymentType}/g, paymentType)
      .replace(/{totalPrice}/g, totalPrice.toFixed(2));

    // Convert plain text content to HTML with proper formatting
    const htmlContent = processedContent
      .split('\n')
      .map(line => {
        // Handle headings
        if (line.includes("What's Covered?") || 
            line.includes("Why Choose Buyawarranty?") || 
            line.includes("Why choose buyawarranty.co.uk") ||
            line.includes("Your Quote:")) {
          return `<h2 style="color: #1a1a1a; font-size: 20px; font-weight: bold; margin: 24px 0 12px 0;">${line}</h2>`;
        }
        // Handle bullet points
        if (line.trim().startsWith('✓') || line.trim().startsWith('•')) {
          return `<p style="margin: 6px 0; padding-left: 20px;">${line}</p>`;
        }
        // Replace [Return to Your Cart] with actual link
        if (line.includes('[Return to Your Cart]')) {
          return `<div style="margin: 24px 0; text-align: center;">
            <a href="${restoreLink}" style="display: inline-block; background-color: #eb4b00; color: white; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">Return to Your Cart</a>
          </div>`;
        }
        // Handle empty lines
        if (line.trim() === '') {
          return '<br />';
        }
        // Regular paragraphs
        return `<p style="margin: 8px 0;">${line}</p>`;
      })
      .join('');

    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #eb4b00; margin: 0; font-size: 28px;">Buy A Warranty</h1>
            </div>
            
            <div style="color: #333; font-size: 16px;">
              ${htmlContent}
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 8px 0;"><strong>Buy A Warranty</strong></p>
              <p style="margin: 8px 0;">Customer Service & Sales: <a href="tel:03302295040" style="color: #eb4b00; text-decoration: none;">0330 229 5040</a></p>
              <p style="margin: 8px 0;">Claimsline: <a href="tel:03302295045" style="color: #eb4b00; text-decoration: none;">0330 229 5045</a></p>
              <p style="margin: 8px 0;"><a href="https://buyawarranty.co.uk" style="color: #eb4b00; text-decoration: none;">www.buyawarranty.co.uk</a></p>
              <p style="margin: 8px 0;"><a href="mailto:info@buyawarranty.co.uk" style="color: #eb4b00; text-decoration: none;">info@buyawarranty.co.uk</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Buy A Warranty <noreply@buyawarranty.co.uk>",
      to: [email],
      subject: subject,
      html: finalHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-abandoned-cart-email function:", error);
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
