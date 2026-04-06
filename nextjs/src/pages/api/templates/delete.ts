// API: Delete template
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { template_id } = req.body

    if (!template_id) {
      return res.status(400).json({ error: 'template_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Delete the template
    const { error } = await supabase
      .from('cf_templates')
      .delete()
      .eq('id', template_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete template error:', error)
    return res.status(500).json({ error: error.message || 'Failed to delete template' })
  }
}