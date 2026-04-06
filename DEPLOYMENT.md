# ContractFlow Deployment Guide

## Domain: contract-flow.app

### 1. Register Domain
- Purchase contract-flow.app (~$12/year from most registrars)
- Or use Vercel's free .app domain (comes with Pro plan)

### 2. DNS Setup (after domain registered)
```
A record: @ → 76.76.21.21 (Vercel edge)
CNAME: www → cname.vercel-dns.com
```

### 3. Environment Variables (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://civnknizmvnijhxbjyty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (from Stripe)
NEXT_PUBLIC_APP_URL=https://contract-flow.app
STRIPE_SECRET_KEY=sk_test_... (from Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (after webhook setup)
```

### 4. Deploy to Vercel
```bash
cd /root/.openclaw/workspace/contracts/nextjs
npx vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: contractflow
# - Directory: ./
# - Override settings? No
```

### 5. Configure Stripe Webhook
- URL: `https://contract-flow.app/api/webhooks/stripe`
- Events to enable:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 6. Supabase Setup (run in SQL Editor)
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

-- Contracts table
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

-- Orders table
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

-- Enable RLS
ALTER TABLE cf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON cf_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON cf_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own contracts" ON cf_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contracts" ON cf_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON cf_orders FOR SELECT USING (auth.uid() = user_id);

-- Enable Supabase Auth
-- Go to Authentication → Providers → Enable Email/Password
```

### 7. Stripe Products (create in Stripe Dashboard)
| Product | Price | API ID |
|---------|-------|--------|
| Starter | $0/month | starter |
| Pro | $9/month | pro |
| Pro Annual | $79/year | pro_annual |

---

## Estimated Timeline
- Domain + DNS: 5 minutes
- Vercel deploy: 2 minutes
- Supabase setup: 5 minutes
- Stripe setup: 10 minutes
- **Total: ~20 minutes to live** 🚀