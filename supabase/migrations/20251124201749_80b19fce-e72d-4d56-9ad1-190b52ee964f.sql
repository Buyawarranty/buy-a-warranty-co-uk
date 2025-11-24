-- Add missing columns to warranties_2000_audit_log
ALTER TABLE warranties_2000_audit_log ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to warranty_audit_log
ALTER TABLE warranty_audit_log ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE warranty_audit_log ADD COLUMN IF NOT EXISTS event_data JSONB;
ALTER TABLE warranty_audit_log ADD COLUMN IF NOT EXISTS event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE warranty_audit_log ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add missing column to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Create blog_authors table
CREATE TABLE IF NOT EXISTS blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Blog authors are viewable by everyone"
ON blog_authors FOR SELECT
USING (true);

CREATE POLICY "Admins can manage blog authors"
ON blog_authors FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Blog categories are viewable by everyone"
ON blog_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage blog categories"
ON blog_categories FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));