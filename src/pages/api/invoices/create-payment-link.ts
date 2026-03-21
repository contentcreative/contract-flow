// API: Create Stripe payment link for invoice
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { invoice_id, user_id } = req.body

    if (!invoice_id || !user_id) {
      return res.status(400).json({ error: 'invoice_id and user_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get invoice with client details
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id (id, name, email, company_name)
      `)
      .eq('id', invoice_id)
      .eq('user_id', user_id)
      .single()

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    // Create line items for Stripe
    const line_items = invoice.items.map((item: any) => ({
      price_data: {
        currency: invoice.currency?.toLowerCase() || 'gbp',
        product_data: {
          name: item.description || 'Service',
        },
        unit_amount: Math.round(item.rate * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Add tax if applicable
    if (invoice.tax_rate > 0) {
      line_items[0].price_data.product_data.name += ` (incl. ${invoice.tax_rate}% tax)`
    }

    // Create Stripe payment link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'
    const paymentLink = await stripe.paymentLinks.create({
      line_items,
      after_completion: {
        type: 'redirect',
        redirect: {
          return_url: `${appUrl}/invoices/${invoice_id}?status=paid`,
        },
      },
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        user_id: user_id,
      },
    })

    // Update invoice with payment link
    await supabase
      .from('invoices')
      .update({
        payment_link: paymentLink.url,
        stripe_payment_link_id: paymentLink.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', invoice_id)

    return res.status(200).json({
      success: true,
      payment_url: paymentLink.url,
      payment_link_id: paymentLink.id
    })

  } catch (error: any) {
    console.error('Create payment link error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create payment link' })
  }
}