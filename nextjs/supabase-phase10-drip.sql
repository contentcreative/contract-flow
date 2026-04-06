-- Phase 10: Email Drip Campaigns
-- Automated nurture sequences for free users

-- 1. Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'abandoned_signup', 'tips', 'upgrade_offer'
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'skipped'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create email_stats table for tracking
CREATE TABLE IF NOT EXISTS email_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  converted_to_pro BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_stats_user ON email_stats(user_id);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "System can manage email queue" ON email_queue
  FOR ALL USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can view own email stats" ON email_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage email stats" ON email_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Function to add user to drip sequence
CREATE OR REPLACE FUNCTION add_to_drip_sequence(user_id UUID, email_type TEXT)
RETURNS UUID AS $$
DECLARE
  new_queue_id UUID;
  scheduled_date TIMESTAMPTZ;
BEGIN
  -- Calculate scheduled date based on email type
  CASE email_type
    WHEN 'abandoned_signup' THEN scheduled_date := NOW() + INTERVAL '3 days'
    WHEN 'tips' THEN scheduled_date := NOW() + INTERVAL '7 days'
    WHEN 'upgrade_offer' THEN scheduled_date := NOW() + INTERVAL '14 days'
    ELSE scheduled_date := NOW() + INTERVAL '3 days'
  END CASE;
  
  INSERT INTO email_queue (user_id, email_type, scheduled_for)
  VALUES (user_id, email_type, scheduled_date)
  RETURNING id INTO new_queue_id;
  
  RETURN new_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(queue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE email_queue SET
    status = 'sent',
    sent_at = NOW()
  WHERE id = queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track email opened (for open tracking)
CREATE OR REPLACE FUNCTION track_email_opened(queue_id UUID)
RETURNS VOID AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Get the email record
  SELECT * INTO rec FROM email_queue WHERE id = queue_id;
  
  -- Update queue status
  UPDATE email_queue SET status = 'opened' WHERE id = queue_id;
  
  -- Record in stats
  INSERT INTO email_stats (user_id, email_type, opened, opened_at)
  VALUES (rec.user_id, rec.email_type, TRUE, NOW())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to process due emails (called by cron)
CREATE OR REPLACE FUNCTION process_due_emails()
RETURNS TABLE (id UUID, user_id UUID, email_type TEXT, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.user_id, q.email_type, p.email
  FROM email_queue q
  JOIN profiles p ON q.user_id = p.id
  WHERE q.status = 'pending'
  AND q.scheduled_for <= NOW()
  LIMIT 50; -- Process 50 at a time
END;
$$ LANGUAGE plpgsql;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION add_to_drip_sequence(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_due_emails() TO authenticated;