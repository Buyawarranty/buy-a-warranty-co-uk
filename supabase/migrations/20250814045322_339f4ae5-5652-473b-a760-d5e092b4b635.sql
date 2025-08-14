-- Add hello@1ux1.com as an admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('6413a1cd-7401-440c-85df-857ae07c24e2', 'admin'::user_role)
ON CONFLICT (user_id, role) DO NOTHING;