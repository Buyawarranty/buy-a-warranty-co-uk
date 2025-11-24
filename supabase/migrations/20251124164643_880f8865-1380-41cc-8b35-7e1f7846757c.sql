-- Add final missing columns to existing tables
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS warranties_2000_status TEXT DEFAULT 'pending';

ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';