-- Add trial fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Index for trial queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial ON profiles(trial_end) WHERE trial_status = 'trial';

-- Check if user has active trial
CREATE OR REPLACE FUNCTION has_active_trial(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND subscription_status = 'trial'
    AND trial_end > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute
GRANT EXECUTE ON FUNCTION has_active_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_trial(UUID) TO anon;