import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS - this runs server-side so it's safe
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('Save contract API called')
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET')
  console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'NOT SET')

  const { user_id, title, client_name, contract_type, contract_data, generated_text } = req.body

  try {
    console.log('Attempting to insert contract...')
    const { data, error } = await supabase.from('contracts').insert([
      {
        user_id,
        title,
        client_name,
        contract_type,
        contract_data,
        generated_text,
        status: 'generated'
      }
    ]).select()

    console.log('Insert result:', { data, error })

    if (error) {
      return res.status(400).json({ error: error.message, details: error })
    }

    return res.status(200).json({ success: true, data })
  } catch (error: any) {
    console.error('Exception:', error)
    return res.status(500).json({ error: error.message })
  }
}