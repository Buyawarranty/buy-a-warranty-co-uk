-- Add missing columns to special_vehicle_plans table
ALTER TABLE special_vehicle_plans ADD COLUMN IF NOT EXISTS pricing_matrix JSONB;

-- Add missing columns to email_campaigns table
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'marketing';

-- Add missing columns to email_logs table
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'sent';

-- Add foreign key for campaign_id
ALTER TABLE email_logs 
ADD CONSTRAINT email_logs_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id);

-- Add missing columns to admin_users table
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS invite_token TEXT;