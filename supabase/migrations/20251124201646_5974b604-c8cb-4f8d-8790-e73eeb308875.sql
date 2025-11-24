-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registration_plate TEXT;

-- Add missing columns to email_consents table
ALTER TABLE email_consents ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns to email_logs table
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS resend_count INTEGER DEFAULT 0;

-- Add missing columns to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_price NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS yearly_price NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS two_yearly_price NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS three_yearly_price NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS claim_limit NUMERIC;

-- Create mot_history table
CREATE TABLE IF NOT EXISTS mot_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration TEXT NOT NULL,
  customer_email TEXT,
  mot_tests JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  discount_code TEXT,
  status TEXT DEFAULT 'pending',
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE mot_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create admin policies for new tables
CREATE POLICY "Admins can manage mot history"
ON mot_history FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Admins can manage referrals"
ON referrals FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));