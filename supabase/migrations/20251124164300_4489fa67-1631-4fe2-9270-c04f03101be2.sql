-- Add missing document_name column to customer_documents
ALTER TABLE public.customer_documents 
ADD COLUMN IF NOT EXISTS document_name TEXT;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  status TEXT DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_tags table
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_tag_assignments table
CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, tag_id)
);

-- Create claims_submissions table
CREATE TABLE IF NOT EXISTS public.claims_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  policy_number TEXT,
  claim_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_posts (public read, admin write)
CREATE POLICY "Blog posts are viewable by everyone" 
ON public.blog_posts FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for email_templates (admin only)
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for customer_tags (admin only)
CREATE POLICY "Admins can manage customer tags" 
ON public.customer_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for customer_tag_assignments (admin only)
CREATE POLICY "Admins can manage tag assignments" 
ON public.customer_tag_assignments FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for claims_submissions
CREATE POLICY "Users can view their own claims" 
ON public.claims_submissions FOR SELECT 
USING (
  customer_id IN (SELECT id FROM public.customers WHERE email = auth.jwt()->>'email')
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can submit their own claims" 
ON public.claims_submissions FOR INSERT 
WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage all claims" 
ON public.claims_submissions FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer ON public.customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag ON public.customer_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_claims_submissions_customer ON public.claims_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_submissions_status ON public.claims_submissions(status);

-- Create triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_tags_updated_at
BEFORE UPDATE ON public.customer_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_claims_submissions_updated_at
BEFORE UPDATE ON public.claims_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();