// API: Start free trial
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user_id, trial_days = 7 } = req.body

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user already has an active trial or subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_start, trial_end')
      .eq('id', user_id)
      .single()

    if (profile?.subscription_status === 'pro') {
      return res.status(400).json({ error: 'Already a Pro member' })
    }

    if (profile?.trial_end && new Date(profile.trial_end) > new Date()) {
      return res.status(400).json({ error: 'Trial already active' })
    }

    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + trial_days)

    // Update profile with trial status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'trial',
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      message: 'Trial started successfully',
      data: {
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        trial_days
      }
    })

  } catch (error: any) {
    console.error('Trial start error:', error)
    return res.status(500).json({ error: error.message || 'Failed to start trial' })
  }
}