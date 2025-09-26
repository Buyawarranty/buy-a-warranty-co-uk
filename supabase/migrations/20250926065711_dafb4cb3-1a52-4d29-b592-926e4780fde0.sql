-- Create warranty selection audit log table with encryption and tamper-proof features
CREATE TABLE public.warranty_selection_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  selected_plan_id UUID,
  selected_plan_name TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  quoted_price NUMERIC NOT NULL,
  vehicle_data JSONB NOT NULL,
  customer_data JSONB NOT NULL,
  add_ons JSONB DEFAULT '{}',
  discount_applied JSONB DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_errors JSONB DEFAULT '[]',
  admin_sync_status TEXT NOT NULL DEFAULT 'pending',
  admin_sync_at TIMESTAMP WITH TIME ZONE,
  w2000_sync_status TEXT NOT NULL DEFAULT 'pending',
  w2000_sync_at TIMESTAMP WITH TIME ZONE,
  w2000_response JSONB,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  checksum TEXT NOT NULL, -- For tamper detection
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warranty_selection_audit ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage warranty audit" 
ON public.warranty_selection_audit 
FOR ALL 
USING (true);

CREATE POLICY "Admins can view warranty audit" 
ON public.warranty_selection_audit 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_warranty_audit_session ON public.warranty_selection_audit(session_id);
CREATE INDEX idx_warranty_audit_email ON public.warranty_selection_audit(customer_email);
CREATE INDEX idx_warranty_audit_status ON public.warranty_selection_audit(verification_status, admin_sync_status, w2000_sync_status);
CREATE INDEX idx_warranty_audit_created ON public.warranty_selection_audit(created_at);

-- Create function to generate checksum for tamper detection
CREATE OR REPLACE FUNCTION public.generate_warranty_audit_checksum(
  session_id TEXT,
  customer_email TEXT,
  selected_plan_name TEXT,
  payment_type TEXT,
  quoted_price NUMERIC
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(
    digest(
      session_id || customer_email || selected_plan_name || payment_type || quoted_price::TEXT || extract(epoch from now())::TEXT,
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- Create function to verify warranty selection integrity
CREATE OR REPLACE FUNCTION public.verify_warranty_selection(audit_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_record RECORD;
  plan_record RECORD;
  verification_result JSONB := '{"status": "valid", "errors": []}';
  errors TEXT[] := '{}';
BEGIN
  -- Get audit record
  SELECT * INTO audit_record FROM warranty_selection_audit WHERE id = audit_id;
  
  IF NOT FOUND THEN
    RETURN '{"status": "invalid", "errors": ["Audit record not found"]}';
  END IF;
  
  -- Verify plan exists and is active
  IF audit_record.selected_plan_id IS NOT NULL THEN
    SELECT * INTO plan_record FROM plans WHERE id = audit_record.selected_plan_id AND is_active = true;
    IF NOT FOUND THEN
      SELECT * INTO plan_record FROM special_vehicle_plans WHERE id = audit_record.selected_plan_id AND is_active = true;
      IF NOT FOUND THEN
        errors := array_append(errors, 'Selected plan not found or inactive');
      END IF;
    END IF;
  END IF;
  
  -- Verify price matches plan pricing
  IF plan_record.id IS NOT NULL THEN
    CASE audit_record.payment_type
      WHEN 'monthly', '12months', 'yearly' THEN
        IF plan_record.monthly_price != audit_record.quoted_price THEN
          errors := array_append(errors, 'Price mismatch for monthly plan');
        END IF;
      WHEN '24months' THEN
        IF COALESCE(plan_record.yearly_price, plan_record.monthly_price * 2) != audit_record.quoted_price THEN
          errors := array_append(errors, 'Price mismatch for 24-month plan');
        END IF;
      WHEN '36months' THEN
        IF COALESCE(plan_record.three_yearly_price, plan_record.monthly_price * 3) != audit_record.quoted_price THEN
          errors := array_append(errors, 'Price mismatch for 36-month plan');
        END IF;
    END CASE;
  END IF;
  
  -- Update verification status
  IF array_length(errors, 1) > 0 THEN
    verification_result := jsonb_build_object('status', 'invalid', 'errors', to_jsonb(errors));
    UPDATE warranty_selection_audit 
    SET verification_status = 'failed',
        verification_errors = to_jsonb(errors),
        updated_at = now()
    WHERE id = audit_id;
  ELSE
    UPDATE warranty_selection_audit 
    SET verification_status = 'verified',
        verification_errors = '[]',
        updated_at = now()
    WHERE id = audit_id;
  END IF;
  
  RETURN verification_result;
END;
$$;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_warranty_audit_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER warranty_audit_updated_at
  BEFORE UPDATE ON public.warranty_selection_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_warranty_audit_updated_at();