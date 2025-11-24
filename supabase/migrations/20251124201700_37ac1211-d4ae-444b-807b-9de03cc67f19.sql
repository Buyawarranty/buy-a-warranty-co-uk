-- Add missing columns to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS add_ons JSONB;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS pricing_matrix JSONB;

-- Add missing columns to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referrer_name TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS friend_email TEXT;

-- Add missing columns to admin_users table
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS final_amount NUMERIC;

-- Create customer_notifications table
CREATE TABLE IF NOT EXISTS customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage customer notifications"
ON customer_notifications FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Customers can view their own notifications"
ON customer_notifications FOR SELECT
USING (customer_id IN (SELECT id FROM customers WHERE email = (auth.jwt() ->> 'email')));