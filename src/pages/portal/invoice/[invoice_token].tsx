// Client Portal - View Invoice
// Accessible via: /portal/invoice/[invoice_token]

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ArrowLeft, Download, CreditCard, Check, Clock, AlertCircle } from 'lucide-react'

export default function ClientInvoicePortal() {
  const router = useRouter()
  const { invoice_token } = router.query
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!invoice_token) return
    fetchInvoice()
  }, [invoice_token])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/portal/invoice-view?token=${invoice_token}`)
      const data = await res.json()
      
      if (data.success) {
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
    if (!invoice?.payment_link) {
      // Create payment link
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">{error}</p>
          <a href="https://contract-flow.app" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to ContractFlow
          </a>
        </div>
      </div>
    )
  }

  const currencySymbol = { GBP: '£', EUR: '€', USD: '$' }[invoice.currency] || '£'
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500'
  }

  return (
    <>
      <Head>
        <title>Invoice {invoice.invoice_number} | ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <a 
              href="https://contract-flow.app" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Powered by ContractFlow
            </a>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status]}`}>
              {invoice.status?.toUpperCase()}
            </div>
          </div>

          {/* Invoice Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{invoice.invoice_number}</h1>
                  <p className="text-blue-100">
                    Issued by {invoice.client?.company_name || invoice.client?.name || 'Business'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{currencySymbol}{invoice.total?.toFixed(2)}</div>
                  <div className="text-blue-100">
                    {invoice.due_date ? `Due ${new Date(invoice.due_date).toLocaleDateString()}` : 'Due on receipt'}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-8">
              {/* Line Items */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Items</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium text-right">Qty</th>
                      <th className="pb-3 font-medium text-right">Rate</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items || []).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
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
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{invoice.subtotal?.toFixed(2)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span>{currencySymbol}{invoice.tax_amount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>{currencySymbol}{invoice.total?.toFixed(2)}</span>
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

              {/* Pay Now Button */}
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <div className="border-t pt-8">
                  <button
                    onClick={handlePayNow}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay Now - {currencySymbol}{invoice.total?.toFixed(2)}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Secure payment powered by Stripe
                  </p>
                </div>
              )}

              {invoice.status === 'paid' && (
                <div className="border-t pt-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Invoice Paid</h3>
                  <p className="text-gray-600">
                    Thank you! This invoice has been paid.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Generated by ContractFlow • AI-Powered Contract Software</p>
            <a href="https://contract-flow.app" className="text-blue-600 hover:underline mt-2 inline-block">
              Create your own invoices
            </a>
          </div>
        </div>
      </div>
    </>
  )
}