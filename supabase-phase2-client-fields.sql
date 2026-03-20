-- Phase 2: Extended Client Database Fields for ContractFlow
-- Run in Supabase Dashboard: https://civnknizmvnijhxbjyty.supabase.co
-- This adds 20+ new fields for comprehensive client relationship management

-- Add extended client fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_size TEXT;  -- '1-10', '11-50', '51-200', '200+'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_type TEXT;  -- 'decision_maker', 'influencer', 'procurement'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_contact_email TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS vat_tax_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'GBP';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms TEXT;  -- 'immediate', 'net15', 'net30', 'net60'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS po_number_required BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_contact_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_contact_date DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS communication_preferences TEXT;  -- 'email', 'phone', 'slack'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS legal_entity_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS jurisdiction TEXT;  -- contract governing law
ALTER TABLE clients ADD COLUMN IF NOT EXISTS insurance_requirements TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subcontractor_allowed BOOLEAN DEFAULT TRUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ip_ownership_terms TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_rating INTEGER;  -- 1-5
ALTER TABLE clients ADD COLUMN IF NOT EXISTS would_rehire BOOLEAN;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for frequently queried client fields
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(client_industry);
CREATE INDEX IF NOT EXISTS idx_clients_company_size ON clients(company_size);
CREATE INDEX IF NOT EXISTS idx_clients_payment_terms ON clients(payment_terms);
CREATE INDEX IF NOT EXISTS idx_clients_total_revenue ON clients(total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);

-- Client contacts table enhancements
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS is_billing_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS preferred_currency TEXT;
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS payment_terms TEXT;

-- Client contract history (for revenue tracking)
CREATE TABLE IF NOT EXISTS client_contract_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  contract_value DECIMAL(12,2) NOT NULL,
  contract_date DATE NOT NULL,
  payment_received_date DATE,
  days_to_payment INTEGER,
  contract_type TEXT,
  project_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_contract_history_client ON client_contract_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contract_history_date ON client_contract_history(contract_date DESC);

-- Verify the new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name NOT IN ('id', 'user_id', 'name', 'company_name', 'email', 'phone', 'address', 'notes', 'created_at', 'updated_at')
ORDER BY ordinal_position;