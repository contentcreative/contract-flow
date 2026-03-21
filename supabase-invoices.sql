-- Invoices Table for ContractFlow
-- Run this in Supabase SQL Editor

-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  notes TEXT,
  version INTEGER DEFAULT 1,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- 3. Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Function to check invoice limit
CREATE OR REPLACE FUNCTION check_invoice_limit(user_id UUID, invoice_count INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  plan TEXT;
  invoice_limit INTEGER;
BEGIN
  SELECT subscription_status INTO plan
  FROM profiles
  WHERE id = user_id;

  -- Set limits based on plan
  invoice_limit := CASE
    WHEN plan = 'pro' THEN 5
    WHEN plan = 'agency' THEN -1  -- unlimited
    ELSE 2  -- free tier
  END;

  -- -1 means unlimited
  IF invoice_limit = -1 THEN
    RETURN TRUE;
  END IF;

  RETURN invoice_count < invoice_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant execute
GRANT EXECUTE ON FUNCTION check_invoice_limit(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_invoice_limit(UUID, INTEGER) TO anon;

-- 6. Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE user_id = generate_invoice_number.user_id;

  invoice_num := 'INV-' || LPAD(next_num::TEXT, 5, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number(UUID) TO anon;

-- 7. Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_invoices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoices_updated ON invoices;
CREATE TRIGGER trigger_invoices_updated
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_timestamp();

-- 8. Create invoice templates table (for quick invoice creation)
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON invoice_templates
  FOR ALL USING (auth.uid() = user_id);