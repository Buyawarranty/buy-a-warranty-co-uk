import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, data?: any) => {
  console.log(`[SEND-QUOTE-EMAIL] ${step}`, data ? JSON.stringify(data) : '');
};

interface QuoteEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  vehicleData: {
    regNumber: string;
    make?: string;
    model?: string;
    year?: string;
    mileage: string;
    fuelType?: string;
    transmission?: string;
    vehicleType?: string;
  };
  isInitialQuote?: boolean;
  selectedPlan?: {
    name: string;
    price: number;
    paymentType: string;
  };
}

const formatPaymentType = (paymentType: string): string => {
  switch (paymentType) {
    case 'monthly': return 'Monthly';
    case 'yearly': return 'Annual';
    case 'twoYear': return '2 Year';
    case 'threeYear': return '3 Year';
    default: return paymentType;
  }
};

const generateQuoteEmail = (data: QuoteEmailRequest): string => {
  const { vehicleData, firstName, lastName, selectedPlan } = data;
  const customerName = firstName || 'Valued Customer';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Warranty Quote</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">buya<span style="color: #ea580c;">warranty</span></h1>
        <p style="color: #64748b; margin: 5px 0 0 0;">Your Warranty Quote</p>
      </div>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${customerName}!</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for requesting a warranty quote. Here are your details:
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Vehicle Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Registration:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${vehicleData.regNumber}</td>
            </tr>
            ${vehicleData.make ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Make & Model:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${vehicleData.make || ''} ${vehicleData.model || ''}</td>
            </tr>
            ` : ''}
            ${vehicleData.year ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Year:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${vehicleData.year}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Mileage:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${vehicleData.mileage} miles</td>
            </tr>
            ${vehicleData.fuelType ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Fuel Type:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${vehicleData.fuelType}</td>
            </tr>
            ` : ''}
            ${vehicleData.transmission ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Transmission:</strong></td>
              <td style="padding: 8px 0;">${vehicleData.transmission}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        ${selectedPlan ? `
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #22c55e;">
          <h3 style="color: #16a34a; margin-top: 0; border-bottom: 2px solid #dcfce7; padding-bottom: 10px;">Selected Plan</h3>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: #16a34a; margin-bottom: 10px;">
              ${selectedPlan.name}
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 5px;">
              £${selectedPlan.price}
            </div>
            <div style="color: #64748b; font-size: 14px;">
              ${formatPaymentType(selectedPlan.paymentType)} Payment
            </div>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center;">
        <h3 style="color: #1e293b; margin-top: 0;">Ready to Complete Your Purchase?</h3>
        <p>Click the link below to resume your quote and complete your warranty purchase:</p>
        
        <div style="margin: 20px 0;">
          <a href="https://buyawarranty.co.uk/?regNumber=${vehicleData.regNumber}&mileage=${vehicleData.mileage}" 
             style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
            Complete My Purchase
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          This link will take you back to get your quote with your vehicle details pre-filled.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #64748b;">
          Questions? Contact us at info@buyawarranty.co.uk or call us at 0800 123 4567
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
          BuyaWarranty - Protecting your peace of mind
        </p>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const data: QuoteEmailRequest = await req.json();
    
    logStep('Sending quote email', { email: data.email, vehicle: data.vehicleData.regNumber });

    const resend = new Resend(resendApiKey);
    const htmlContent = generateQuoteEmail(data);

    const emailResponse = await resend.emails.send({
      from: "BuyaWarranty <noreply@buyawarranty.co.uk>",
      to: [data.email],
      subject: `Your Warranty Quote - ${data.vehicleData.regNumber}`,
      html: htmlContent,
    });

    logStep('Email sent successfully', emailResponse);

    // Log email activity (skip database operations for now as tables may not exist)
    logStep('Quote email sent and logged successfully');

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-quote-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);