import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, FileText, Trash2, Star, Copy, ArrowLeft, X, Check } from 'lucide-react'

type Template = {
  id: string
  name: string
  contract_type: string
  template_data: Record<string, any>
  is_default: boolean
  created_at: string
}

export default function Templates() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contract_type: 'MSA',
    is_default: false
  })
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  const contractTypes = [
    { value: 'MSA', label: 'Master Service Agreement' },
    { value: 'SOW', label: 'Statement of Work' },
    { value: 'NDA', label: 'Non-Disclosure Agreement' },
    { value: 'Contractor', label: 'Independent Contractor' },
    { value: 'Consulting', label: 'Consulting Agreement' },
    { value: 'Freelance', label: 'Freelance Agreement' },
    { value: 'FixedPrice', label: 'Fixed Price Project' },
    { value: 'Retainer', label: 'Retainer Agreement' },
    { value: 'Quote', label: 'Quote / Estimate' },
    { value: 'Invoice', label: 'Invoice Template' }
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchTemplates(user.id)
    }
    checkUser()
  }, [])

  const fetchTemplates = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/templates/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      const result = await res.json()
      if (result.success) {
        setTemplates(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !user) {
      alert('Template name is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.name,
          contract_type: formData.contract_type,
          template_data: {},
          is_default: formData.is_default
        })
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      
      setShowModal(false)
      setFormData({ name: '', contract_type: 'MSA', is_default: false })
      fetchTemplates(user.id)
    } catch (error: any) {
      alert('Error saving template: ' + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const res = await fetch('/api/templates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId })
      })
      
      const result = await res.json()
      if (result.success) {
        setTemplates(templates.filter(t => t.id !== templateId))
      }
    } catch (error) {
      alert('Error deleting template')
    }
  }

  const handleUseTemplate = (template: Template) => {
    // Navigate to generate page with template pre-selected
    router.push(`/generate?type=${template.contract_type}&template=${template.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Templates — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-xl">ContractFlow</div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Contract Templates</h1>
              <p className="text-gray-600">Save and manage your custom templates</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> New Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
              <p className="text-gray-600 mb-6">
                Create templates to save your commonly used contract configurations
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                Create Your First Template
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {contractTypes.find(t => t.value === template.contract_type)?.label || template.contract_type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>

                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Template Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">Create Template</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Standard Freelance Contract"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contract Type *</label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {contractTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm">Set as default for this contract type</span>
                </label>
              </div>
              
              <div className="flex gap-4 p-6 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}