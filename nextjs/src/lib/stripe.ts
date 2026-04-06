// Stripe Service for Subscription Payments
import Stripe from 'stripe'

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Plan configurations
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: null,
    currency: 'gbp',
    features: [
      '2 contracts per month',
      'All 5 contract types',
      'PDF export',
      'Basic customization',
    ],
    limits: {
      contractsPerMonth: 2,
      aiGenerations: 2,
    }
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 12, // £12/month
    priceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
    currency: 'gbp',
    interval: 'month' as const,
    features: [
      'Unlimited contracts',
      'AI-powered generation',
      'Google Docs export',
      'E-signature links',
      'Priority support',
    ],
    limits: {
      contractsPerMonth: -1,
      aiGenerations: -1,
    }
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 120, // £120/year (2 months free)
    priceId: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || 'price_pro_annual',
    currency: 'gbp',
    interval: 'year' as const,
    savings: 17, // 17% savings
    features: [
      'Unlimited contracts',
      'AI-powered generation',
      'Google Docs export',
      'E-signature links',
      'Priority support',
      '2 months free',
    ],
    limits: {
      contractsPerMonth: -1,
      aiGenerations: -1,
    }
  },
  trial: {
    id: 'trial',
    name: '7-Day Trial',
    price: 0,
    priceId: null,
    currency: 'gbp',
    features: [
      'Full Pro access',
      '7 days unlimited',
      'No commitment',
    ],
    limits: {
      contractsPerMonth: -1,
      aiGenerations: -1,
    }
  }
}

// Create checkout session for Pro subscription
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency: 'gbp',
    billing_address_collection: 'auto',
    allow_promotion_codes: true,
  })

  return session
}

// Create customer in Stripe
export async function createCustomer(email: string, name?: string) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'contract-flow',
    }
  })

  return customer
}

// Get customer's Stripe customer ID
export async function getOrCreateCustomer(email: string, name?: string): Promise<string> {
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  const customer = await createCustomer(email, name)
  return customer.id
}

// Get subscription status
export async function getSubscriptionStatus(customerId: string): Promise<{
  isPro: boolean
  subscriptionId: string | null
  currentPeriodEnd: Date | null
}> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    return {
      isPro: false,
      subscriptionId: null,
      currentPeriodEnd: null,
    }
  }

  const sub = subscriptions.data[0]
  return {
    isPro: true,
    subscriptionId: sub.id,
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

// Create billing portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

// Verify webhook signature
export function constructEvent(
  body: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}