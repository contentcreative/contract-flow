import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { original_contract_id, user_id, new_client_name, new_title } = req.body

  if (!original_contract_id || !user_id) {
    return res.status(400).json({ error: 'original_contract_id and user_id are required' })
  }

  try {
    // Fetch original contract
    const { data: original, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', original_contract_id)
      .single()

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message })
    }

    // Create new contract based on original
    const newTitle = new_title || `Copy of ${original.title || original.contract_type}`
    const newClientName = new_client_name || original.client_name

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user_id,
        title: newTitle,
        client_name: newClientName,
        contract_type: original.contract_type,
        status: 'draft',
        contract_data: original.contract_data,
        generated_text: original.generated_text,
        signature_status: 'pending',
        version: 1,
        tags: original.tags || []
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