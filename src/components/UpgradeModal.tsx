// Upgrade Modal Component
import { useState } from 'react'
import { X, Check, Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upgrade to Professional</h2>
              <p className="text-sm text-gray-500">Unlock unlimited contracts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Check className="w-4 h-4" />
              50% OFF - Early Bird Offer
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">£9</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Also available in EUR & USD</p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              'Unlimited contracts per month',
              'AI-powered contract generation',
              'All 5 contract types included',
              'Google Docs export',
              'E-signature link generation',
              'Priority support',
              'Cancel anytime',
              'No hidden fees',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 text-sm font-medium">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center bg-blue-50 text-blue-600">Pro</div>
            </div>
            {[
              { feature: 'Contracts/month', free: '2', pro: 'Unlimited' },
              { feature: 'AI Generation', free: 'Limited', pro: 'Unlimited' },
              { feature: 'Contract Types', free: '5', pro: '5' },
              { feature: 'PDF Export', free: true, pro: true },
              { feature: 'Google Docs', free: false, pro: true },
              { feature: 'E-Signatures', free: false, pro: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm border-t">
                <div>{row.feature}</div>
                <div className="text-center text-gray-500">{row.free === true ? '✓' : row.free === false ? '✗' : row.free}</div>
                <div className="text-center bg-blue-50/50 font-medium text-blue-600">{row.pro === true ? '✓' : row.pro === false ? '✗' : row.pro}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              'Redirecting to checkout...'
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Upgrade Now - Start Free Trial
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure checkout via Stripe • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}