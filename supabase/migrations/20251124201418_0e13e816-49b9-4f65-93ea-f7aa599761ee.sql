-- Add wear_tear column to customer_policies
ALTER TABLE customer_policies ADD COLUMN IF NOT EXISTS wear_tear BOOLEAN DEFAULT false;

-- Add missing columns to discount_codes table
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP WITH TIME ZONE;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS valid_to TIMESTAMP WITH TIME ZONE;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS usage_limit INTEGER;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS auto_archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS auto_archived_reason TEXT;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS applicable_products JSONB;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stripe_promo_code_id TEXT;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stripe_coupon_id TEXT;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS campaign_source TEXT;