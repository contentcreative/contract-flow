# ContractFlow — Requirements & Setup

## Database Schema (Run in Supabase Dashboard)

```sql
-- Users table
CREATE TABLE cf_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    plan TEXT DEFAULT 'starter',
    contracts_used INTEGER DEFAULT 0,
    contracts_limit INTEGER DEFAULT 2,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts generated
CREATE TABLE cf_contracts (
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

-- Orders/subscriptions
CREATE TABLE cf_orders (
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

-- Enable Row Level Security
ALTER TABLE cf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_orders ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users can view own data" ON cf_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON cf_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own contracts" ON cf_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contracts" ON cf_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON cf_orders FOR SELECT USING (auth.uid() = user_id);
```

## Environment Variables Needed

```bash
# Supabase (already configured)
SUPABASE_URL=https://civnknizmvnijhxbjyty.supabase.co
SUPABASE_ANON_KEY=...

# Stripe (get from stripe.com)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Settings
PUBLIC_SUPABASE_URL=https://civnknizmvnijhxbjyty.supabase.co
PUBLIC_SUPABASE_ANON_KEY=...
```

## Files Created

- `/contracts/prompt-library.md` — AI prompts for 5 contract types
- `/contracts/landing-page.html` — Landing page ready to deploy
- `/contracts/REQUIREMENTS.md` — This file

## Deployment Options

### Option 1: Carrd (Simplest)
- Upload landing page HTML to Carrd
- Forms connect to Supabase via API
- Cost: $19/year

### Option 2: Vercel + Next.js
- Deploy as Next.js app
- Full authentication via Supabase Auth
- Stripe integration
- Cost: Free tier available

### Option 3: Single HTML + Supabase Direct
- Landing page as static HTML
- Forms post directly to Supabase
- No backend needed
- Cost: Free (host on GitHub Pages or similar)

## Next Steps

1. [ ] Set up Supabase tables (run SQL in dashboard)
2. [ ] Choose deployment option
3. [ ] Deploy landing page
4. [ ] Set up Stripe account
5. [ ] Configure webhook for subscriptions
6. [ ] Launch on r/freelance