import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, name, contract_type, template_data, is_default } = req.body

  if (!user_id || !name || !contract_type || !template_data) {
    return res.status(400).json({ error: 'user_id, name, contract_type, and template_data are required' })
  }

  try {
    // If setting as default, clear other defaults for this type
    if (is_default) {
      await supabase
        .from('contract_templates')
        .update({ is_default: false })
        .eq('user_id', user_id)
        .eq('contract_type', contract_type)
    }

    const { data, error } = await supabase
      .from('contract_templates')
      .insert({
        user_id,
        name,
        contract_type,
        template_data,
        is_default: is_default || false
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}