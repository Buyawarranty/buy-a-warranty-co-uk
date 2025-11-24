-- Add missing columns to existing tables
ALTER TABLE public.customer_notes 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';

ALTER TABLE public.customer_policies 
ADD COLUMN IF NOT EXISTS claim_limit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS policy_start_date TIMESTAMP WITH TIME ZONE;

-- Create note_tags table
CREATE TABLE IF NOT EXISTS public.note_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  features JSON,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage note tags" 
ON public.note_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Plans are viewable by everyone" 
ON public.plans FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" 
ON public.plans FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_note_tags_name ON public.note_tags(name);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON public.plans(is_active);

-- Create triggers
CREATE TRIGGER update_note_tags_updated_at
BEFORE UPDATE ON public.note_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();