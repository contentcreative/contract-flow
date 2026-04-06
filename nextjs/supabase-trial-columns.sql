-- Add trial tracking columns to profiles table
-- Run this in Supabase SQL Editor

-- Add trial columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end ON profiles(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON profiles(email_confirmed);

-- Function to check if user is in trial period
CREATE OR REPLACE FUNCTION public.is_in_trial(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  sub_status TEXT;
BEGIN
  SELECT subscription_status, trial_end_date INTO sub_status, trial_end
  FROM profiles WHERE id = user_id;

  IF sub_status = 'pro' THEN
    RETURN TRUE;
  END IF;

  IF trial_end IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN trial_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to Pro features
CREATE OR REPLACE FUNCTION public.has_pro_access(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT subscription_status, trial_end_date INTO sub_status, trial_end
  FROM profiles WHERE id = user_id;

  -- Pro plan always has access
  IF sub_status = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- Check if in trial period
  IF trial_end IS NOT NULL AND trial_end > NOW() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial for new user
CREATE OR REPLACE FUNCTION public.start_trial(user_id UUID, trial_days INTEGER DEFAULT 7)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    trial_start_date = NOW(),
    trial_end_date = NOW() + (trial_days || ' days')::INTERVAL,
    subscription_status = 'free', -- Still free tier, but with trial access
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users without trial dates (give them a 7-day trial)
UPDATE profiles
SET trial_end_date = NOW() + INTERVAL '7 days'
WHERE trial_end_date IS NULL AND subscription_status = 'free';

-- Function to auto-start trial on signup (call this from auth hook)
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_status, trial_start_date, trial_end_date)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    NOW(),
    NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    trial_start_date = NOW(),
    trial_end_date = NOW() + INTERVAL '7 days',
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to start trial on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();