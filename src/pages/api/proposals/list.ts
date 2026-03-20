import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, status } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' })
  }

  try {
    let query = supabase.from('proposals').select('*').eq('user_id', user_id)
    
    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Calculate conversion metrics
    const total = data?.length || 0
    const accepted = data?.filter((p: any) => p.status === 'accepted').length || 0
    const conversion_rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0

    return res.status(200).json({ 
      success: true, 
      data, 
      metrics: { total, accepted, conversion_rate, pending: total - accepted - data?.filter((p: any) => ['rejected', 'expired'].includes(p.status)).length || 0 }
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}