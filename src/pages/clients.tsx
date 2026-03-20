import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Plus, Users, Search, Edit, Trash2, Building2, Mail, Phone, MapPin, ArrowLeft, X, Check } from 'lucide-react'

type Client = {
  id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [router, setRouter] = useState<any>(null)

  useEffect(() => {
    // Dynamic imports to avoid build-time Supabase issues
    import('next/navigation').then(({ useRouter }) => {
      const localRouter = useRouter()
      setRouter(localRouter)
      
      import('@supabase/supabase-js').then(({ createClient }) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey)
          
          supabase.auth.getUser().then(({ data: { user: localUser } }) => {
            if (localUser) {
              setUser(localUser)
              fetchClients(supabase, localUser.id, search)
            } else {
              localRouter.push('/login')
            }
          })
        } else {
          setLoading(false)
        }
      })
    })
  }, [])

  const fetchClients = async (supabase: any, userId: string, searchTerm: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      const { data, error } = await query
      
      if (!error && data) {
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user && search !== undefined) {
      import('@supabase/supabase-js').then(({ createClient }) => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        fetchClients(supabase, user.id, search)
      })
    }
  }, [search, user])

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name || '',
        company_name: client.company_name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || ''
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !user) {
      alert('Client name is required')
      return
    }

    setSaving(true)
    
    try {
      const endpoint = editingClient 
        ? '/api/clients/update' 
        : '/api/clients/create'
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: editingClient?.id,
          user_id: user.id
        })
      })
      
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      
      setShowModal(false)
      import('@supabase/supabase-js').then(({ createClient }) => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        fetchClients(supabase, user.id, search)
      })
    } catch (error: any) {
      alert('Error saving client: ' + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingClient || !user) return
    
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/clients/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: deletingClient.id })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      
      setDeletingClient(null)
      import('@supabase/supabase-js').then(({ createClient }) => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        fetchClients(supabase, user.id, search)
      })
    } catch (error: any) {
      alert('Error deleting client: ' + error.message)
    }
    setDeleteLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Clients — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            {router && <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>}
            <div className="font-bold text-xl">ContractFlow</div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Clients</h1>
              <p className="text-gray-600">Manage your client database</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Client
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {clients.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">
                {search ? 'No clients found' : 'No clients yet'}
              </h2>
              <p className="text-gray-600 mb-6">
                {search ? 'Try a different search term' : 'Add your first client to get started'}
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                Add Your First Client
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-gray-600">Client</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-600">Contact</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-600 hidden md:table-cell">Location</th>
                    <th className="text-right px-6 py-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {client.company_name && (
                              <div className="text-sm text-gray-500">{client.company_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" /> {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" /> {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {client.address ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" /> {client.address}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(client)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeletingClient(client)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Company name (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="+44 123 456 7890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any notes about this client..."
                  />
                </div>
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
                  {saving ? 'Saving...' : editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-2">Delete Client?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {deletingClient.name}? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingClient(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Client'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}