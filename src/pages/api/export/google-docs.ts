import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contract_id, user_id, title, client_name, contract_type, generated_text } = req.body

  if (!contract_id || !user_id || !generated_text) {
    return res.status(400).json({ error: 'contract_id, user_id, and generated_text are required' })
  }

  try {
    // In production, this would use the Google Docs API
    // For now, we generate a document and provide download links
    
    // Convert contract text to Google Docs compatible format
    // This creates a simple .gdoc link (Google's internal format) or provides export options
    
    const documentContent = {
      title: title || 'Contract',
      clientName: client_name || '',
      contractType: contract_type || '',
      content: generated_text,
      createdAt: new Date().toISOString(),
      mimeType: 'application/vnd.google-apps.document'
    }

    // Store the document reference
    const { data, error } = await supabase
      .from('contract_documents')
      .insert({
        contract_id,
        user_id,
        title: title || 'Contract Document',
        document_data: documentContent,
        google_doc_id: null, // Would be populated after Google API integration
        status: 'ready'
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Generate export options
    // 1. Direct download as .txt
    // 2. Copy to clipboard (for pasting into Google Docs)
    // 3. In production: direct Google Docs link
    
    const clipboardContent = `${title || 'Contract'}

${generated_text}

---
Exported from ContractFlow - https://contract-flow-six.vercel.app`

    return res.status(200).json({ 
      success: true, 
      data,
      export_options: {
        copy_to_clipboard: clipboardContent,
        download_text: generated_text,
        google_docs_link: null // Requires OAuth setup
      }
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}