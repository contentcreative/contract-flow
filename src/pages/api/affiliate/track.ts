// API: Track affiliate clicks
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { referral_code, source, landing_page } = req.query.method === 'GET' ? req.query : req.body

    if (!referral_code) {
      return res.status(400).json({ error: 'Referral code required' })
    }

    // Find the affiliate
    const { data: affiliate } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('referral_code', referral_code)
      .single()

    if (!affiliate) {
      return res.status(404).json({ error: 'Invalid referral code' })
    }

    // Track the click
    const { data: click, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        referrer_code: referral_code,
        landing_page: landing_page || '/',
        source: source || 'direct',
        visitor_id: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
      })
      .select()
      .single()

    if (error) {
      console.error('Click tracking error:', error)
      // Don't fail the request for click tracking errors
    }

    // Update affiliate click count
    await supabase
      .from('affiliate_profiles')
      .update({
        total_clicks: supabase.rpc('increment', { row_id: affiliate.id, column_name: 'total_clicks' })
      })
      .eq('id', affiliate.id)

    return res.status(200).json({
      success: true,
      clickId: click?.id,
      affiliateId: affiliate.id
    })

  } catch (error: any) {
    console.error('Track click error:', error)
    return res.status(500).json({ error: error.message || 'Failed to track click' })
  }
}