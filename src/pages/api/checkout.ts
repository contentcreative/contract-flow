// API: Create Stripe Checkout Session
import type { NextApiRequest, NextApiResponse } from 'next'
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user from Supabase auth
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get user's email
    const email = user.email

    if (!email) {
      return res.status(400).json({ error: 'No email found' })
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(email, user.user_metadata?.full_name || undefined)

    // Update user's stripe_customer_id in Supabase
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'
    const session = await createCheckoutSession(
      customerId,
      `${appUrl}/dashboard?success=true`,
      `${appUrl}/dashboard?canceled=true`
    )

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create checkout' })
  }
}