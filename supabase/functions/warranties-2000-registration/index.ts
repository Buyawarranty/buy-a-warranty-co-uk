import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationData {
  Title: string;
  First: string;
  Surname: string;
  Addr1: string;
  Addr2?: string;
  Town: string;
  PCode: string;
  Tel: string;
  Mobile: string;
  EMail: string;
  PurDate: string; // yyyy-mm-dd
  Make: string;
  Model: string;
  RegNum: string;
  Mileage: string;
  EngSize: string;
  PurPrc: string;
  RegDate: string; // yyyy-mm-dd
  WarType: string;
  Month: string;
  MaxClm: string;
  MOTDue: string; // MOT due date
  Ref?: string; // BAW warranty reference number
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WARRANTIES-2000-REGISTRATION] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    logStep("Function started");
    logStep('Starting Warranties 2000 registration process');
    
    // Get API credentials from environment
    const username = Deno.env.get('WARRANTIES_2000_USERNAME');
    const password = Deno.env.get('WARRANTIES_2000_PASSWORD');
    
    logStep('Environment check', {
      hasUsername: !!username,
      hasPassword: !!password,
      usernameLength: username?.length || 0
    });
    
    if (!username || !password) {
      logStep('CRITICAL ERROR: Missing WARRANTIES_2000 credentials');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'API credentials not configured',
          details: 'Missing WARRANTIES_2000_USERNAME or WARRANTIES_2000_PASSWORD'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    let registrationData: RegistrationData;
    try {
      registrationData = await req.json();
      logStep('Registration data received successfully');
      logStep('Registration summary', {
        regNum: registrationData.RegNum,
        make: registrationData.Make,
        model: registrationData.Model,
        warType: registrationData.WarType,
        maxClm: registrationData.MaxClm
      });
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const requiredFields = [
      'Title', 'First', 'Surname', 'Addr1', 'Town', 'PCode', 
      'Tel', 'Mobile', 'EMail', 'PurDate', 'Make', 'Model', 
      'RegNum', 'Mileage', 'EngSize', 'PurPrc', 'RegDate', 
      'WarType', 'Month', 'MaxClm'
    ];

    for (const field of requiredFields) {
      if (!registrationData[field as keyof RegistrationData]) {
        console.error(`Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Create basic auth header
    const credentials = btoa(`${username}:${password}`);
    
    logStep('Sending registration to Warranties 2000 API', { url: 'https://warranties-epf.co.uk/api.php' });
    
    // Send registration to Warranties 2000 API
    const response = await fetch('https://warranties-epf.co.uk/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(registrationData),
    });

    logStep('Warranties 2000 API response received', { 
      status: response.status,
      ok: response.ok,
      statusText: response.statusText 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Warranties 2000 API error response:', errorText);
      console.error('Request data that was sent:', JSON.stringify(registrationData, null, 2));
      
      let errorMessage = 'Registration failed';
      let parsedError = null;
      
      // Try to parse the error response
      try {
        parsedError = JSON.parse(errorText);
        console.error('Parsed error data:', parsedError);
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
      }
      
      switch (response.status) {
        case 401:
          errorMessage = 'Unauthorised: Invalid API credentials';
          break;
        case 405:
          errorMessage = 'Invalid method: Only POST is accepted';
          break;
        case 422:
          errorMessage = 'Invalid data: The registration data was invalid';
          if (parsedError && parsedError.Response) {
            errorMessage = `Invalid data: ${parsedError.Response}`;
          }
          if (parsedError) {
            // Add specific field validation errors
            const fieldErrors = [];
            for (const [field, error] of Object.entries(parsedError)) {
              if (field !== 'Response' && typeof error === 'string') {
                fieldErrors.push(`${field}: ${error}`);
              }
            }
            if (fieldErrors.length > 0) {
              errorMessage += ` - ${fieldErrors.join(', ')}`;
            }
          }
          break;
        default:
          errorMessage = `Registration failed with status: ${response.status}`;
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: parsedError || errorText,
          requestData: registrationData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const responseData = await response.json();
    console.log('Warranties 2000 API response:', responseData);

    if (responseData.Response === 'Success') {
      console.log('Registration successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Registration completed successfully',
          data: responseData 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      console.error('Registration failed:', responseData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Registration failed',
          details: responseData 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in warranties registration:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});