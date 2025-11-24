-- Add mot_fee column and other policy-related columns
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS mot_fee BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breakdown_cover BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS european_cover BOOLEAN DEFAULT false;