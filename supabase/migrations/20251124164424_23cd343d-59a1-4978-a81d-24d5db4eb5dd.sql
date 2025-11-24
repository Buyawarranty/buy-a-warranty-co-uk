-- Add missing columns to existing tables
ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS warranty_number TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

ALTER TABLE public.abandoned_carts 
ADD COLUMN IF NOT EXISTS step_abandoned TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(id);

ALTER TABLE public.welcome_emails 
ADD COLUMN IF NOT EXISTS temporary_password TEXT;

-- Create admin_notes table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  note TEXT NOT NULL,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage admin notes" 
ON public.admin_notes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_notes_customer ON public.admin_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_by ON public.admin_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON public.customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customer_policies_warranty_number ON public.customer_policies(warranty_number);

-- Create triggers
CREATE TRIGGER update_admin_notes_updated_at
BEFORE UPDATE ON public.admin_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_abandoned_carts_updated_at
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();