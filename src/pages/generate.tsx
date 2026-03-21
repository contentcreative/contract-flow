import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Copy, Save, Check, User, ChevronDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { supabase } from '@/lib/supabase'

// Extended contract fields for Phase 3
const extendedFields = {
  // Client auto-populated fields
  client_name: { label: 'Client Name', source: 'clients', sourceField: 'name', auto: true },
  client_company: { label: 'Client Company', source: 'clients', sourceField: 'company_name', auto: true },
  client_email: { label: 'Client Email', source: 'clients', sourceField: 'email', auto: true },
  client_address: { label: 'Client Address', source: 'clients', sourceField: 'address', auto: true },
  client_industry: { label: 'Client Industry', source: 'clients', sourceField: 'client_industry', auto: true },
  client_jurisdiction: { label: 'Jurisdiction', source: 'clients', sourceField: 'jurisdiction', auto: true },
  payment_terms: { label: 'Payment Terms', source: 'clients', sourceField: 'payment_terms', auto: true },
  vat_tax_id: { label: 'Client VAT/Tax ID', source: 'clients', sourceField: 'vat_tax_id', auto: true },
  
  // New contract-specific fields
  internal_project_code: { label: 'Internal Project Code', source: 'contract', auto: false },
  client_po_number: { label: 'Client PO Number', source: 'contract', auto: false },
  confidentiality_level: { label: 'Confidentiality Level', source: 'contract', auto: false },
  exclusivity_terms: { label: 'Exclusivity Terms', source: 'contract', auto: false },
  insurance_requirements: { label: 'Insurance Requirements', source: 'clients', sourceField: 'insurance_requirements', auto: true },
  subcontractor_allowed: { label: 'Subcontractor Allowed', source: 'clients', sourceField: 'subcontractor_allowed', auto: true },
  ip_ownership: { label: 'IP Ownership Terms', source: 'clients', sourceField: 'ip_ownership_terms', auto: true },
  warranty_period: { label: 'Warranty Period', source: 'contract', auto: false },
  dispute_resolution: { label: 'Dispute Resolution', source: 'contract', auto: false },
  termination_notice_period: { label: 'Termination Notice Period', source: 'contract', auto: false },
}

const contractTypes: Record<string, any> = {
  MSA: {
    name: 'Master Service Agreement',
    fields: ['provider_name', 'client_name', 'effective_date', 'services_description', 'payment_terms', 'rate_structure', 'jurisdiction', 'termination_notice', 'confidentiality_level', 'insurance_requirements', 'subcontractor_allowed']
  },
  SOW: {
    name: 'Statement of Work',
    fields: ['project_name', 'client_name', 'provider_name', 'project_overview', 'deliverables', 'timeline', 'total_project_cost', 'payment_schedule', 'internal_project_code', 'client_po_number', 'warranty_period']
  },
  NDA: {
    name: 'Non-Disclosure Agreement',
    fields: ['party_a_name', 'party_b_name', 'effective_date', 'purpose', 'duration', 'jurisdiction', 'confidentiality_level', 'ip_ownership']
  },
  Contractor: {
    name: 'Independent Contractor Agreement',
    fields: ['contractor_name', 'client_name', 'effective_date', 'services_description', 'compensation', 'work_location', 'insurance_requirements', 'subcontractor_allowed', 'ip_ownership', 'termination_notice_period']
  },
  Consulting: {
    name: 'Consulting Agreement',
    fields: ['consultant_name', 'client_name', 'effective_date', 'consulting_scope', 'engagement_type', 'retainer_amount', 'hour_rate', 'payment_terms', 'jurisdiction', 'dispute_resolution']
  },
  Freelance: {
    name: 'Freelance Agreement',
    fields: ['client_name', 'freelancer_name', 'project_name', 'project_description', 'deliverables', 'total_fee', 'payment_terms', 'revision_limit', 'deadline', 'internal_project_code', 'client_po_number', 'ip_ownership']
  },
  FixedPrice: {
    name: 'Fixed Price Project',
    fields: ['client_name', 'provider_name', 'project_name', 'project_description', 'milestones', 'total_price', 'payment_schedule', 'completion_criteria', 'warranty_period', 'termination_notice_period']
  },
  Retainer: {
    name: 'Retainer Agreement',
    fields: ['client_name', 'provider_name', 'effective_date', 'monthly_hours', 'hourly_rate', 'services_description', 'carry_over_policy', 'termination_notice', 'exclusivity_terms']
  },
  Quote: {
    name: 'Quote / Estimate',
    fields: ['client_name', 'provider_name', 'quote_number', 'items_description', 'subtotal', 'tax', 'total', 'valid_until', 'payment_terms', 'client_po_number', 'vat_tax_id']
  },
  Invoice: {
    name: 'Invoice Template',
    fields: ['client_name', 'client_address', 'invoice_number', 'invoice_date', 'payment_due_date', 'items', 'subtotal', 'tax_rate', 'total', 'payment_details', 'vat_tax_id']
  }
}

// AI-Powered Contract Generation
// Uses OpenRouter API for intelligent contract text generation

async function generateContractWithAI(type: string, formData: Record<string, string>, onProgress?: (text: string) => void): Promise<{ text: string; title: string }> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractType: type, formData, streaming: true })
  })

  if (!response.ok) {
    throw new Error('Failed to generate contract')
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullText = ''
  let title = ''

  // Generate title from client name
  const clientName = formData.client_name || formData.party_b_name || formData.party_a_name || 'Client'
  const contractNames: Record<string, string> = {
    MSA: 'Master Service Agreement',
    SOW: 'Statement of Work',
    NDA: 'Non-Disclosure Agreement',
    Contractor: 'Independent Contractor Agreement',
    Consulting: 'Consulting Agreement',
    Freelance: 'Freelance Agreement',
    FixedPrice: 'Fixed Price Project',
    Retainer: 'Retainer Agreement',
    Quote: 'Quote',
    Invoice: 'Invoice'
  }
  title = `${contractNames[type] || type} - ${clientName}`

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        try {
          const parsed = JSON.parse(data)
          if (parsed.done) break
          if (parsed.chunk) {
            fullText += parsed.chunk
            onProgress?.(fullText)
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }

  return { text: fullText, title }
}

// Fallback template-based generation (original)
function generateContractText(type: string, formData: Record<string, string>): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const clientName = formData.client_name || formData.party_b_name || formData.party_a_name || '[Client Name]'

  const templates: Record<string, string> = {
    NDA: `NON-DISCLOSURE AGREEMENT\n\nDate: ${date}\n\nPARTIES:\nParty A: ${formData.party_a_name || '[Name]'}\nParty B: ${formData.party_b_name || clientName}\n\n1. PURPOSE\n${formData.purpose || 'The parties wish to explore a business relationship'}\n\n2. DURATION\nThis Agreement shall remain in effect for ${formData.duration || '2 years'}\n\n3. CONFIDENTIAL INFORMATION\n"Confidential Information" means any information disclosed by either party\n\n4. OBLIGATIONS\nParty B agrees to keep all confidential information strictly confidential\n\n5. JURISDICTION\nGoverned by laws of ${formData.jurisdiction || 'England and Wales'}\n\n---\nGenerated by ContractFlow`,

    SOW: `STATEMENT OF WORK\n\nDate: ${date}\nProject: ${formData.project_name || '[Project Name]'}\n\nPARTIES:\nClient: ${clientName}\nService Provider: ${formData.provider_name || '[Provider Name]'}\n\n1. PROJECT OVERVIEW\n${formData.project_overview || '[Description]'}\n\n2. DELIVERABLES\n${formData.deliverables || '[List of deliverables]'}\n\n3. TIMELINE\n${formData.timeline || '[Timeline]'}\n\n4. TOTAL COST\n${formData.total_project_cost || '£[Amount]'}\n\n5. PAYMENT SCHEDULE\n${formData.payment_schedule || '[Payment terms]'}\n\n---\nGenerated by ContractFlow`,

    Contractor: `INDEPENDENT CONTRACTOR AGREEMENT\n\nDate: ${date}\n\nPARTIES:\nClient: ${clientName}\nContractor: ${formData.contractor_name || '[Contractor Name]'}\n\n1. SERVICES\n${formData.services_description || '[Description of services]'}\n\n2. COMPENSATION\n${formData.compensation || '£[Amount]'}\n\n3. WORK LOCATION\n${formData.work_location || 'Remote'}\n\n4. INDEPENDENT STATUS\nContractor is an independent contractor\n\n---\nGenerated by ContractFlow`,

    Consulting: `CONSULTING AGREEMENT\n\nDate: ${date}\n\nPARTIES:\nClient: ${clientName}\nConsultant: ${formData.consultant_name || '[Consultant Name]'}\n\n1. CONSULTING SCOPE\n${formData.consulting_scope || '[Description of services]'}\n\n2. ENGAGEMENT TYPE\n${formData.engagement_type || '[Retainer / Project-based / Hourly]'}\n\n3. RATES\n${formData.retainer_amount || '£[Amount]'}\n\n---\nGenerated by ContractFlow`,

    Freelance: `FREELANCE AGREEMENT\n\nDate: ${date}\nProject: ${formData.project_name || '[Project Name]'}\n\nPARTIES:\nClient: ${clientName}\nFreelancer: ${formData.freelancer_name || '[Your Name]'}\n\n1. PROJECT DESCRIPTION\n${formData.project_description || '[Description]'}\n\n2. DELIVERABLES\n${formData.deliverables || '[Deliverables]'}\n\n3. TOTAL FEE\n${formData.total_fee || '£[Amount]'}\n\n4. PAYMENT TERMS\n${formData.payment_terms || '50% upfront, 50% on completion'}\n\n5. DEADLINE\n${formData.deadline || '[Deadline]'}\n\n---\nGenerated by ContractFlow`,

    FixedPrice: `FIXED PRICE PROJECT AGREEMENT\n\nDate: ${date}\nProject: ${formData.project_name || '[Project Name]'}\n\nPARTIES:\nClient: ${clientName}\nService Provider: ${formData.provider_name || '[Provider Name]'}\n\n1. PROJECT DESCRIPTION\n${formData.project_description || '[Description]'}\n\n2. MILESTONES\n${formData.milestones || '[Milestones]'}\n\n3. TOTAL PRICE\n${formData.total_price || '£[Amount]'}\n\n4. PAYMENT SCHEDULE\n${formData.payment_schedule || '[Payment milestones]'}\n\n---\nGenerated by ContractFlow`,

    Retainer: `RETAINER AGREEMENT\n\nDate: ${date}\n\nPARTIES:\nClient: ${clientName}\nService Provider: ${formData.provider_name || '[Provider Name]'}\n\n1. MONTHLY RETAINER\n${formData.monthly_hours || '10'} hours per month at ${formData.hour_rate || '£[rate]'} per hour\n\n2. SERVICES\n${formData.services_description || '[Services included]'}\n\n3. TERMINATION\n${formData.termination_notice || '30 days'} notice required\n\n---\nGenerated by ContractFlow`,

    Quote: `QUOTE / ESTIMATE\n\nDate: ${date}\nQuote #: ${formData.quote_number || 'QT-' + Date.now().toString().slice(-6)}\n\nPREPARED FOR:\n${clientName}\n\nPREPARED BY:\n${formData.provider_name || '[Your Company]'}\n\nITEMS:\n${formData.items_description || '[Line items]'}\n\nSUBTOTAL: ${formData.subtotal || '£0.00'}\nTAX: ${formData.tax || '£0.00'}\nTOTAL: ${formData.total || '£0.00'}\n\nVALID UNTIL: ${formData.valid_until || '[Date]'}\nPAYMENT TERMS: ${formData.payment_terms || 'Net 30'}\n\n---\nGenerated by ContractFlow`,

    Invoice: `INVOICE\n\nInvoice #: ${formData.invoice_number || 'INV-' + Date.now().toString().slice(-6)}\nDate: ${formData.invoice_date || new Date().toISOString().split('T')[0]}\n\nBILL TO:\n${clientName}\n${formData.client_address || '[Address]'}\n\nITEMS:\n${formData.items || '[Line items]'}\n\nSUBTOTAL: ${formData.subtotal || '£0.00'}\nTAX: ${formData.tax_rate || '0'}%\nTOTAL DUE: ${formData.total || '£0.00'}\n\n---\nGenerated by ContractFlow`,

    MSA: `MASTER SERVICE AGREEMENT\n\nDate: ${date}\n\nPARTIES:\nService Provider: ${formData.provider_name || '[Provider Name]'}\nClient: ${clientName}\n\n1. EFFECTIVE DATE\n${formData.effective_date || '[Date]'}\n\n2. SERVICES\n${formData.services_description || '[Description of services]'}\n\n3. PAYMENT TERMS\n${formData.payment_terms || 'Payment due within 30 days'}\n\n4. JURISDICTION\nGoverned by laws of ${formData.jurisdiction || 'England and Wales'}\n\n5. TERMINATION\n${formData.termination_notice || '30 days'} written notice\n\n---\nGenerated by ContractFlow`
  }

  return templates[type] || templates.MSA
}

export default function Generate() {
  const router = useRouter()
  const { type } = router.query
  const contract = contractTypes[type as string] || contractTypes.MSA
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{text: string, title: string, id?: string} | null>(null)
  const [saved, setSaved] = useState(false)
  
  // Phase 3: Client auto-population
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [loadingClients, setLoadingClients] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Fetch clients on mount
  useEffect(() => {
    async function fetchClients() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setLoadingClients(true)
      const { data } = await supabase
        .from('clients')
        .select('id, name, company_name, email, address, client_industry, jurisdiction, payment_terms, vat_tax_id, insurance_requirements, subcontractor_allowed, ip_ownership_terms')
        .eq('user_id', user.id)
        .order('name')
      
      if (data) setClients(data)
      setLoadingClients(false)
    }
    fetchClients()
  }, [])

  // Auto-populate form when client is selected
  useEffect(() => {
    if (!selectedClientId) return
    
    const client = clients.find(c => c.id === selectedClientId)
    if (!client) return
    
    // Auto-fill from client data
    const autoFields: Record<string, string> = {}
    if (client.name) autoFields.client_name = client.name
    if (client.company_name) autoFields.client_company = client.company_name
    if (client.email) autoFields.client_email = client.email
    if (client.address) autoFields.client_address = client.address
    if (client.client_industry) autoFields.client_industry = client.client_industry
    if (client.jurisdiction) autoFields.client_jurisdiction = client.jurisdiction
    if (client.payment_terms) autoFields.payment_terms = client.payment_terms
    if (client.vat_tax_id) autoFields.vat_tax_id = client.vat_tax_id
    if (client.insurance_requirements) autoFields.insurance_requirements = client.insurance_requirements
    if (client.ip_ownership_terms) autoFields.ip_ownership = client.ip_ownership_terms
    if (client.subcontractor_allowed !== null && client.subcontractor_allowed !== undefined) {
      autoFields.subcontractor_allowed = client.subcontractor_allowed ? 'Yes' : 'No'
    }
    
    setFormData(prev => ({ ...prev, ...autoFields }))
  }, [selectedClientId, clients])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    setShowClientDropdown(false)
  }

  const clearClientSelection = () => {
    setSelectedClientId('')
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerated(null)

    try {
      // Try AI generation with streaming
      const { text, title } = await generateContractWithAI(type as string, formData, (partialText) => {
        setGenerated({ text: partialText, title: '' })
      })
      setGenerated({ text, title })
    } catch (error) {
      // Fallback to template-based generation if AI fails
      console.warn('AI generation failed, using template fallback:', error)
      const text = generateContractText(type as string, formData)
      const title = `${contract.name} - ${formData.client_name || formData.party_b_name || 'Client'}`
      setGenerated({ text, title })
    }

    setGenerating(false)
  }

  const handleSave = async () => {
    if (!generated) return
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDownloadPDF = () => {
    if (!generated) return
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(generated.title, 20, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 30)
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(generated.text, 170)
    doc.text(lines, 20, 45)
    doc.setFontSize(8)
    doc.setTextColor(128)
    doc.text('Generated by ContractFlow - https://contract-flow-six.vercel.app', 20, 280)
    doc.save(`${generated.title.replace(/\s+/g, '_')}.pdf`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generated?.text || '')
  }

  if (!type || !contractTypes[type as string]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/dashboard" className="text-blue-600 hover:underline">Go back to dashboard</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Generate {contract.name} — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-xl">ContractFlow</div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{contract.name}</h1>
            <p className="text-gray-600">Fill in the details below to generate your contract.</p>
          </div>

          {!generated ? (
            <div className="bg-white p-8 rounded-xl shadow-sm">
              {/* Phase 3: Client Auto-Select */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Select Existing Client (Auto-fill)
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    value={selectedClientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    disabled={loadingClients}
                  >
                    <option value="">{loadingClients ? 'Loading clients...' : 'Select a client to auto-fill details'}</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company_name ? `(${client.company_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedClientId && (
                  <button
                    onClick={clearClientSelection}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {contract.fields.map((field: string) => (
                  <div key={field} className={field === 'project_overview' || field === 'deliverables' || field === 'consulting_scope' || field === 'project_description' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {field.replace(/_/g, ' ')}
                    </label>
                    {field === 'project_overview' || field === 'deliverables' || field === 'consulting_scope' || field === 'project_description' ? (
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        value={formData[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                      />
                    ) : (
                      <input
                        type={field.includes('date') ? 'date' : 'text'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> Generate Contract
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your Contract is Ready!</h2>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap">
                {generated.text}
              </div>
              <div className="mt-6 flex gap-4 items-center">
                <button onClick={handleSave} disabled={saved} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save to Dashboard</>}
                </button>
                <button onClick={() => { setGenerated(null); setFormData({}); }} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Create Another
                </button>
                <Link href="/dashboard" className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
