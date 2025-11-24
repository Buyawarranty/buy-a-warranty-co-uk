
-- Add missing columns to abandoned_carts table for admin interface compatibility
ALTER TABLE abandoned_carts 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Add missing columns to discount_codes table for admin interface compatibility
ALTER TABLE discount_codes
ADD COLUMN IF NOT EXISTS valid_from timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS valid_to timestamp with time zone,
ADD COLUMN IF NOT EXISTS usage_limit integer,
ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_archived_reason text,
ADD COLUMN IF NOT EXISTS campaign_source text,
ADD COLUMN IF NOT EXISTS stripe_coupon_id text,
ADD COLUMN IF NOT EXISTS stripe_promo_code_id text,
ADD COLUMN IF NOT EXISTS applicable_products jsonb,
ADD COLUMN IF NOT EXISTS created_by uuid;
