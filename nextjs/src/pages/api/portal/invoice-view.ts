// API: Client portal invoice view
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ error: 'Token required' })
    }

    // In production, you'd have a separate portal_tokens table
    // For now, we'll use a simple approach: encode invoice_id + user_id
    
    // Decode token (in production, use proper encryption)
    const decoded = Buffer.from(token as string, 'base64').toString('utf-8')
    const [invoice_id, user_id] = decoded.split(':')

    if (!invoice_id || !user_id) {
      return res.status(400).json({ error: 'Invalid token' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get invoice with client details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id (id, name, email, company_name)
      `)
      .eq('id', invoice_id)
      .eq('user_id', user_id)
      .single()

    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    // Get provider details for the portal header
    const { data: provider } = await supabase
      .from('profiles')
      .select('company_name, full_name, email')
      .eq('id', user_id)
      .single()

    return res.status(200).json({
      success: true,
      invoice: {
        ...invoice,
        provider: provider
      }
    })

  } catch (error: any) {
    console.error('Portal view error:', error)
    return res.status(500).json({ error: error.message || 'Failed to load invoice' })
  }
}