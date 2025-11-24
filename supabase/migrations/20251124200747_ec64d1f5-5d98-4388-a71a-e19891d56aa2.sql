-- Fix search path security warnings for customer management functions

DROP FUNCTION IF EXISTS soft_delete_customer(UUID, UUID);
DROP FUNCTION IF EXISTS restore_customer(UUID);

-- Function to soft delete a customer with secure search path
CREATE OR REPLACE FUNCTION soft_delete_customer(customer_uuid UUID, admin_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Update customer record
  UPDATE customers
  SET 
    status = 'deleted',
    updated_at = now()
  WHERE id = customer_uuid;
  
  -- Update associated policies
  UPDATE customer_policies
  SET 
    is_deleted = true,
    updated_at = now()
  WHERE customer_id = customer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to restore a customer with secure search path
CREATE OR REPLACE FUNCTION restore_customer(customer_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Restore customer record
  UPDATE customers
  SET 
    status = 'active',
    updated_at = now()
  WHERE id = customer_uuid;
  
  -- Restore associated policies
  UPDATE customer_policies
  SET 
    is_deleted = false,
    updated_at = now()
  WHERE customer_id = customer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;