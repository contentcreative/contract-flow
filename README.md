# ContractFlow — AI Contract Generator for Freelancers

A Next.js SaaS application for generating professional contracts using AI.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL` — From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — From Supabase dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — From Stripe dashboard
- `STRIPE_SECRET_KEY` — From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — After setting up webhook

### 3. Run Locally
```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Vercel
```bash
npx vercel
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── lib/           # Supabase & Stripe clients
├── pages/         # Next.js pages (including API routes)
│   ├── index.tsx         # Landing page
│   ├── login.tsx         # Auth page
│   ├── dashboard.tsx     # User dashboard
│   ├── generate.tsx      # Contract generator
│   └── api/              # API routes
├── styles/        # Global CSS
└── types/         # TypeScript definitions
```

## Features

- Landing page with pricing & FAQ
- User authentication (Supabase Auth)
- Dashboard with contract history
- 5 contract types: MSA, SOW, NDA, Contractor, Consulting
- Form-based contract generation
- PDF export (placeholder)

## Stripe Setup

1. Create products in Stripe Dashboard:
   - Starter: $0/mo (ID: starter)
   - Pro: $9/mo (ID: pro)
   - Pro Annual: $79/yr (ID: pro_annual)

2. Set up webhook for `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

3. Enable Supabase Auth providers (Email/Password)

## Database Tables

Run the SQL from `REQUIREMENTS.md` in Supabase SQL Editor:
- `cf_users` — User profiles & subscriptions
- `cf_contracts` — Generated contracts
- `cf_orders` — Payment records
