import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { signature_id, signature_data, signer_ip } = req.body

  if (!signature_id || !signature_data) {
    return res.status(400).json({ error: 'signature_id and signature_data are required' })
  }

  try {
    const { data, error } = await supabase
      .from('signature_requests')
      .update({
        status: 'signed',
        signature_data,
        signed_at: new Date().toISOString(),
        ip_address: signer_ip
      })
      .eq('id', signature_id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Update contract signature status
    const contractId = data.contract_id
    await supabase
      .from('contracts')
      .update({ signature_status: 'signed' })
      .eq('id', contractId)

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}