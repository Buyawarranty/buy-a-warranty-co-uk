-- Rename rental_car to vehicle_rental to match code expectations
ALTER TABLE customer_policies RENAME COLUMN rental_car TO vehicle_rental;

-- Add missing columns to email_templates
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS from_email TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to email_logs
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS template_id UUID;

-- Create scheduled_emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  template_id UUID,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS on scheduled_emails
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage scheduled emails"
ON scheduled_emails
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);