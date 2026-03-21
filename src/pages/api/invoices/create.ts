// API: Create invoice
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, client_id, items, tax_rate, due_date, notes, currency } = req.body

    if (!user_id || !client_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
    const tax_amount = subtotal * (tax_rate || 0) / 100
    const total = subtotal + tax_amount

    // Generate invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNum = lastInvoice?.invoice_number ? parseInt(lastInvoice.invoice_number.replace('INV-', '')) : 0
    const invoice_number = `INV-${String(lastNum + 1).padStart(5, '0')}`

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        user_id,
        client_id,
        invoice_number,
        items,
        subtotal,
        tax_rate: tax_rate || 0,
        tax_amount,
        total,
        currency: currency || 'GBP',
        due_date,
        notes,
        status: 'draft',
        version: 1
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      invoice
    })

  } catch (error: any) {
    console.error('Create invoice error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create invoice' })
  }
}