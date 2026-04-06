import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, contract_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' })
  }

  try {
    let query = supabase.from('contract_milestones').select('*').eq('user_id', user_id)
    
    if (contract_id) {
      query = query.eq('contract_id', contract_id)
    }

    const { data, error } = await query.order('milestone_number', { ascending: true })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Calculate totals
    const totals = data?.reduce((acc: any, m: any) => ({
      total_amount: (acc.total_amount || 0) + m.amount,
      completed_amount: (acc.completed_amount || 0) + (m.is_completed ? m.amount : 0),
      paid_amount: (acc.paid_amount || 0) + (m.payment_received ? m.amount : 0),
      pending_amount: (acc.pending_amount || 0) + (!m.payment_received ? m.amount : 0)
    }), {}) || {}

    return res.status(200).json({ success: true, data, totals })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}