// API: Generate or get affiliate referral code
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Check if user already has affiliate profile
    const { data: existingProfile } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return res.status(200).json({
        success: true,
        referralCode: existingProfile.referral_code,
        stats: {
          totalEarnings: existingProfile.total_earnings,
          totalClicks: existingProfile.total_clicks,
          totalConversions: existingProfile.total_conversions,
          pendingPayout: existingProfile.pending_payout
        }
      })
    }

    // Generate unique referral code
    const { data: newProfile, error } = await supabase
      .from('affiliate_profiles')
      .insert({
        id: user.id,
        referral_code: '', // Will be filled by database function or we generate here
        commission_rate: 0.25
      })
      .select()
      .single()

    if (error) {
      // If unique constraint fails, try again
      if (error.code === '23505') {
        // Retry with random code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const { data: retryProfile } = await supabase
          .from('affiliate_profiles')
          .insert({
            id: user.id,
            referral_code: randomCode,
            commission_rate: 0.25
          })
          .select()
          .single()
        
        if (retryProfile) {
          const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'}?ref=${retryProfile.referral_code}`
          return res.status(200).json({
            success: true,
            referralCode: retryProfile.referral_code,
            referralUrl,
            stats: {
              totalEarnings: 0,
              totalClicks: 0,
              totalConversions: 0,
              pendingPayout: 0
            }
          })
        }
      }
      return res.status(400).json({ error: error.message })
    }

    // Generate referral code
    const referralCode = user.email?.substring(0, 3).toUpperCase() + 
      Math.random().toString(36).substring(2, 6).toUpperCase()

    // Update with referral code
    await supabase
      .from('affiliate_profiles')
      .update({ referral_code: referralCode })
      .eq('id', user.id)

    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://contract-flow.app'}?ref=${referralCode}`

    return res.status(200).json({
      success: true,
      referralCode,
      referralUrl,
      stats: {
        totalEarnings: 0,
        totalClicks: 0,
        totalConversions: 0,
        pendingPayout: 0
      }
    })

  } catch (error: any) {
    console.error('Generate affiliate error:', error)
    return res.status(500).json({ error: error.message || 'Failed to generate affiliate code' })
  }
}