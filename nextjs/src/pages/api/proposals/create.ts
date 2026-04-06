import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, prospect_name, prospect_email, title, status } = req.body

  if (!user_id || !prospect_name || !prospect_email || !title) {
    return res.status(400).json({ error: 'user_id, prospect_name, prospect_email, and title are required' })
  }

  try {
    // If status is 'sent', set sent date
    const insertData: any = {
      user_id,
      prospect_name,
      prospect_email,
      title,
      status: status || 'draft',
      estimated_value: req.body.estimated_value,
      description: req.body.description,
      prospect_phone: req.body.prospect_phone,
      prospect_company: req.body.prospect_company
    }

    if (status === 'sent') {
      insertData.proposal_sent_date = new Date().toISOString().split('T')[0]
    }

    const { data, error } = await supabase.from('proposals').insert(insertData).select().single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}