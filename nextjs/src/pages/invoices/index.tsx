import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Plus, FileText, Search, Filter, Download, MoreVertical, Eye, Edit, Trash2, Send, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function InvoicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, paid: 0, overdue: 0 })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }
    setUser(authUser)
    loadInvoices(authUser.id)
  }

  const loadInvoices = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status: filter === 'all' ? undefined : filter })
      })
      const data = await res.json()
      if (data.success) {
        setInvoices(data.invoices || [])
        setStats(data.stats || { total: 0, draft: 0, sent: 0, paid: 0, overdue: 0 })
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadInvoices(user.id)
  }, [filter, user])

  const handleSendInvoice = async (invoiceId: string) => {
    const res = await fetch('/api/invoices/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, user_id: user.id, action: 'send' })
    })
    const data = await res.json()
    if (data.success) {
      loadInvoices(user.id)
    } else {
      alert(data.error || 'Failed to send invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    const res = await fetch('/api/invoices/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, user_id: user.id, action: 'delete' })
    })
    const data = await res.json()
    if (data.success) {
      loadInvoices(user.id)
    } else {
      alert(data.error || 'Failed to delete invoice')
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    const searchLower = search.toLowerCase()
    return (
      inv.invoice_number?.toLowerCase().includes(searchLower) ||
      inv.client?.name?.toLowerCase().includes(searchLower) ||
      inv.client?.company_name?.toLowerCase().includes(searchLower)
    )
  })

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' }
    return `${symbols[currency] || '£'}${amount?.toFixed(2) || '0.00'}`
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Send },
      paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Clock }
    }
    const badge = badges[status] || badges.draft
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" /> {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Invoices | ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold">Invoices</h1>
            </div>
            <Link 
              href="/invoices/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'bg-blue-500' },
              { label: 'Draft', value: stats.draft, color: 'bg-gray-500' },
              { label: 'Sent', value: stats.sent, color: 'bg-blue-500' },
              { label: 'Paid', value: stats.paid, color: 'bg-green-500' },
              { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm">
                <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`}></div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'sent', 'paid', 'overdue'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-6">Create your first invoice to get started</p>
                <Link 
                  href="/invoices/new"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Create Invoice
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Invoice</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Client</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Due Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{invoice.client?.name || invoice.client?.company_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{invoice.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(invoice.total, invoice.currency)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Send Invoice"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  )
}