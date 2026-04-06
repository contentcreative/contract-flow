# Fix for Existing Tables

Run this in Supabase SQL Editor to fix any issues with existing tables:

```sql
-- Check existing tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## If Tables Already Exist

```sql
-- Add missing columns to cf_users if needed
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_used INTEGER DEFAULT 0;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS contracts_limit INTEGER DEFAULT 2;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE cf_users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
```

---

## Add RLS Policies (if missing)

```sql
-- Enable RLS if not already enabled
ALTER TABLE cf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON cf_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON cf_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own contracts" ON cf_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contracts" ON cf_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON cf_orders FOR SELECT USING (auth.uid() = user_id);
```

---

## Quick Reset (DELETE ALL DATA - use only if starting fresh)

```sql
DROP TABLE IF EXISTS cf_orders;
DROP TABLE IF EXISTS cf_contracts;
DROP TABLE IF EXISTS cf_users;
-- Then run the original CREATE TABLE statements from DEPLOYMENT.md
```