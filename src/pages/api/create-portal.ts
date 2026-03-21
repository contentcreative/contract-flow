// API: Create Stripe Customer Portal session
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createPortalSession } from '@/lib/stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' })
    }

    // Create portal session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'
    const session = await createPortalSession(
      profile.stripe_customer_id,
      `${appUrl}/dashboard`
    )

    return res.status(200).json({ url: session.url })

  } catch (error: any) {
    console.error('Portal error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create portal session' })
  }
}