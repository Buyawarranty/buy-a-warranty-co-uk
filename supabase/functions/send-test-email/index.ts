import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: 'Buy A Warranty <info@buyawarranty.co.uk>',
      to: [email],
      subject: 'Test Email - API Key Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 3px solid #ff6b35; padding-bottom: 10px;">🎉 Success!</h1>
          <p style="font-size: 16px; line-height: 1.6;">This is a test email to verify that your Resend API key is working correctly.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Email System Status: WORKING</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>API Key:</strong> Valid and active</li>
              <li style="padding: 5px 0;"><strong>Email Service:</strong> Resend</li>
              <li style="padding: 5px 0;"><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            Automated welcome emails should now work properly for new warranty purchases.
          </p>
        </div>
      `
    });

    if (emailResponse.error) {
      console.error('Resend API Error:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email", 
          details: emailResponse.error 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Test email sent successfully:', emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Test email sent successfully",
      emailId: emailResponse.data?.id,
      to: email
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in test email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);