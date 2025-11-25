-- Add missing w2k_response and policy_id columns to warranties_2000_audit_log table
ALTER TABLE warranties_2000_audit_log 
ADD COLUMN IF NOT EXISTS w2k_response jsonb,
ADD COLUMN IF NOT EXISTS policy_id uuid REFERENCES customer_policies(id);