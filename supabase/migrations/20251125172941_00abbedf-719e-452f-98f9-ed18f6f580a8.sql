-- Add missing columns to claims_submissions table
ALTER TABLE claims_submissions 
ADD COLUMN IF NOT EXISTS payment_amount numeric,
ADD COLUMN IF NOT EXISTS internal_notes text;