-- Rename transfer_fee to transfer_cover to match code expectations
ALTER TABLE customer_policies RENAME COLUMN transfer_fee TO transfer_cover;

-- Add missing columns to customer_policies
ALTER TABLE customer_policies ADD COLUMN IF NOT EXISTS consequential BOOLEAN DEFAULT false;
ALTER TABLE customer_policies ADD COLUMN IF NOT EXISTS lost_key BOOLEAN DEFAULT false;
ALTER TABLE customer_policies ADD COLUMN IF NOT EXISTS europe_cover BOOLEAN DEFAULT false;
ALTER TABLE customer_policies ADD COLUMN IF NOT EXISTS vehicle_data JSONB;

-- Add missing columns to email_logs
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS open_tracked BOOLEAN DEFAULT false;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS click_tracked BOOLEAN DEFAULT false;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS conversion_tracked BOOLEAN DEFAULT false;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;