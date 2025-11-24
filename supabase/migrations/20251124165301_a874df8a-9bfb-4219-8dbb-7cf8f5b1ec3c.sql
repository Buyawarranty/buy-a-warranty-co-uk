-- Add missing columns to discount_codes table
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS valid_from timestamp with time zone;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS valid_to timestamp with time zone;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS usage_limit integer;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS campaign_source text;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stripe_coupon_id text;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stripe_promotion_code_id text;

-- Rename wear_and_tear to wear_tear in customer_policies
ALTER TABLE customer_policies RENAME COLUMN wear_and_tear TO wear_tear;