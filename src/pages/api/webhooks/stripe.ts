import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = req.body
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.user_id
      
      if (userId) {
        // Update user subscription status to 'pro'
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'pro',
            subscription_id: session.subscription
          })
          .eq('id', userId)
        
        console.log(`User ${userId} upgraded to Pro`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer
      
      // Find user by Stripe customer ID and downgrade to free
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('subscription_id', customerId)
      
      if (profiles && profiles.length > 0) {
        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'free',
            subscription_id: null
          })
          .eq('id', profiles[0].id)
        
        console.log(`User ${profiles[0].id} subscription cancelled`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer
      
      // Could send email notification here
      console.log(`Payment failed for customer ${customerId}`)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}