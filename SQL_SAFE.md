-- Safe SQL Script - handles existing tables/policies

-- Add missing columns (safe - won't error if columns exist)
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_used INTEGER DEFAULT 0;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_limit INTEGER DEFAULT 2;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS cf_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cf_users(id),
    contract_type TEXT NOT NULL,
    client_name TEXT,
    project_name TEXT,
    content JSONB,
    pdf_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cf_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cf_users(id),
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    stripe_payment_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'pending',
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies only if they don't exist
DO $$
DECLARE
    policy_exists boolean;
BEGIN
    -- cf_users policies
    SELECT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cf_users' AND policyname = 'Users can view own data'
    ) INTO policy_exists;
    IF NOT policy_exists THEN
        CREATE POLICY "Users can view own data" ON cf_users FOR SELECT USING (auth.uid() = id);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cf_users' AND policyname = 'Users can update own data'
    ) INTO policy_exists;
    IF NOT policy_exists THEN
        CREATE POLICY "Users can update own data" ON cf_users FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- cf_contracts policies
    SELECT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cf_contracts' AND policyname = 'Users can view own contracts'
    ) INTO policy_exists;
    IF NOT policy_exists THEN
        CREATE POLICY "Users can view own contracts" ON cf_contracts FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create contracts" ON cf_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- cf_orders policies
    SELECT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cf_orders' AND policyname = 'Users can view own orders'
    ) INTO policy_exists;
    IF NOT policy_exists THEN
        CREATE POLICY "Users can view own orders" ON cf_orders FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Verify setup
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;