// Client Portal - Simple Invoice View & Payment
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Check, AlertCircle, FileText } from 'lucide-react'

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
}

interface Client {
  name: string
  email: string
  company_name?: string
}

interface Invoice {
  id: string
  invoice_number: string
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  status: string
  due_date: string
  notes?: string
  client?: Client
  user_id: string
  payment_link?: string
  created_at: string
}

export default function ClientInvoicePortal() {
  const router = useRouter()
  const { invoice_token } = router.query
  
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!invoice_token) return
    fetchInvoice()
  }, [invoice_token])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/portal/invoice-view?token=${invoice_token}`)
      const data = await res.json()
      
      if (data.success && data.invoice) {
        setInvoice(data.invoice)
      } else {
        setError(data.error || 'Invoice not found')
      }
    } catch (e) {
      setError('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async () => {
    if (!invoice) return
    
    setProcessing(true)
    try {
      if (!invoice.payment_link) {
        // Create payment link first
        const res = await fetch('/api/invoices/create-payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            invoice_id: invoice.id, 
            user_id: invoice.user_id 
          })
        })
        const data = await res.json()
        
        if (data.success && data.payment_url) {
          window.location.href = data.payment_url
        } else {
          alert(data.error || 'Failed to create payment link')
        }
      } else {
        window.location.href = invoice.payment_link
      }
    } catch (e) {
      alert('Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' }
    return `${symbols[currency] || '£'}${amount?.toFixed(2) || '0.00'}`
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      draft: { text: 'Draft', color: 'bg-gray-100 text-gray-700' },
      sent: { text: 'Sent', color: 'bg-blue-100 text-blue-700' },
      paid: { text: 'Paid', color: 'bg-green-100 text-green-700' },
      overdue: { text: 'Overdue', color: 'bg-red-100 text-red-700' },
      cancelled: { text: 'Cancelled', color: 'bg-gray-100 text-gray-500' }
    }
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This invoice may have been removed or is no longer available.'}</p>
          <a href="https://contract-flow.app" className="text-blue-600 hover:underline">
            Go to ContractFlow
          </a>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay(invoice.status)
  const currencySymbol = { GBP: '£', EUR: '€', USD: '$' }[invoice.currency] || '£'

  return (
    <>
      <Head>
        <title>Invoice {invoice.invoice_number} | ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <a 
              href="https://contract-flow.app" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Powered by ContractFlow
            </a>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </div>
          </div>

          {/* Invoice Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Invoice #{invoice.invoice_number}</h1>
                  <p className="text-blue-100">
                    Issued by {invoice.client?.company_name || invoice.client?.name || 'ContractFlow'}
                  </p>
                  <p className="text-blue-200 text-sm mt-1">
                    {new Date(invoice.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</div>
                  <div className="text-blue-100 mt-2">
                    {invoice.due_date 
                      ? `Due ${new Date(invoice.due_date).toLocaleDateString()}`
                      : 'Due on receipt'}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-8">
              {/* Client Info */}
              {invoice.client && (
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-2">Bill To</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{invoice.client.company_name || invoice.client.name}</p>
                    {invoice.client.email && <p className="text-gray-600 text-sm">{invoice.client.email}</p>}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
                <h3 className="font-medium text-gray-900 mb-4">Items</h3>
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium text-right">Qty</th>
                      <th className="pb-3 font-medium text-right">Rate</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items || []).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">{item.description || 'Service'}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">{currencySymbol}{item.rate?.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium">
                          {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full md:w-64 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600 text-sm">{invoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-8">
                {invoice.status === 'paid' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Invoice Paid</h3>
                    <p className="text-gray-600">
                      Thank you for your payment. This invoice has been marked as paid.
                    </p>
                  </div>
                ) : invoice.status !== 'cancelled' ? (
                  <div className="space-y-4">
                    <button
                      onClick={handlePayNow}
                      disabled={processing}
                      className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay Now - {formatCurrency(invoice.total, invoice.currency)}
                        </>
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      Secure payment powered by Stripe
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Invoice Cancelled</h3>
                    <p className="text-gray-600">
                      This invoice has been cancelled and cannot be paid.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Generated by ContractFlow • AI-Powered Contract Software</p>
            <p className="mt-1">
              Questions? Contact{' '}
              <a href="mailto:support@contract-flow.app" className="text-blue-600 hover:underline">
                support@contract-flow.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// Handle dynamic routes
export async function getStaticProps() {
  return {
    props: {},
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}