-- Add remaining coverage and add-on columns
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS tyre_cover BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wear_and_tear BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transfer_fee BOOLEAN DEFAULT false;