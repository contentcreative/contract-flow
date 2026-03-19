import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const customerId = session.customer as string
      
      if (userId) {
        // Update user subscription status
        await supabase.from('cf_users').update({
          plan: 'pro',
          stripe_customer_id: customerId,
          subscription_status: 'active',
          contracts_limit: 999,
        }).eq('id', userId)

        // Record order
        await supabase.from('cf_orders').insert({
          user_id: userId,
          amount: session.amount_total || 0,
          stripe_payment_id: session.payment_intent as string,
          stripe_subscription_id: session.subscription as string,
          status: 'completed',
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      
      await supabase.from('cf_users').update({
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      
      await supabase.from('cf_users').update({
        plan: 'starter',
        subscription_status: 'canceled',
        contracts_limit: 2,
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      
      // Extend subscription period
      await supabase.from('cf_users').update({
        subscription_status: 'active',
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      
      await supabase.from('cf_users').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return res.status(200).json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
