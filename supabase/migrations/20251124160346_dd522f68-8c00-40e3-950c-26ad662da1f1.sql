-- Create quote_data table to track all quote requests
CREATE TABLE IF NOT EXISTS public.quote_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  vehicle_data JSONB NOT NULL,
  plan_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create abandoned_carts table to track cart abandonment
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  vehicle_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  contact_status TEXT,
  last_contacted_at TIMESTAMPTZ,
  contact_notes TEXT
);

-- Create email_logs table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  open_tracked BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ,
  click_tracked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  conversion_tracked BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ
);

-- Create email_tracking_events table
CREATE TABLE IF NOT EXISTS public.email_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create newsletter_signups table
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  discount_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (these are tracking tables)
CREATE POLICY "Allow all access to quote_data" ON public.quote_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to abandoned_carts" ON public.abandoned_carts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_logs" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_tracking_events" ON public.email_tracking_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to newsletter_signups" ON public.newsletter_signups FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_data_email ON public.quote_data(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_data_quote_id ON public.quote_data(quote_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_tracking_id ON public.email_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON public.email_logs(email);