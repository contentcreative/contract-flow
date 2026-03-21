-- Phase 7: Stripe Subscription Fields
-- Add columns for Stripe customer ID and subscription tracking

-- Add Stripe-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Enable RLS for new columns (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to update their own profile (existing)
-- Note: Existing policies should be updated to include new columns

-- Function to automatically update subscription_status based on Stripe webhooks
-- This is handled by the webhook handler in /api/webhooks/stripe.ts

-- View to see users with active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  id,
  email,
  full_name,
  company_name,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_start,
  subscription_end,
  created_at
FROM profiles
WHERE subscription_status = 'pro'
  AND subscription_end > NOW();

-- Grant execute permission (if needed)
GRANT SELECT ON active_subscriptions TO authenticated;
GRANT SELECT ON active_subscriptions TO anon;