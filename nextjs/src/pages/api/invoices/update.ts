// API: Update invoice
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { invoice_id, user_id, status, items, tax_rate, due_date, notes, action } = req.body

    if (!invoice_id || !user_id) {
      return res.status(400).json({ error: 'invoice_id and user_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current invoice
    const { data: current } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user_id)
      .single()

    if (!current) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    let updateData: any = { updated_at: new Date().toISOString() }

    // Handle different actions
    if (action === 'send') {
      updateData.status = 'sent'
      updateData.sent_at = new Date().toISOString()
    } else if (action === 'mark_paid') {
      updateData.status = 'paid'
      updateData.paid_at = new Date().toISOString()
    } else if (action === 'mark_overdue') {
      updateData.status = 'overdue'
    } else if (action === 'delete') {
      // Hard delete
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice_id)
        .eq('user_id', user_id)

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(200).json({ success: true, message: 'Invoice deleted' })
    } else if (items || tax_rate !== undefined || due_date || notes) {
      // Update fields
      if (items) {
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
        const tax_amount = subtotal * (tax_rate || current.tax_rate || 0) / 100
        updateData.items = items
        updateData.subtotal = subtotal
        updateData.tax_rate = tax_rate || current.tax_rate || 0
        updateData.tax_amount = tax_amount
        updateData.total = subtotal + tax_amount
        updateData.version = current.version + 1
      }
      if (due_date) updateData.due_date = due_date
      if (notes !== undefined) updateData.notes = notes
    } else {
      return res.status(400).json({ error: 'No update data provided' })
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoice_id)
      .eq('user_id', user_id)
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
    console.error('Update invoice error:', error)
    return res.status(500).json({ error: error.message || 'Failed to update invoice' })
  }
}