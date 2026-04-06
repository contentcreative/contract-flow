-- Phase 4: Milestone & Payment Tracking Fields
-- Run in Supabase Dashboard: https://civnknizmvnijhxbjyty.supabase.co

-- Check if contract_milestones table exists, create if not
CREATE TABLE IF NOT EXISTS contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_milestones_user ON contract_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON contract_milestones(due_date);

-- Enable RLS
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own milestones" ON contract_milestones;
CREATE POLICY "Users can manage own milestones" ON contract_milestones 
  FOR ALL USING (auth.uid() = user_id);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_milestone_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for timestamp
DROP TRIGGER IF EXISTS update_milestone_timestamp ON contract_milestones;
CREATE TRIGGER update_milestone_timestamp
  BEFORE UPDATE ON contract_milestones
  FOR EACH ROW EXECUTE FUNCTION update_milestone_timestamp();

-- Verify table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'contract_milestones'
ORDER BY ordinal_position;