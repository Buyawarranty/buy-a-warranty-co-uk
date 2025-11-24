-- Create warranties_2000_audit_log table
CREATE TABLE IF NOT EXISTS warranties_2000_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  admin_email TEXT,
  customer_email TEXT,
  details JSONB,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create warranty_audit_log table
CREATE TABLE IF NOT EXISTS warranty_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  admin_id UUID,
  customer_id UUID REFERENCES customers(id),
  policy_id UUID,
  details JSONB,
  changes_made JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE warranties_2000_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_audit_log ENABLE ROW LEVEL SECURITY;

-- Create admin policies
CREATE POLICY "Admins can view warranties_2000_audit_log"
ON warranties_2000_audit_log FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Admins can view warranty_audit_log"
ON warranty_audit_log FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));