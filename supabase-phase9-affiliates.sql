-- Phase 9: Affiliate Program Schema
-- Referral tracking, commissions, and payouts

-- 1. Create affiliate_profiles table
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(3,2) DEFAULT 0.25, -- 25% commission
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  pending_payout DECIMAL(10,2) DEFAULT 0,
  paid_out DECIMAL(10,2) DEFAULT 0,
  payout_method TEXT, -- 'paypal', 'stripe'
  payout_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create affiliate_clicks table (track referrals)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
  referrer_code TEXT NOT NULL,
  visitor_id TEXT, -- cookie/session ID
  landing_page TEXT,
  source TEXT, -- 'twitter', 'linkedin', 'email', etc.
  ip_hash TEXT, -- hashed IP for fraud detection
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  conversion_amount DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
  click_id UUID REFERENCES affiliate_clicks(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- 4. Create affiliate_payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliate_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL, -- 'paypal', 'stripe'
  payout_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  stripe_transfer_id TEXT,
  paypal_payment_id TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_code ON affiliate_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_referrer ON affiliate_clicks(referrer_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);

-- Enable RLS
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own affiliate profile" ON affiliate_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own affiliate profile" ON affiliate_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own commissions" ON affiliate_commissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliate_profiles WHERE id = affiliate_commissions.affiliate_id AND id = auth.uid())
  );

CREATE POLICY "Users can view own payouts" ON affiliate_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM affiliate_profiles WHERE id = affiliate_payouts.affiliate_id AND id = auth.uid())
  );

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(user_id::text || random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM affiliate_profiles WHERE referral_code = code
    ) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup with referral
CREATE OR REPLACE FUNCTION handle_referred_signup()
RETURNS TRIGGER AS $$
DECLARE
  referrer_code TEXT;
  referrer_affiliate_id UUID;
  new_click_id UUID;
BEGIN
  -- Check if user was referred
  referrer_code := NEW.referral_code;
  
  IF referrer_code IS NOT NULL THEN
    -- Find the referrer's affiliate profile
    SELECT id INTO referrer_affiliate_id
    FROM affiliate_profiles
    WHERE referral_code = referrer_code
    LIMIT 1;
    
    IF referrer_affiliate_id IS NOT NULL THEN
      -- Create a click record marked as converted
      INSERT INTO affiliate_clicks (
        affiliate_id,
        referrer_code,
        converted,
        converted_at,
        conversion_amount,
        commission_earned
      ) VALUES (
        referrer_affiliate_id,
        referrer_code,
        TRUE,
        NOW(),
        9.00, -- £9 subscription
        2.25  -- 25% commission
      ) RETURNING id INTO new_click_id;
      
      -- Create commission record
      INSERT INTO affiliate_commissions (
        affiliate_id,
        click_id,
        amount,
        status,
        description
      ) VALUES (
        referrer_affiliate_id,
        new_click_id,
        2.25,
        'pending',
        'Sign-up commission from ' || NEW.email
      );
      
      -- Update affiliate stats
      UPDATE affiliate_profiles SET
        total_conversions = total_conversions + 1,
        total_earnings = total_earnings + 2.25,
        pending_payout = pending_payout + 2.25,
        updated_at = NOW()
      WHERE id = referrer_affiliate_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle referred signups
DROP TRIGGER IF EXISTS on_user_signup_referral ON profiles;
CREATE TRIGGER on_user_signup_referral
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referred_signup();