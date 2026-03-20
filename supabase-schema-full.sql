-- Client Management Schema for ContractFlow

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client contacts (multiple contacts per client)
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract templates (user can create custom templates)
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract versions (for history)
CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  contract_data JSONB NOT NULL,
  generated_text TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_id, version_number)
);

-- Signature requests (for e-signature workflow)
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'signed', 'declined')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signature_data TEXT, -- Base64 signature image
  ip_address TEXT
);

-- Contract tags
CREATE TABLE IF NOT EXISTS contract_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6'
);

CREATE TABLE IF NOT EXISTS contract_tag_mapping (
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES contract_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contract_id, tag_id)
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_tag_mapping ENABLE ROW LEVEL SECURITY;

-- Policies for clients
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_contacts
CREATE POLICY "Users can view own contacts" ON client_contacts FOR SELECT USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_contacts.client_id));
CREATE POLICY "Users can create contacts" ON client_contacts FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_contacts.client_id));
CREATE POLICY "Users can update contacts" ON client_contacts FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_contacts.client_id));
CREATE POLICY "Users can delete contacts" ON client_contacts FOR DELETE USING (auth.uid() IN (SELECT user_id FROM clients WHERE id = client_contacts.client_id));

-- Policies for contract_templates
CREATE POLICY "Users can view own templates" ON contract_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create templates" ON contract_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update templates" ON contract_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete templates" ON contract_templates FOR DELETE USING (auth.uid() = user_id);

-- Policies for contract_versions
CREATE POLICY "Users can view own versions" ON contract_versions FOR SELECT USING (auth.uid() IN (SELECT user_id FROM contracts WHERE id = contract_versions.contract_id));
CREATE POLICY "Users can create versions" ON contract_versions FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM contracts WHERE id = contract_versions.contract_id));

-- Policies for signature_requests
CREATE POLICY "Users can view own requests" ON signature_requests FOR SELECT USING (auth.uid() IN (SELECT user_id FROM contracts WHERE id = signature_requests.contract_id));
CREATE POLICY "Users can create requests" ON signature_requests FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM contracts WHERE id = signature_requests.contract_id));
CREATE POLICY "Users can update requests" ON signature_requests FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM contracts WHERE id = signature_requests.contract_id));

-- Policies for contract_tags
CREATE POLICY "Users can view own tags" ON contract_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tags" ON contract_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update tags" ON contract_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete tags" ON contract_tags FOR DELETE USING (auth.uid() = user_id);

-- Policies for contract_tag_mapping
CREATE POLICY "Users can manage tag mapping" ON contract_tag_mapping FOR ALL USING (auth.uid() IN (SELECT user_id FROM contracts WHERE id = contract_tag_mapping.contract_id));

-- Update contracts table to support more fields
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signature_status TEXT DEFAULT 'pending' CHECK (signature_status IN ('pending', 'awaiting_signature', 'signed', 'declined'));
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);