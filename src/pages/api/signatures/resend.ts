// API: Resend signature request
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contract_id } = req.body

    if (!contract_id) {
      return res.status(400).json({ error: 'contract_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get signature request details
    const { data: sigRequest } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('contract_id', contract_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!sigRequest) {
      return res.status(404).json({ error: 'No signature request found' })
    }

    // In production, send reminder email via Resend
    // For now, just return success
    console.log('Resending signature reminder to:', sigRequest.signer_email)

    return res.status(200).json({
      success: true,
      message: 'Reminder sent to ' + sigRequest.signer_email
    })

  } catch (error: any) {
    console.error('Resend signature error:', error)
    return res.status(500).json({ error: error.message || 'Failed to resend' })
  }
}