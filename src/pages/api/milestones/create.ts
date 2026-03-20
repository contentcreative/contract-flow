import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, contract_id, name, amount, milestone_number } = req.body

  if (!user_id || !contract_id || !name || !amount) {
    return res.status(400).json({ error: 'user_id, contract_id, name, and amount are required' })
  }

  try {
    const { data, error } = await supabase.from('contract_milestones').insert({
      user_id,
      contract_id,
      name,
      amount,
      milestone_number: milestone_number || 1,
      payment_trigger: req.body.payment_trigger || 'on_delivery',
      deposit_required: req.body.deposit_required || false,
      deposit_amount: req.body.deposit_amount,
      revision_limit: req.body.revision_limit || 2,
      overage_rate: req.body.overage_rate,
      expense_cap: req.body.expense_cap,
      expenses_included: req.body.expenses_included
    }).select().single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}