-- Add missing columns to existing tables
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS email_sent_status TEXT DEFAULT 'not_sent';

ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'percentage')),
  value NUMERIC NOT NULL,
  description TEXT,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Discount codes are viewable by everyone" 
ON public.discount_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON public.discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);

-- Create triggers
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();