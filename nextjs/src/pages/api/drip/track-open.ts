// API: Track email open (pixel tracking)
// GET /api/drip/track-open?id=xxx
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Queue ID required' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get email details
    const { data: email } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', id)
      .single()

    if (!email) {
      // Return 1x1 transparent GIF
      return res.setHeader('Content-Type', 'image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'))
    }

    // Update as opened
    await supabase
      .from('email_queue')
      .update({ status: 'opened' })
      .eq('id', id)

    // Record in stats (upsert to avoid duplicates)
    await supabase
      .from('email_stats')
      .upsert({
        user_id: email.user_id,
        email_type: email.email_type,
        opened: true,
        opened_at: new Date().toISOString()
      }, { onConflict: 'user_id, email_type' })

    // Return 1x1 transparent GIF
    return res.setHeader('Content-Type', 'image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'))

  } catch (error: any) {
    console.error('Track open error:', error)
    // Still return the GIF to not break email clients
    return res.setHeader('Content-Type', 'image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'))
  }
}