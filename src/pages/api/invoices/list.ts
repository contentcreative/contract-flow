import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, contract_id, client_id, status } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' })
  }

  try {
    let query = supabase.from('invoices').select(`
      *,
      contract:contracts(title, contract_type),
      client:clients(name, company_name)
    `).eq('user_id', user_id)
    
    if (contract_id) query = query.eq('contract_id', contract_id)
    if (client_id) query = query.eq('client_id', client_id)
    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('invoice_date', { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Calculate totals
    const totals = data?.reduce((acc: any, inv: any) => ({
      total_invoiced: (acc.total_invoiced || 0) + inv.amount,
      total_paid: (acc.total_paid || 0) + (inv.status === 'paid' ? inv.amount : 0),
      total_outstanding: (acc.total_outstanding || 0) + (inv.status !== 'paid' && inv.status !== 'cancelled' ? inv.amount : 0),
      overdue_count: (acc.overdue_count || 0) + (inv.status === 'overdue' ? 1 : 0)
    }), {}) || {}

    return res.status(200).json({ success: true, data, totals })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}