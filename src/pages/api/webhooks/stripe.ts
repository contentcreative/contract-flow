// API: Stripe Webhook Handler
import type { NextApiRequest, NextApiResponse } from 'next'
import { constructEvent, stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' })
  }

  let event

  try {
    event = constructEvent(req.body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Update user's subscription status
        if (customerId) {
          const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (user) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'pro',
                stripe_subscription_id: subscriptionId,
                subscription_start: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)

            console.log(`User ${user.id} upgraded to Pro`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const status = subscription.status

        // Update user's subscription status
        if (customerId) {
          const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (user) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: status === 'active' ? 'pro' : status,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        // Downgrade user to free
        if (customerId) {
          const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (user) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'free',
                stripe_subscription_id: null,
                subscription_end: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)

            console.log(`User ${user.id} subscription canceled, reverted to free`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string

        // Optionally notify user of payment failure
        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({ error: error.message || 'Webhook handler failed' })
  }
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}