// API: Get affiliate stats
import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'

const createServerSupabaseClient = (cookieStore: any) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient(req.cookies as any)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Get affiliate profile
    const { data: profile, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'No affiliate profile found' })
    }

    // Get recent clicks
    const { data: recentClicks } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get commission history
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate conversion rate
    const conversionRate = profile.total_clicks > 0 
      ? ((profile.total_conversions / profile.total_clicks) * 100).toFixed(1) 
      : '0'

    // Get payout history
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(10)

    return res.status(200).json({
      success: true,
      profile: {
        referralCode: profile.referral_code,
        commissionRate: profile.commission_rate,
        totalEarnings: profile.total_earnings,
        totalClicks: profile.total_clicks,
        totalConversions: profile.total_conversions,
        conversionRate: conversionRate + '%',
        pendingPayout: profile.pending_payout,
        paidOut: profile.paid_out
      },
      recentClicks,
      commissions,
      payouts
    })

  } catch (error: any) {
    console.error('Get stats error:', error)
    return res.status(500).json({ error: error.message || 'Failed to get stats' })
  }
}