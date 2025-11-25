-- Add missing category_id and seo_keywords columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES blog_categories(id),
ADD COLUMN IF NOT EXISTS seo_keywords text[] DEFAULT ARRAY[]::text[];