import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  vehicleData: {
    regNumber: string;
    make?: string;
    model?: string;
    year?: string;
    mileage: string;
    vehicleType?: string;
  };
  planData: {
    planName: string;
    totalPrice: number;
    monthlyPrice: number;
    voluntaryExcess: number;
    paymentType: string;
    selectedAddOns: { [addon: string]: boolean };
  };
  quoteId: string;
}

const formatPaymentType = (paymentType: string): string => {
  switch (paymentType) {
    case 'yearly': return '12 months';
    case 'two_yearly': return '24 months';
    case 'three_yearly': return '36 months';
    default: return paymentType;
  }
};

const generateQuoteEmail = (data: QuoteEmailRequest): string => {
  const { firstName, lastName, vehicleData, planData, quoteId } = data;
  const { regNumber, make, model, year, mileage } = vehicleData;
  const { planName, totalPrice, monthlyPrice, voluntaryExcess, paymentType, selectedAddOns } = planData;
  
  // Generate purchase URL with quote ID - use the app's domain
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.lovable.app') || 'https://buyawarranty.lovable.app';
  const purchaseUrl = `${baseUrl}/?quote=${quoteId}&email=${encodeURIComponent(data.email)}`;
  
  const addOnsList = Object.entries(selectedAddOns)
    .filter(([_, selected]) => selected)
    .map(([addon]) => `<li style="margin: 5px 0;">✓ ${addon}</li>`)
    .join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Vehicle Warranty Quote</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Your Warranty Quote</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Quote ID: ${quoteId}</p>
        </div>

        <!-- Personal Details -->
        <div style="padding: 30px 20px;">
            <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Hello ${firstName} ${lastName}!</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for requesting a quote for your vehicle warranty. Here are the details:</p>
        </div>

        <!-- Vehicle Details -->
        <div style="padding: 0 20px 20px 20px;">
            <div style="background-color: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Vehicle Details</h3>
                <div style="display: grid; gap: 8px;">
                    <div><strong>Registration:</strong> ${regNumber}</div>
                    ${make ? `<div><strong>Make:</strong> ${make}</div>` : ''}
                    ${model ? `<div><strong>Model:</strong> ${model}</div>` : ''}
                    ${year ? `<div><strong>Year:</strong> ${year}</div>` : ''}
                    <div><strong>Mileage:</strong> ${mileage}</div>
                </div>
            </div>
        </div>

        <!-- Plan Details -->
        <div style="padding: 0 20px 20px 20px;">
            <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; text-align: center;">${planName} Plan</h3>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">£${monthlyPrice}</div>
                    <div style="color: #6b7280; font-size: 16px;">per month × ${formatPaymentType(paymentType)}</div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                        <strong>Total Coverage Period: ${formatPaymentType(paymentType)}</strong>
                    </div>
                    <div style="margin-top: 5px; color: #6b7280;">
                        Voluntary Excess: £${voluntaryExcess}
                    </div>
                </div>

                ${addOnsList ? `
                <div style="margin-top: 20px;">
                    <h4 style="color: #1e40af; margin: 0 0 10px 0;">Included Add-ons:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #059669;">
                        ${addOnsList}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- CTA Button -->
        <div style="padding: 0 20px 30px 20px; text-align: center;">
            <a href="${purchaseUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                Purchase Your Warranty Now
            </a>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
                Click the button above to complete your purchase in just a few simple steps.
            </p>
        </div>

        <!-- Important Info -->
        <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; margin: 0 20px 20px 20px; border-radius: 6px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Important Information:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px;">
                <li>This quote is valid for 30 days from the date of issue</li>
                <li>Coverage begins from the date of purchase</li>
                <li>All prices include VAT</li>
                <li>Terms and conditions apply</li>
            </ul>
        </div>

        <!-- Support -->
        <div style="padding: 20px; text-align: center; background-color: #f8fafc; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Need help? Contact our support team:</p>
            <p style="margin: 0;">
                Email: <a href="mailto:info@buyawarranty.co.uk" style="color: #1e40af;">info@buyawarranty.co.uk</a> |
                Phone: 0800 123 4567
            </p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px; text-align: center; background-color: #1f2937; color: #d1d5db; font-size: 12px;">
            <p style="margin: 0;">© 2024 Buy A Warranty. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">
                You received this email because you requested a warranty quote on our website.
            </p>
        </div>
    </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: QuoteEmailRequest = await req.json();
    console.log('Sending quote email:', emailRequest);

    // Validate required fields
    if (!emailRequest.email || !emailRequest.firstName || !emailRequest.planData) {
      throw new Error("Missing required fields: email, firstName, or planData");
    }

    // Generate unique quote ID if not provided
    const quoteId = emailRequest.quoteId || `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Generate the email HTML
    const emailHtml = generateQuoteEmail({
      ...emailRequest,
      quoteId
    });

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Buy A Warranty <info@buyawarranty.co.uk>",
      to: [emailRequest.email],
      subject: `Your Vehicle Warranty Quote - ${emailRequest.planData.planName} Plan`,
      html: emailHtml,
    });

    console.log('Quote email sent successfully:', emailResponse);

    // Log the email in Supabase for tracking
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient_email: emailRequest.email,
        subject: `Your Vehicle Warranty Quote - ${emailRequest.planData.planName} Plan`,
        status: 'sent',
        metadata: {
          quote_id: quoteId,
          plan_name: emailRequest.planData.planName,
          vehicle_reg: emailRequest.vehicleData.regNumber,
          email_type: 'quote'
        }
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Quote email sent successfully",
      quoteId,
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-quote-email function:", error);
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