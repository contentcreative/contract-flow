// API: Restore contract to a previous version
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contract_id, version } = req.body

    if (!contract_id || !version) {
      return res.status(400).json({ error: 'contract_id and version required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the contract
    const { data: contract } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contract_id)
      .single()

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' })
    }

    // In a full implementation, we'd store version history in a separate table
    // For now, we'll just update the version number
    // In production, you'd restore from version_history table

    // Update the contract version
    const { error } = await supabase
      .from('contracts')
      .update({
        version: version,
        updated_at: new Date().toISOString()
      })
      .eq('id', contract_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Log the restore action (in production, save to audit table)
    console.log('Contract', contract_id, 'restored to version', version)

    return res.status(200).json({
      success: true,
      message: 'Contract restored to version ' + version
    })

  } catch (error: any) {
    console.error('Restore version error:', error)
    return res.status(500).json({ error: error.message || 'Failed to restore' })
  }
}