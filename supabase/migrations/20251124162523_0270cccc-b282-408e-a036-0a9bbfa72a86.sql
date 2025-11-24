-- Create user_roles table for user role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_documents table for storing document references
CREATE TABLE IF NOT EXISTS public.customer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  plan_type TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special_vehicle_plans table for special vehicle warranty plans
CREATE TABLE IF NOT EXISTS public.special_vehicle_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coverage TEXT NOT NULL,
  monthly_price DECIMAL(10,2),
  two_yearly_price DECIMAL(10,2),
  three_yearly_price DECIMAL(10,2),
  three_monthly_price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  vehicle_type TEXT,
  description TEXT,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_vehicle_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Allow all access to user_roles" 
ON public.user_roles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for customer_documents
CREATE POLICY "Allow all access to customer_documents" 
ON public.customer_documents 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for special_vehicle_plans
CREATE POLICY "Allow all access to special_vehicle_plans" 
ON public.special_vehicle_plans 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_user_id ON public.customer_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_plan_type ON public.customer_documents(plan_type);
CREATE INDEX IF NOT EXISTS idx_special_vehicle_plans_active ON public.special_vehicle_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_special_vehicle_plans_vehicle_type ON public.special_vehicle_plans(vehicle_type);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_documents_updated_at
BEFORE UPDATE ON public.customer_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_vehicle_plans_updated_at
BEFORE UPDATE ON public.special_vehicle_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();