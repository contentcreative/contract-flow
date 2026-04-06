import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Zap, FileText, Shield, Users, Clock, ArrowRight } from 'lucide-react'

export default function OfferPage() {
  return (
    <>
      <Head>
        <title>Limited Offer: 1 Free Contract + 7-Day Pro Trial | ContractFlow</title>
        <meta name="description" content="Get 1 free contract/month and a 7-day free trial of ContractFlow Pro. No credit card required. Start creating legally sound contracts in minutes." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="ContractFlow" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">ContractFlow</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/affiliate" className="text-gray-600 hover:text-gray-900">Affiliate</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Limited Time Offer
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Get <span className="text-blue-600">1 Free Contract/Month</span> + <span className="text-green-600">7-Day Pro Trial</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Start creating legally sound contracts in minutes. Perfect for freelancers, consultants, and agencies who want to close deals faster, look more professional, and get paid with built-in invoicing.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                Claim Your Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-gray-300 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50"
              >
                View All Plans
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">No credit card required • Cancel anytime</p>
          </div>

          {/* What's Included */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Here&apos;s What You Get</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">3 Contract Templates</h3>
                    <p className="text-gray-600 text-sm">Professionally drafted, ready to use</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['Master Service Agreement (MSA)', 'Statement of Work (SOW)', 'Non-Disclosure Agreement (NDA)'].map((template, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{template}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500 italic">Upgrade to Pro for 10+ templates</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">7-Day Pro Trial</h3>
                    <p className="text-gray-600 text-sm">Full access to all Pro features</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['Unlimited AI contract generation', '5 invoices per month', 'Google Docs export', 'E-signature workflow', 'Priority support', 'Analytics dashboard'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Sign Up Free</h3>
                <p className="text-gray-600">Create your account in 30 seconds. No credit card required.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Choose Your Template</h3>
                <p className="text-gray-600">Pick from 3 professional contract types and customize with AI.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Generate & Sign</h3>
                <p className="text-gray-600">Generate your contract and send for e-signature in minutes.</p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Why ContractFlow Beats Competitors</h2>
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
                    <td className="text-center py-4 font-bold text-green-600">£0/mo</td>
                    <td className="text-center py-4 text-gray-600">$49/mo</td>
                    <td className="text-center py-4 text-gray-600">$49/mo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Contract Templates</td>
                    <td className="text-center py-4 font-bold">3 (free) / 10+ (Pro)</td>
                    <td className="text-center py-4">Limited</td>
                    <td className="text-center py-4">Limited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Invoicing</td>
                    <td className="text-center py-4 font-bold">5 invoices/month</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">AI Generation</td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><Check className="w-5 h-5 text-green-500 inline" /></td>
                    <td className="text-center py-4"><span className="text-gray-400">—</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Free Trial</td>
                    <td className="text-center py-4 font-bold">7 days (no card)</td>
                    <td className="text-center py-4">14 days (card required)</td>
                    <td className="text-center py-4">7 days (card required)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Money-Back Guarantee</td>
                    <td className="text-center py-4 font-bold">30 days</td>
                    <td className="text-center py-4">—</td>
                    <td className="text-center py-4">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12">
              <h2 className="text-4xl font-bold mb-6">Ready to Close Deals Faster?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of freelancers using ContractFlow to save time, look professional, and get paid faster.
              </p>
              <Link
                href="/generate"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Start Your Free Trial Now
              </Link>
              <p className="mt-4 text-sm text-gray-500">No credit card • No commitment • Cancel anytime</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
            <Link href="/" className="inline-flex items-center gap-2 mb-2">
              <Image src="/logo.svg" alt="ContractFlow" width={20} height={20} />
              <span className="font-bold text-gray-700">ContractFlow</span>
            </Link>
            <p>© 2026 ContractFlow. All rights reserved. | <Link href="/pricing" className="text-blue-600 hover:underline">View all plans</Link></p>
          </div>
        </footer>
      </div>
    </>
  )
}