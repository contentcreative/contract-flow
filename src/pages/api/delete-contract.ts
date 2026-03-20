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

  try {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contract_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}