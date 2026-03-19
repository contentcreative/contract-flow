import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, FileText, Download, Copy } from 'lucide-react'

const contractTypes: Record<string, any> = {
  MSA: {
    name: 'Master Service Agreement',
    fields: ['provider_name', 'client_name', 'effective_date', 'services_description', 'payment_terms', 'rate_structure', 'jurisdiction', 'termination_notice']
  },
  SOW: {
    name: 'Statement of Work',
    fields: ['project_name', 'client_name', 'provider_name', 'project_overview', 'deliverables', 'timeline', 'total_project_cost', 'payment_schedule']
  },
  NDA: {
    name: 'Non-Disclosure Agreement',
    fields: ['party_a_name', 'party_b_name', 'effective_date', 'purpose', 'duration', 'jurisdiction']
  },
  Contractor: {
    name: 'Independent Contractor Agreement',
    fields: ['contractor_name', 'client_name', 'effective_date', 'services_description', 'compensation', 'equipment_provides', 'work_location']
  },
  Consulting: {
    name: 'Consulting Agreement',
    fields: ['consultant_name', 'client_name', 'effective_date', 'consulting_scope', 'engagement_type', 'retainer_amount', 'hour_rate']
  }
}

export default function Generate() {
  const router = useRouter()
  const { type } = router.query
  const contract = contractTypes[type as string] || contractTypes.MSA
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    // In production, this would call OpenAI API
    setTimeout(() => {
      setGenerated(`[Generated contract for ${type} would appear here with all the form data: ${JSON.stringify(formData)}]`)
      setGenerating(false)
    }, 2000)
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
              <div className="grid md:grid-cols-2 gap-6">
                {contract.fields.map((field: string) => (
                  <div key={field} className={field === 'project_overview' || field === 'deliverables' || field === 'consulting_scope' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {field.replace(/_/g, ' ')}
                    </label>
                    {field === 'project_overview' || field === 'deliverables' || field === 'consulting_scope' ? (
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
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap">
                {generated}
              </div>
              <div className="mt-6 flex gap-4">
                <button onClick={() => { setGenerated(null); setFormData({}); }} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                  Create Another
                </button>
                <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
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
