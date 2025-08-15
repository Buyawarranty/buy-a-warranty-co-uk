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
  isInitialQuote?: boolean; // Flag for pre-plan-selection emails
}

const formatPaymentType = (paymentType: string): string => {
  switch (paymentType) {
    case '12months': return '12 months';
    case '24months': return '24 months';
    case '36months': return '36 months';
    case 'yearly': return '12 months'; // Legacy compatibility
    case 'two_yearly': return '24 months'; // Legacy compatibility
    case 'three_yearly': return '36 months'; // Legacy compatibility
    default: return paymentType;
  }
};

const generateQuoteEmail = (data: QuoteEmailRequest): string => {
  const { firstName, lastName, vehicleData, planData, quoteId, isInitialQuote } = data;
  const { regNumber, make, model, year, mileage } = vehicleData;
  const { planName, totalPrice, monthlyPrice, voluntaryExcess, paymentType, selectedAddOns } = planData;
  
  // Generate purchase URL with quote ID - use the correct domain
  const baseUrl = 'https://8037b426-cb66-497b-bb9a-14209b3fb079.lovableproject.com';
  const purchaseUrl = `${baseUrl}/?quote=${quoteId}&email=${encodeURIComponent(data.email)}`;
  
  const addOnsList = Object.entries(selectedAddOns || {})
    .filter(([_, selected]) => selected)
    .map(([addon]) => `<li style="margin: 5px 0;">✓ ${addon}</li>`)
    .join('');
  
  // Use your new email template
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your ${make || 'Vehicle'} Warranty Quote</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚗 Your ${make || 'Vehicle'}'s Warranty Quote</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Lock In Your Price Today</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
            <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px;">Hello Valued Customer</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px;">
                Your ${make || 'vehicle'} is just one step away from being fully protected against unexpected repair bills.<br>
                We've secured your exclusive warranty quote – starting from just £19.99/month – and saved it for the next 48 hours.
            </p>

            <!-- Vehicle Details -->
            <div style="background-color: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0; border-radius: 6px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Your Vehicle Details</h3>
                <div style="font-size: 16px; line-height: 1.8;">
                    <div><strong>Registration:</strong> ${regNumber}</div>
                    <div><strong>Make:</strong> ${make || 'N/A'}</div>
                    <div><strong>Year:</strong> ${year || 'N/A'}</div>
                    <div><strong>Mileage:</strong> ${mileage}</div>
                </div>
            </div>

            <!-- Coverage Options -->
            <div style="margin: 30px 0;">
                <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px;">💡 Choose Your Perfect Level of Cover:</h3>
                
                <div style="background-color: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px; font-size: 16px;">✅ Basic Coverage</div>
                    <div style="color: #374151;">Essential protection for key mechanical components</div>
                </div>
                
                <div style="background-color: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px; font-size: 16px;">✅ Comprehensive Coverage</div>
                    <div style="color: #374151;">Mechanical + electrical protection for peace of mind</div>
                </div>
                
                <div style="background-color: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px; font-size: 16px;">✅ Premium Coverage</div>
                    <div style="color: #374151;">Maximum cover with added benefits & extras</div>
                </div>
            </div>

            <!-- Why Choose Us -->
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 6px;">
                <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">Why Choose Buy A Warranty?</h3>
                <div style="color: #92400e; font-size: 16px; line-height: 1.8;">
                    <div style="margin-bottom: 8px;">⭐ 5-Star Rated on Trustpilot</div>
                    <div style="margin-bottom: 8px;">💳 Flexible Monthly Payments</div>
                    <div style="margin-bottom: 8px;">Interest free options</div>
                    <div style="margin-bottom: 8px;">Best value and service</div>
                    <div style="margin-bottom: 8px;">⚡ Lightning-Fast Claims Approval</div>
                </div>
            </div>

            <!-- Urgency Message -->
            <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 20px; margin: 20px 0; border-radius: 6px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #dc2626; font-weight: bold;">⚡ Don't wait until it's too late.</p>
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                    Every day without cover puts you at risk of costly repairs – even a small fault could cost £1,000+.
                </p>
            </div>
        </div>

        <!-- CTA Button -->
        <div style="padding: 0 20px 30px 20px; text-align: center;">
            <a href="${purchaseUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); margin-bottom: 20px;">
                🔒 Complete My Quote & See My Price
            </a>
            
            <p style="margin: 15px 0; font-size: 16px; color: #374151;">
                Or call us on <a href="tel:+443302295040" style="color: #1e40af; font-weight: bold;">0330 229 5040</a> and we'll walk you through the options in minutes.
            </p>
        </div>

        <!-- Footer Message -->
        <div style="background-color: #1f2937; color: #d1d5db; padding: 25px 20px; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #fbbf24;">
                P.S. This quote is only valid for the next 48 hours – secure your plan now and lock in today's low rate.
            </p>
            
            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">Kind regards</p>
                <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">Buy A Warranty</p>
                <p style="margin: 0 0 15px 0; font-size: 14px;">Customer Service & Sales Team</p>
                
                <p style="margin: 0; font-size: 14px;">
                    📞 <a href="tel:+443302295040" style="color: #60a5fa;">0330 229 5040</a> | 
                    📧 <a href="mailto:support@buyawarranty.co.uk" style="color: #60a5fa;">support@buyawarranty.co.uk</a>
                </p>
            </div>
            
            <div style="border-top: 1px solid #374151; padding-top: 15px; margin-top: 20px; font-size: 12px; color: #9ca3af;">
                <p style="margin: 0 0 5px 0;">© Buy A Warranty. All rights reserved.</p>
                <p style="margin: 0;">You received this email because you requested a quote on our website.</p>
            </div>
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
    if (!emailRequest.email || !emailRequest.firstName || !emailRequest.vehicleData) {
      throw new Error("Missing required fields: email, firstName, or vehicleData");
    }

    // Ensure planData exists with defaults if not provided
    if (!emailRequest.planData) {
      emailRequest.planData = {
        planName: "Vehicle Protection Plans",
        totalPrice: 0,
        monthlyPrice: 19.99,
        voluntaryExcess: 50,
        paymentType: "12months",
        selectedAddOns: {}
      };
    }

    // Generate unique quote ID if not provided
    const quoteId = emailRequest.quoteId || `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Generate the email HTML
    const emailHtml = generateQuoteEmail({
      ...emailRequest,
      quoteId
    });

    // Send email using Resend with enhanced anti-spam measures
    const emailResponse = await resend.emails.send({
      from: "Buy A Warranty <noreply@buyawarranty.co.uk>",
      reply_to: "support@buyawarranty.co.uk", 
      to: [emailRequest.email],
      subject: `🚗 Your ${emailRequest.vehicleData.make || 'Vehicle'}'s Warranty Quote – Lock In Your Price Today`,
      html: emailHtml,
      text: `Your ${emailRequest.vehicleData.make || 'Vehicle'}'s Warranty Quote

Hello Valued Customer,

Your ${emailRequest.vehicleData.make || 'vehicle'} is just one step away from being fully protected against unexpected repair bills.

Vehicle Details:
- Registration: ${emailRequest.vehicleData.regNumber}
- Make: ${emailRequest.vehicleData.make || 'N/A'}
- Year: ${emailRequest.vehicleData.year || 'N/A'} 
- Mileage: ${emailRequest.vehicleData.mileage}

Complete your quote: ${purchaseUrl}

Or call us on 0330 229 5040

Kind regards,
Buy A Warranty Customer Service Team`,
      headers: {
        'X-Entity-Ref-ID': quoteId,
        'List-Unsubscribe': '<mailto:unsubscribe@buyawarranty.co.uk>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Mailer': 'BuyAWarranty Quote System v1.0',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'Auto-Submitted': 'auto-generated',
      },
      tags: [
        { name: 'category', value: 'quote-email' },
        { name: 'vehicle-make', value: emailRequest.vehicleData.make || 'unknown' }
      ]
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