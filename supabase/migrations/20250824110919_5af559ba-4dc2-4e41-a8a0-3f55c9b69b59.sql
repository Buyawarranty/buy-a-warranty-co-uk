-- Fix missing user_roles entries for existing admin_users
INSERT INTO user_roles (user_id, role)
SELECT user_id, role::user_role 
FROM admin_users 
WHERE user_id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the has_admin_permission function to be more robust
CREATE OR REPLACE FUNCTION public.has_admin_permission(user_id uuid, permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    INNER JOIN public.user_roles ur ON ur.user_id = au.user_id
    WHERE au.user_id = $1 
    AND au.is_active = true
    AND (
      ur.role = 'admin' 
      OR (au.permissions->$2)::boolean = true
    )
  );
$function$;

-- Create a trigger to automatically create user_roles entries when admin_users are created
CREATE OR REPLACE FUNCTION public.sync_admin_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into user_roles when a new admin_user is created
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.role::user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_admin_user_role_trigger ON public.admin_users;
CREATE TRIGGER sync_admin_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_admin_user_role();

-- Update existing admin users to ensure they all have proper permissions
UPDATE admin_users 
SET permissions = CASE 
  WHEN role = 'admin' THEN '{}'::jsonb
  WHEN role = 'member' AND permissions = '{}'::jsonb THEN jsonb_build_object(
    'users:read', true,
    'customers:read', true,
    'customers:write', true,
    'plans:read', true,
    'email_templates:read', true,
    'settings:read', true,
    'analytics:read', true
  )
  WHEN role = 'viewer' AND permissions = '{}'::jsonb THEN jsonb_build_object(
    'users:read', true,
    'customers:read', true,
    'plans:read', true,
    'email_templates:read', true,
    'settings:read', true,
    'analytics:read', true
  )
  WHEN role = 'guest' AND permissions = '{}'::jsonb THEN jsonb_build_object(
    'customers:read', true
  )
  ELSE permissions
END
WHERE permissions = '{}'::jsonb OR permissions IS NULL;