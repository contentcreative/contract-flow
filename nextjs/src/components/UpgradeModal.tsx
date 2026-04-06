// Upgrade Modal Component - New Pricing
import { useState, useEffect } from 'react'
import { X, Check, Zap, Sparkles, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

type BillingPeriod = 'monthly' | 'annual'
type Currency = 'GBP' | 'EUR' | 'USD'

// Stripe Price IDs
const PRICE_IDS: Record<Currency, Record<BillingPeriod, string>> = {
  GBP: {
    monthly: 'price_1TDQSO6xVWAQY92b0nIT94Wt',
    annual: 'price_1TDQP26xVWAQY92bnEjDN4oT'
  },
  EUR: {
    monthly: 'price_1TDQSu6xVWAQY92btFfaE50e',
    annual: 'price_1TDQRr6xVWAQY92bEhqG1K2u'
  },
  USD: {
    monthly: 'price_1TDQSd6xVWAQY92bhZXKzjfV',
    annual: 'price_1TDQR26xVWAQY92b7wFE1i7N'
  }
}

const PRICES: Record<Currency, { monthly: number; annual: number; symbol: string }> = {
  GBP: { monthly: 12, annual: 120, symbol: '£' },
  EUR: { monthly: 14, annual: 140, symbol: '€' },
  USD: { monthly: 15, annual: 150, symbol: '$' }
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [currency, setCurrency] = useState<Currency>('GBP')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    if (isOpen) getUser()
  }, [isOpen])

  const handleUpgrade = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          user_email: user.email,
          price_id: PRICE_IDS[currency][billingPeriod]
        })
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

  const handleTrial = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id,
          trial_days: 7
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Your 7-day Pro trial has started! Enjoy unlimited contracts and AI generation.')
        onClose()
      }
    } catch (error) {
      console.error('Trial error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const currencySymbol = PRICES[currency].symbol
  const savings = Math.round((1 - (PRICES[currency].annual / (PRICES[currency].monthly * 12))) * 100)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Choose Your Plan</h2>
              <p className="text-sm text-gray-500">Unlock unlimited contracts with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Currency Selector */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Currency:</span>
              {(['GBP', 'EUR', 'USD'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    currency === c 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingPeriod === 'monthly' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'annual' 
                    ? 'bg-white shadow-sm text-green-600' 
                    : 'text-gray-600'
                }`}
              >
                Annual
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Save {savings}%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Free Tier */}
            <div className="border-2 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-1">Free</div>
              <p className="text-sm text-gray-500 mb-4">Forever free</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" /> 1 contract/month
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" /> 3 contract types
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" /> PDF export
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4" /> AI generation
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4" /> Google Docs
                </li>
              </ul>

              <button
                onClick={onClose}
                className="w-full py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Current Plan
              </button>
            </div>

            {/* Pro Monthly */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>

              <h3 className="font-bold text-lg mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">{currencySymbol}{billingPeriod === 'monthly' ? PRICES[currency].monthly : Math.round(PRICES[currency].annual / 12)}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-sm text-green-600 mb-4">Billed {currencySymbol}{PRICES[currency].annual} yearly</p>
              )}
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-blue-500" /> Unlimited contracts
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> AI-powered generation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> All contract types
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> Google Docs export
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> E-signature links
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500" /> Priority support
                </li>
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Loading...' : billingPeriod === 'monthly' ? 'Upgrade Now' : 'Upgrade - Save 17%'}
              </button>
            </div>

            {/* Trial */}
            <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Try Free
              </div>
              
              <h3 className="font-bold text-lg mb-2">7-Day Trial</h3>
              <div className="text-3xl font-bold mb-1 text-green-600">Free</div>
              <p className="text-sm text-gray-500 mb-4">No credit card required</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-green-500" /> Full Pro access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" /> 7 days unlimited
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" /> AI generation
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  No commitment
                </li>
              </ul>

              <button
                onClick={handleTrial}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {loading ? 'Starting...' : 'Start Free Trial'}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-3">
                Convert to paid anytime. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4 text-center">Everything in Pro</h4>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                'Unlimited contracts',
                'AI contract generation',
                'Google Docs export',
                'E-signature workflow',
                'Client database',
                'Analytics dashboard',
                'Email support',
                'Template library',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-6 border-t flex justify-center gap-8 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" /> Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" /> 30-day guarantee
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" /> Secure checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}