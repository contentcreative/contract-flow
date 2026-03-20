import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contract_id } = req.body

  if (!contract_id) {
    return res.status(400).json({ error: 'contract_id is required' })
  }

  try {
    const { data, error } = await supabase
      .from('contract_versions')
      .select('*')
      .eq('contract_id', contract_id)
      .order('version_number', { ascending: true })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data: data || [] })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}