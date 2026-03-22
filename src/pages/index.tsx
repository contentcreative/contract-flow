import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Check, FileText, Shield, Zap, ArrowRight, Menu, X, Globe } from 'lucide-react'

type Currency = 'GBP' | 'EUR' | 'USD'

const PRICING = {
  GBP: { monthly: 12, annual: 120, symbol: '£' },
  EUR: { monthly: 14, annual: 140, symbol: '€' },
  USD: { monthly: 15, annual: 150, symbol: '$' }
}

const COUNTRY_CURRENCY: Record<string, Currency> = {
  // UK
  GB: 'GBP',
  // EU countries
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', PL: 'EUR', CZ: 'EUR', SE: 'EUR', DK: 'EUR', FI: 'EUR', IE: 'EUR', GR: 'EUR', HU: 'EUR', RO: 'EUR', BG: 'EUR', SK: 'EUR', HR: 'EUR', SI: 'EUR', LT: 'EUR', LV: 'EUR', EE: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
  // US
  US: 'USD',
  // Other countries
  CA: 'USD', AU: 'USD', NZ: 'USD', SG: 'USD', HK: 'USD', JP: 'USD', CH: 'USD', NO: 'USD', IS: 'USD', LI: 'USD'
}

export default function Home() {
  const [currency, setCurrency] = useState<Currency>('GBP')
  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    // Detect currency based on location
    const detectCurrency = async () => {
      try {
        // Try to get country from Vercel/Edge headers
        const response = await fetch('/api/geo/detect')
        if (response.ok) {
          const data = await response.json()
          if (data.country && COUNTRY_CURRENCY[data.country]) {
            setCurrency(COUNTRY_CURRENCY[data.country])
          }
        }
      } catch (e) {
        // Fallback to browser locale
        const browserLang = navigator.language || 'en-US'
        if (browserLang.includes('GB')) setCurrency('GBP')
        else if (browserLang.includes('EUR')) setCurrency('EUR')
        else if (browserLang.includes('US')) setCurrency('USD')
        // Default stays as GBP
      } finally {
        setDetecting(false)
      }
    }
    detectCurrency()
  }, [])

  const price = PRICING[currency]

  return (
    <>
      <Head>
        <title>ContractFlow — AI Contracts for Freelancers</title>
        <meta name="description" content="Generate professional contracts in minutes. AI-powered contract automation for freelancers and consultants." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-xl">ContractFlow</div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 text-sm">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent font-medium text-gray-700 cursor-pointer"
              >
                <option value="GBP">£ GBP</option>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
              </select>
              {detecting && <span className="text-xs text-gray-400">...</span>}
            </div>
            <a href="/login" className="text-gray-600 hover:text-gray-900">Sign In</a>
            <a href="#pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/offer" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 hover:from-blue-600 hover:to-purple-700 transition-all">
            <span>🎁 Limited Offer:</span>
            <span className="font-semibold">5 Templates + 7-Day Pro Trial</span>
            <span className="ml-1">→</span>
          </Link>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Professional Contracts in Minutes, Not Hours
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered contract generation for freelancers and consultants. Plain language. Legally sound. Ready to sign.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/generate" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 flex items-center gap-2">
              Generate My First Contract <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/generate" className="border border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50">
              Start Free
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">2 free contracts • No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to close deals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">AI-Powered Generation</h3>
              <p className="text-gray-600">Describe your project and let AI generate a professional contract in seconds.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Plain English</h3>
              <p className="text-gray-600">Contracts written in clear, simple language. No legal jargon for your clients to decipher.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Legally Sound</h3>
              <p className="text-gray-600">Built by legal professionals with standard protections for freelancers and consultants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 text-center mb-12">Choose the plan that works for you</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="font-semibold text-xl mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-4">Free</div>
              <p className="text-gray-500 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> 2 contracts per month</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> All 5 contract types</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> PDF export</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Basic customization</li>
              </ul>
              <Link href="/generate" className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 text-center block">
                Get Started Free
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="font-semibold text-xl mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-4">{price.symbol}{price.monthly}<span className="text-base font-normal text-gray-500">/mo</span></div>
              <p className="text-sm text-gray-500 mb-6">Everything you need to scale</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Unlimited contracts</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> AI-powered generation</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> All contract types</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Google Docs export</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> E-signature workflow</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Priority support</li>
              </ul>
              <Link href="/generate" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 text-center block">
                Start Free Trial
              </Link>
              <p className="mt-3 text-xs text-center text-gray-500">7-day free trial • No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. No cancellation fees.' },
              { q: 'What contract types are included?', a: 'We support MSA, SOW, NDA, Freelance, and Consulting agreements. More templates coming soon.' },
              { q: 'Is the AI contract legally binding?', a: 'Our contracts are designed to be legally sound for business-to-business transactions. We recommend legal review for high-stakes agreements.' },
              { q: 'Do I need a credit card for the trial?', a: 'No, our 7-day trial is completely free with no credit card required.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-bold">ContractFlow</div>
          <p className="text-sm text-gray-500">© 2024 ContractFlow. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}