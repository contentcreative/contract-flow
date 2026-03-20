import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contract_id, user_id, title, client_name, contract_data, generated_text, is_version } = req.body

  if (!contract_id || !user_id) {
    return res.status(400).json({ error: 'contract_id and user_id are required' })
  }

  try {
    // Fetch current contract
    const { data: current, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contract_id)
      .eq('user_id', user_id)
      .single()

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message })
    }

    // If creating a new version, save current as version history
    if (is_version) {
      await supabase.from('contract_versions').insert({
        contract_id: contract_id,
        version_number: current.version || 1,
        contract_data: current.contract_data,
        generated_text: current.generated_text,
        created_by: user_id
      })
    }

    // Update the contract
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (client_name !== undefined) updateData.client_name = client_name
    if (contract_data !== undefined) {
      updateData.contract_data = contract_data
      updateData.version = (current.version || 1) + (is_version ? 1 : 0)
    }
    if (generated_text !== undefined) updateData.generated_text = generated_text

    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contract_id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data, version: updateData.version })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}