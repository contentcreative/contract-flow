import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, contract_id, client_id, invoice_number, amount, invoice_date, payment_due_date } = req.body

  if (!user_id || !invoice_number || !amount || !invoice_date || !payment_due_date) {
    return res.status(400).json({ error: 'user_id, invoice_number, amount, invoice_date, and payment_due_date are required' })
  }

  try {
    const { data, error } = await supabase.from('invoices').insert({
      user_id,
      contract_id,
      client_id,
      invoice_number,
      amount,
      invoice_date,
      payment_due_date,
      currency: req.body.currency || 'GBP',
      status: req.body.status || 'draft',
      notes: req.body.notes
    }).select().single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}