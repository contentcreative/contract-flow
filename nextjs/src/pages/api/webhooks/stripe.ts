// API: Stripe Webhook Handler
import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Buffer raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let data: Buffer[] = []
    req.on('data', (chunk: Buffer) => data.push(chunk))
    req.on('end', () => resolve(Buffer.concat(data)))
    req.on('error', reject)
  })
}

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
    console.error('Missing signature or webhook secret')
    return res.status(400).json({ error: 'Missing signature or webhook secret' })
  }

  // Get raw body for signature verification
  const rawBody = await getRawBody(req)

  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody.toString(), signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  console.log(`Received webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        try {
          // Check if this is an invoice payment (has invoice_id metadata)
          if (session.metadata?.invoice_id) {
            const { error } = await supabase
              .from('invoices')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString(),
                stripe_payment_intent_id: session.payment_intent,
                stripe_session_id: session.id
              })
              .eq('id', session.metadata.invoice_id)
            
            if (error) throw error
            console.log(`Invoice ${session.metadata.invoice_id} marked as paid`)
          }
          // Otherwise handle subscription
          else if (customerId) {
            const { data: user, error: userError } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (userError) throw userError

            if (user) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  subscription_status: 'pro',
                  stripe_subscription_id: subscriptionId,
                  subscription_start: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
              
              if (updateError) throw updateError
              console.log(`User ${user.id} upgraded to Pro`)
            }
          }
        } catch (err: any) {
          console.error('Error handling checkout.session.completed:', err.message)
          // Continue processing - don't fail the whole webhook
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        const status = subscription.status

        try {
          if (customerId) {
            const { data: user, error: userError } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (userError) throw userError

            if (user) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  subscription_status: status === 'active' ? 'pro' : status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
              
              if (updateError) throw updateError
            }
          }
        } catch (err: any) {
          console.error('Error handling customer.subscription.updated:', err.message)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer as string

        try {
          if (customerId) {
            const { data: user, error: userError } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (userError) throw userError

            if (user) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  subscription_status: 'free',
                  stripe_subscription_id: null,
                  subscription_end: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
              
              if (updateError) throw updateError
              console.log(`User ${user.id} subscription canceled, reverted to free`)
            }
          }
        } catch (err: any) {
          console.error('Error handling customer.subscription.deleted:', err.message)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer as string
        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        
        try {
          // Check if this is for an invoice
          if (paymentIntent.metadata?.invoice_id) {
            const { error } = await supabase
              .from('invoices')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString(),
                stripe_payment_intent_id: paymentIntent.id
              })
              .eq('id', paymentIntent.metadata.invoice_id)
            
            if (error) throw error
            console.log(`Payment intent succeeded for invoice ${paymentIntent.metadata.invoice_id}`)
          }
        } catch (err: any) {
          console.error('Error handling payment_intent.succeeded:', err.message)
        }
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