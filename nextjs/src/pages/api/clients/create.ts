import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// All client fields for enhanced data collection
const CLIENT_FIELDS = [
  'user_id', 'name', 'company_name', 'email', 'phone', 'address', 'notes',
  // Enhanced fields
  'industry', 'company_size', 'billing_contact_name', 'billing_contact_email',
  'vat_tax_id', 'preferred_currency', 'payment_terms', 'po_number_required',
  'total_revenue', 'contract_count', 'jurisdiction', 'insurance_required',
  'insurance_details', 'subcontractor_allowed', 'ip_ownership_terms',
  'contact_type', 'communication_preference', 'legal_entity_name',
  'first_contact_date', 'last_contact_date', 'client_rating', 'would_rehire',
  'risk_level', 'tags'
]

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id, name } = req.body

  if (!user_id || !name) {
    return res.status(400).json({ error: 'user_id and name are required' })
  }

  try {
    // Build insert object with only valid fields
    const insertData: any = { user_id, name }
    CLIENT_FIELDS.forEach(field => {
      if (field !== 'user_id' && field !== 'name' && req.body[field] !== undefined) {
        insertData[field] = req.body[field]
      }
    })

    const { data, error } = await supabase.from('clients').insert(insertData).select().single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}