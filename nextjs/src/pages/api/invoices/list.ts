// API: List invoices
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, status, limit = 50 } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:client_id (id, name, email, company_name)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query.limit(limit)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Get invoice count by status for stats
    const { data: counts } = await supabase
      .from('invoices')
      .select('status', { count: 'exact' })
      .eq('user_id', user_id)

    const stats = {
      total: counts?.length || 0,
      draft: counts?.filter(i => i.status === 'draft').length || 0,
      sent: counts?.filter(i => i.status === 'sent').length || 0,
      paid: counts?.filter(i => i.status === 'paid').length || 0,
      overdue: counts?.filter(i => i.status === 'overdue').length || 0
    }

    return res.status(200).json({
      success: true,
      invoices: invoices || [],
      stats
    })

  } catch (error: any) {
    console.error('List invoices error:', error)
    return res.status(500).json({ error: error.message || 'Failed to list invoices' })
  }
}