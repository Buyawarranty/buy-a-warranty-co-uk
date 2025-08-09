import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  test?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  const rid = crypto.randomUUID();
  const t0 = Date.now();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(JSON.stringify({ evt: "test.start", rid, method: req.method }));
    
    // Check environment variables
    const w2kUsername = Deno.env.get('WARRANTIES_2000_USERNAME');
    const w2kPassword = Deno.env.get('WARRANTIES_2000_PASSWORD');
    
    console.log(JSON.stringify({ 
      evt: "env.check", 
      rid,
      hasUsername: !!w2kUsername,
      hasPassword: !!w2kPassword
    }));
    
    if (!w2kUsername || !w2kPassword) {
      console.log(JSON.stringify({ evt: "missing.credentials", rid }));
      return new Response(JSON.stringify({ 
        ok: false, 
        rid,
        code: 'MISSING_CREDENTIALS', 
        error: 'WARRANTIES_2000_USERNAME or WARRANTIES_2000_PASSWORD not configured' 
      }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Parse request body
    const body: TestRequest = await req.json().catch(() => ({}));
    
    console.log(JSON.stringify({ evt: "request.parsed", rid, body }));
    
    // Just return success for now to test if the function is working
    console.log(JSON.stringify({ evt: "test.success", rid }));
    
    return new Response(JSON.stringify({ 
      ok: true, 
      rid,
      message: 'Test function is working',
      timestamp: new Date().toISOString(),
      env_check: {
        hasUsername: !!w2kUsername,
        hasPassword: !!w2kPassword
      }
    }), {
      status: 200,
      headers: { "content-type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(JSON.stringify({ evt: "error", rid, error: msg }));
    
    return new Response(JSON.stringify({ 
      ok: false, 
      rid,
      code: 'UNHANDLED_ERROR', 
      error: msg 
    }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  } finally {
    console.log(JSON.stringify({ evt: "edge.done", rid, ms: Date.now() - t0 }));
  }
};

serve(handler);