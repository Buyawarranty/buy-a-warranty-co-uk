-- Rename breakdown_cover to breakdown_recovery to match code expectations
ALTER TABLE customer_policies RENAME COLUMN breakdown_cover TO breakdown_recovery;

-- Create plan_document_mapping table for DocumentMappingTab
CREATE TABLE IF NOT EXISTS plan_document_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  document_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE plan_document_mapping ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage plan document mappings"
ON plan_document_mapping
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_plan_document_mapping_updated_at
BEFORE UPDATE ON plan_document_mapping
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();