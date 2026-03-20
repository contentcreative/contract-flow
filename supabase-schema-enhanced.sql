-- =====================================================
-- CONTRACTFLOW ENHANCED SCHEMA - COMPLETE DATA COLLECTION
-- =====================================================

-- 1. ENHANCED PROFILES (User Registration Data)
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT; -- sole_trader, ltd, partnership, agency
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_revenue TEXT; -- under_10k, 10k_50k, 50k_100k, 100k_250k, 250k_plus
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goal TEXT; -- professional_image, get_paid_faster, automate_contracts, legal_protection
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_clients INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_tools TEXT; -- manual, word, google_docs, other_saas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source TEXT; -- google, twitter, linkedin, referral, other

-- 2. ENHANCED CLIENTS (Expanded Client Database)
-- =====================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_size TEXT; -- solo, small_2_10, medium_11_50, large_51_200, enterprise_200_plus
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_email TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS vat_tax_id VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'GBP';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30; -- days
ALTER TABLE clients ADD COLUMN IF NOT EXISTS po_number_required BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_count INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS jurisdiction TEXT; -- UK, US, EU, International
ALTER TABLE clients ADD COLUMN IF NOT EXISTS insurance_required BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS insurance_details TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subcontractor_allowed BOOLEAN DEFAULT TRUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ip_ownership_terms TEXT; -- client_owns, shared, freelancer_retains
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_type TEXT; -- decision_maker, influencer, user, finance
ALTER TABLE clients ADD COLUMN IF NOT EXISTS communication_preference TEXT; -- email, phone, slack, Teams
ALTER TABLE clients ADD COLUMN IF NOT EXISTS legal_entity_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_contact_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_contact_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_rating INTEGER; -- 1-5
ALTER TABLE clients ADD COLUMN IF NOT EXISTS would_rehire BOOLEAN;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_level TEXT; -- low, medium, high
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 3. ENHANCED CONTRACTS (Additional Contract Data)
-- =====================================================
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS internal_project_code TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_po_reference TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS confidentiality_level TEXT DEFAULT 'standard'; -- standard, high, nda_required
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS exclusivity BOOLEAN DEFAULT FALSE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS non_compete_geographic TEXT; -- local, regional, national, international, none
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS non_compete_months INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS warranty_period_days INTEGER DEFAULT 30;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS dispute_resolution TEXT; -- mediation, arbitration, court
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS termination_notice_days INTEGER DEFAULT 14;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS insurance_minimum_coverage DECIMAL(10,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS remote_work_allowed BOOLEAN DEFAULT TRUE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS equipment_provided_by TEXT; -- freelancer, client, shared
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_value DECIMAL(12,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'GBP';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, pending_signature, signed, active, completed, terminated
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 4. MILESTONES TABLE (Payment Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  user_id UUID NOT NULL,
  milestone_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  amount DECIMAL(12,2) NOT NULL,
  payment_trigger TEXT DEFAULT 'on_delivery'; -- on_delivery, net_15, net_30, net_60, immediate
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(12,2),
  deposit_due DATE,
  revision_limit INTEGER DEFAULT 2,
  overage_rate DECIMAL(8,2), -- per hour
  expense_cap DECIMAL(10,2),
  expenses_included TEXT[], -- e.g., travel, materials, software
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  invoice_id UUID,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own milestones" ON contract_milestones FOR ALL USING (auth.uid() = user_id);

-- 5. INVOICES TABLE (Post-Contract Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  milestone_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  status TEXT DEFAULT 'draft'; -- draft, sent, viewed, paid, overdue, cancelled
  invoice_date DATE NOT NULL,
  payment_due_date DATE NOT NULL,
  payment_received_date DATE,
  days_to_payment INTEGER,
  notes TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- 6. PROPOSALS TABLE (Pre-Contract Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prospect_name TEXT NOT NULL,
  prospect_company TEXT,
  prospect_email TEXT NOT NULL,
  prospect_phone TEXT,
  title TEXT NOT NULL,
  description TEXT,
  estimated_value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'GBP',
  status TEXT DEFAULT 'draft'; -- draft, sent, viewed, accepted, rejected, expired
  proposal_sent_date DATE,
  proposal_expiry_date DATE,
  views_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  converted_to_contract_id UUID,
  client_id UUID, -- if prospect becomes client
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own proposals" ON proposals FOR ALL USING (auth.uid() = user_id);

-- 7. CONTRACT RATINGS & FEEDBACK
-- =====================================================
CREATE TABLE IF NOT EXISTS contract_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  user_id UUID NOT NULL,
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  would_rehire BOOLEAN,
  issues_encountered TEXT,
  lessons_learned TEXT,
  payment_speed_rating INTEGER CHECK (payment_speed_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  overall_experience INTEGER CHECK (overall_experience BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contract_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own feedback" ON contract_feedback FOR ALL USING (auth.uid() = user_id);

-- 8. ANALYTICS SNAPSHOTS (Daily aggregations)
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  total_contracts INTEGER DEFAULT 0,
  total_revenue DECIMAL(14,2) DEFAULT 0,
  average_contract_value DECIMAL(12,2) DEFAULT 0,
  average_payment_days INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  repeat_client_count INTEGER DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,
  top_contract_type TEXT,
  top_industry TEXT,
  contracts_this_month INTEGER DEFAULT 0,
  revenue_this_month DECIMAL(14,2) DEFAULT 0,
  outstanding_balance DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analytics" ON analytics_snapshots FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contracts_user_status ON contracts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contract ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);

-- =====================================================
-- FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Update client revenue when invoice paid
CREATE OR REPLACE FUNCTION update_client_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_received = TRUE AND OLD.payment_received = FALSE THEN
    UPDATE clients SET 
      total_revenue = total_revenue + NEW.amount,
      last_contact_date = CURRENT_DATE
    WHERE id = (SELECT client_id FROM contracts WHERE id = NEW.contract_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update contract value when milestone paid
CREATE OR REPLACE FUNCTION update_contract_value()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contracts SET 
      contract_value = COALESCE(contract_value, 0) + NEW.amount
    WHERE id = NEW.contract_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for milestone payments
DROP TRIGGER IF EXISTS milestone_payment_trigger ON contract_milestones;
CREATE TRIGGER milestone_payment_trigger
  AFTER UPDATE ON contract_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_value();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================
-- INSERT INTO contract_milestones (contract_id, user_id, milestone_number, name, amount) VALUES (...);
-- INSERT INTO invoices (contract_id, user_id, client_id, invoice_number, amount, invoice_date, payment_due_date) VALUES (...);
-- INSERT INTO proposals (user_id, prospect_name, prospect_email, title, estimated_value) VALUES (...);