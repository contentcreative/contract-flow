-- Phase 1: Extended Registration Fields for ContractFlow
-- Run in Supabase Dashboard: https://civnknizmvnijhxbjyty.supabase.co

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_revenue TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_clients INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_tools TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_goal ON profiles(primary_goal);

-- Enable RLS (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policy to include new fields
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Verify the new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('industry', 'business_type', 'business_address', 'vat_number', 'primary_goal', 'annual_revenue', 'active_clients', 'current_tools', 'referral_source');