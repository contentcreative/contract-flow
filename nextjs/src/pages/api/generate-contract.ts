import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { type, formData, userId } = req.body
  const generatedContract = `[CONTRACT TYPE: ${type}]\nGenerated at: ${new Date().toISOString()}\n\nPlaceholder for AI-generated contract based on: ${JSON.stringify(formData)}`
  const { data, error } = await supabase.from('cf_contracts').insert({ user_id: userId, contract_type: type, client_name: formData.client_name || formData.party_b_name, project_name: formData.project_name, content: formData, status: 'completed' }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ contract: generatedContract, id: data.id })
}
