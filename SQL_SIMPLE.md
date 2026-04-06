-- SIMPLE SQL Script - Run these one by one

-- 1. Add missing columns to cf_users
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_used INTEGER DEFAULT 0;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_limit INTEGER DEFAULT 2;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- 2. Create cf_contracts table
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

-- 3. Create cf_orders table
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

-- 4. Enable RLS on new tables
ALTER TABLE cf_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_orders ENABLE ROW LEVEL SECURITY;

-- 5. Check existing policies (run separately if needed)
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';

-- 6. Create policies manually (only if they don't exist)
-- Run these one at a time in SQL Editor:
/*
CREATE POLICY "Users can view own contracts" ON cf_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contracts" ON cf_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON cf_orders FOR SELECT USING (auth.uid() = user_id);
*/

-- 7. Verify tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;