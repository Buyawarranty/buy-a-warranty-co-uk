-- Add final missing column
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS warranties_2000_sent_at TIMESTAMP WITH TIME ZONE;