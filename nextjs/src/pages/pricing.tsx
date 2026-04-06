import Head from 'next/head'
import Link from 'next/link'
import { Check, FileText, CreditCard, Users, TrendingUp, Mail, Zap, Shield, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

type Currency = 'GBP' | 'EUR' | 'USD'
type Billing = 'monthly' | 'annual'

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>('GBP')
  const [billing, setBilling] = useState<Billing>('monthly')

  const currencySymbols = { GBP: '£', EUR: '€', USD: '$' }
  const currencySymbol = currencySymbols[currency]

  const prices = {
    monthly: { GBP: 12, EUR: 14, USD: 15 },
    annual: { GBP: 120, EUR: 140, USD: 150 }
  }

  const currentPrice = prices[billing][currency]

  const features = [
    { name: 'AI Contract Generation', icon: Zap, free: '1 contract/month', pro: 'Unlimited', agency: 'Unlimited' },
    { name: 'Contract Templates', icon: FileText, free: '3 contract types', pro: '10+ templates', agency: '10+ templates' },
    { name: 'Invoicing', icon: CreditCard, free: '2 invoices/mo', pro: '5 invoices/mo', agency: 'Unlimited' },
    { name: 'Affiliate Program', icon: Users, free: false, pro: true, agency: true },
    { name: 'Email Drip Campaigns', icon: Mail, free: false, pro: true, agency: true },
    { name: 'Analytics Dashboard', icon: TrendingUp, free: false, pro: true, agency: true },
    { name: 'Team Seats', icon: Users, free: '1 seat', pro: '1 seat', agency: '5 seats' },
    { name: 'Priority Support', icon: Shield, free: false, pro: true, agency: true }
  ]

  const competitors = [
    { name: 'Bonsai', price: '$49/mo', color: 'text-red-600' },
    { name: 'HoneyBook', price: '$49/mo', color: 'text-orange-600' },
    { name: 'ContractFlow', price: `${currencySymbol}${currentPrice}/mo`, color: 'text-green-600', highlight: true }
  ]

  return (
    <>
      <Head>
        <title>Pricing - ContractFlow</title>
        <meta name="description" content="AI-powered contracts for freelancers. 10x cheaper than competitors." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ContractFlow
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
              <Link href="/pricing" className="text-gray-900 font-medium">Pricing</Link>
              <Link href="/affiliate" className="text-gray-600 hover:text-gray-900">Affiliate</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/generate" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              AI-powered contracts and invoicing for freelancers. <span className="font-semibold text-green-600">3x cheaper</span> than competitors.
            </p>
            
            {/* Competitor Comparison */}
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-8">
              {competitors.map((comp, i) => (
                <div key={comp.name} className="flex items-center">
                  <span className={`font-medium ${comp.color}`}>
                    {comp.name}: {comp.price}
                  </span>
                  {i < competitors.length - 1 && <span className="mx-3 text-gray-400">•</span>}
                </div>
              ))}
            </div>

            {/* Currency & Billing */}
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-6 py-2 rounded-lg transition-colors ${billing === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={`px-6 py-2 rounded-lg transition-colors ${billing === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                >
                  Annual
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 17%</span>
                </button>
              </div>

              <div className="flex gap-2">
                {(['GBP', 'EUR', 'USD'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${currency === c ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Globe className="w-3 h-3 inline mr-1" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 text-sm mb-4">Perfect for trying out ContractFlow</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${feature.free ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.free ? 'text-gray-700' : 'text-gray-400'}>
                        <span className="font-medium">{typeof feature.free === 'string' ? feature.free : 'Included'}</span>
                        <span className="text-gray-500"> {feature.name.toLowerCase()}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/generate"
                  className="block w-full py-3 text-center border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden transform md:-translate-y-4">
              <div className="bg-blue-600 text-white p-8 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-blue-100 text-sm">For serious freelancers</p>
              </div>
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{currencySymbol}{currentPrice}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed {currencySymbol}{prices.annual[currency]} yearly
                    </p>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${feature.pro ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.pro ? 'text-gray-700' : 'text-gray-400'}>
                        <span className="font-medium">{typeof feature.pro === 'string' ? feature.pro : 'Included'}</span>
                        <span className="text-gray-500"> {feature.name.toLowerCase()}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/generate"
                  className="block w-full py-3 text-center bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Free Trial
                </Link>
                <p className="text-center text-xs text-gray-500 mt-3">No credit card required • 7-day trial</p>
              </div>
            </div>

            {/* Agency Tier */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Agency</h3>
                <p className="text-gray-500 text-sm mb-4">For teams and agencies</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{currencySymbol}39</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">5 team seats included</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${feature.agency ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.agency ? 'text-gray-700' : 'text-gray-400'}>
                        <span className="font-medium">{typeof feature.agency === 'string' ? feature.agency : 'Included'}</span>
                        <span className="text-gray-500"> {feature.name.toLowerCase()}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/generate"
                  className="block w-full py-3 text-center border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How We Compare</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 font-medium text-gray-500">Feature</th>
                    <th className="text-center py-4 font-medium text-gray-500">ContractFlow Pro</th>
                    <th className="text-center py-4 font-medium text-gray-500">Bonsai Elite</th>
                    <th className="text-center py-4 font-medium text-gray-500">HoneyBook</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 font-medium">Price</td>
                    <td className="text-center py-4 font-bold text-green-600">{currencySymbol}{currentPrice}/mo</td>
                    <td className="text-center py-4 text-gray-600">$49/mo</td>
                    <td className="text-center py-4 text-gray-600">$49/mo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">AI Contract Generation</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><span className="text-gray-400">—</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Invoicing</td>
                    <td className="text-center py-4">5 invoices included</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Affiliate Program</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><span className="text-gray-400">—</span></td>
                    <td className="text-center py-4"><span className="text-gray-400">—</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Email Drip Campaigns</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><span className="text-gray-400">—</span></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to save thousands?</h3>
            <p className="text-gray-600 mb-8">
              Join thousands of freelancers using ContractFlow for AI-powered contracts and invoicing.
            </p>
            <Link
              href="/generate"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <p className="text-sm text-gray-500 mt-3">No credit card required • Cancel anytime</p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© 2026 ContractFlow. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}