// API: Process and send due drip emails
// This endpoint should be called by a cron job every hour
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendDripEmail } from '@/lib/email-drip'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow cron requests (in production, verify cron secret)
  const cronSecret = req.headers['x-cron-secret']
  const expectedSecret = process.env.CRON_SECRET
  
  if (expectedSecret && cronSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get due emails
    const { data: dueEmails, error } = await supabase
      .from('email_queue')
      .select(`
        id,
        user_id,
        email_type,
        scheduled_for,
        profiles!inner(email, full_name)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(20)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    }

    for (const email of dueEmails || []) {
      results.processed++

      // Skip if user is already Pro
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', email.user_id)
        .single()

      if (profile?.subscription_status === 'pro') {
        // Mark as skipped - user upgraded
        await supabase
          .from('email_queue')
          .update({ status: 'skipped', error_message: 'User upgraded to Pro' })
          .eq('id', email.id)
        results.skipped++
        continue
      }

      // Send the email
      const recipientName = profile?.full_name || email.profiles?.full_name
      const sendResult = await sendDripEmail(email.email_type as any, {
        to: email.profiles?.email,
        recipientName
      })

      if (sendResult.success) {
        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            attempts: 1
          })
          .eq('id', email.id)
        
        // Record in stats
        await supabase
          .from('email_stats')
          .insert({
            user_id: email.user_id,
            email_type: email.email_type
          })
        
        results.sent++
      } else {
        // Mark as failed
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: sendResult.error,
            attempts: 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', email.id)
        
        results.failed++
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${results.processed} emails`,
      results
    })

  } catch (error: any) {
    console.error('Drip send error:', error)
    return res.status(500).json({ error: error.message || 'Failed to process emails' })
  }
}