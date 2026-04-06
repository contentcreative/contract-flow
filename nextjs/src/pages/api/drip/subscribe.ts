// API: Subscribe user to drip sequence
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, email_type } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Add user to drip sequence
    const { data: queueItem, error } = await supabase.rpc('add_to_drip_sequence', {
      user_id,
      email_type: email_type || 'abandoned_signup'
    })

    if (error) {
      // If function doesn't exist, insert directly
      const { data: newItem, error: insertError } = await supabase
        .from('email_queue')
        .insert({
          user_id,
          email_type: email_type || 'abandoned_signup',
          status: 'pending',
          scheduled_for: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        })
        .select()
        .single()

      if (insertError) {
        return res.status(400).json({ error: insertError.message })
      }

      return res.status(200).json({
        success: true,
        message: 'Added to drip sequence',
        data: newItem
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Added to drip sequence',
      data: queueItem
    })

  } catch (error: any) {
    console.error('Drip subscribe error:', error)
    return res.status(500).json({ error: error.message || 'Failed to subscribe' })
  }
}