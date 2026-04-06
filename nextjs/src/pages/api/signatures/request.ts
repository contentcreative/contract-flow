import { createClient } from '@supabase/supabase-js'
import { sendSignatureRequest } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contract_id, signer_email, signer_name } = req.body

  if (!contract_id || !signer_email || !signer_name) {
    return res.status(400).json({ error: 'contract_id, signer_email, and signer_name are required' })
  }

  try {
    // Get contract details
    const { data: contract } = await supabase
      .from('contracts')
      .select('title, user_id')
      .eq('id', contract_id)
      .single()

    // Create signature request
    const { data: sigRequest, error } = await supabase.from('signature_requests').insert({
      contract_id,
      signer_email,
      signer_name,
      status: 'pending'
    }).select().single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Generate signature URL
    const signatureUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'}/sign/${sigRequest.id}`

    // Send signature request email
    await sendSignatureRequest({
      to: signer_email,
      recipientName: signer_name,
      contractTitle: contract?.title || 'Contract',
      signatureUrl,
    })

    // Update contract status
    await supabase
      .from('contracts')
      .update({ signature_status: 'awaiting_signature' })
      .eq('id', contract_id)

    return res.status(200).json({ 
      success: true, 
      data: sigRequest,
      signature_url: signatureUrl
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}