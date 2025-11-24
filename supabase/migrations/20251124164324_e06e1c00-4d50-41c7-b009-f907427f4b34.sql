-- Add missing columns to existing tables
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT;

ALTER TABLE public.special_vehicle_plans 
ADD COLUMN IF NOT EXISTS yearly_price NUMERIC;

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS payment_type TEXT;

ALTER TABLE public.claims_submissions 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create monthly_claims_stats table
CREATE TABLE IF NOT EXISTS public.monthly_claims_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  total_claims INTEGER DEFAULT 0,
  approved_claims INTEGER DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create click_fraud_protection table
CREATE TABLE IF NOT EXISTS public.click_fraud_protection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  action_type TEXT,
  click_count INTEGER DEFAULT 0,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action_type)
);

-- Enable RLS
ALTER TABLE public.monthly_claims_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_fraud_protection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only for all fraud/stats tables)
CREATE POLICY "Admins can manage monthly claims stats" 
ON public.monthly_claims_stats FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage click fraud protection" 
ON public.click_fraud_protection FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage blocked IPs" 
ON public.blocked_ips FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage rate limits" 
ON public.rate_limits FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_click_fraud_ip ON public.click_fraud_protection(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, action_type);

-- Create triggers
CREATE TRIGGER update_monthly_claims_stats_updated_at
BEFORE UPDATE ON public.monthly_claims_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_click_fraud_protection_updated_at
BEFORE UPDATE ON public.click_fraud_protection
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
BEFORE UPDATE ON public.rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();