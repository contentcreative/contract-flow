import { useState } from 'react'
import Head from 'next/head'
import { Check, FileText, Shield, Zap, ArrowRight, Menu, X } from 'lucide-react'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [modalPlan, setModalPlan] = useState<'starter' | 'pro'>('starter')

  const openModal = (plan: 'starter' | 'pro') => {
    setModalPlan(plan)
    setShowModal(true)
  }

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
          <div className="flex items-center gap-3">
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
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Professional Contracts in Minutes, Not Hours
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered contract generation for freelancers and consultants. Plain language. Legally sound. Ready to sign.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => openModal('pro')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 flex items-center gap-2">
              Generate My First Contract <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => openModal('starter')} className="border border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50">
              Start Free
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">2 free contracts • No credit card required</p>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Sound Familiar?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-3xl mb-4">⏱</div>
              <h3 className="font-semibold text-lg mb-2">Hours of Copy-Paste</h3>
              <p className="text-gray-600">Spending 2-4 hours tweaking generic templates for every new client. Your time is money.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="font-semibold text-lg mb-2">Legal Uncertainty</h3>
              <p className="text-gray-600">Not sure if your contract actually protects you. One bad client could cost you everything.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-3xl mb-4">😰</div>
              <h3 className="font-semibold text-lg mb-2">Client Pushback</h3>
              <p className="text-gray-600">Contracts feel adversarial. Good clients get nervous. You lose momentum before you start.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet ContractFlow</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">AI-Powered Customization</h3>
                <p className="text-gray-600">Answer a few questions about your client and project. Our AI generates a tailored contract in under 2 minutes.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Plain Language</h3>
                <p className="text-gray-600">Contracts clients actually understand. No legalese. No intimidation. Just clear terms.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Protective & Professional</h3>
                <p className="text-gray-600">Built by legal experts, refined for freelancers. Payment protection, IP clauses, termination rights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> 2 contracts per month</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> All 5 contract types</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> PDF export</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Basic customization</li>
              </ul>
              <button onClick={() => openModal('starter')} className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">
                Get Started Free
              </button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="font-semibold text-xl mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-4">$9<span className="text-base font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Unlimited contracts</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> All 5 contract types</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> AI customization</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Google Docs export</li>
                <li className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> E-signature link</li>
              </ul>
              <button onClick={() => openModal('pro')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg mb-2">Are these contracts legally binding?</h3>
              <p className="text-gray-600">Our templates are drafted by legal professionals and designed to be enforceable. However, we recommend having a lawyer review for high-stakes engagements.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg mb-2">Can I customize the contracts?</h3>
              <p className="text-gray-600">Absolutely. Our AI asks you questions about your client and project, then generates a contract tailored to your specific situation.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-lg mb-2">What contract types are included?</h3>
              <p className="text-gray-600">Master Service Agreement, Statement of Work, Non-Disclosure Agreement, Independent Contractor Agreement, and Consulting Agreement.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes. No contracts (pun intended). Cancel from your dashboard at any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="font-bold text-xl text-white mb-4">ContractFlow</div>
          <p className="mb-4">AI-powered contracts for freelancers and consultants.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="mt-8 text-sm">© 2026 ContractFlow. All rights reserved.</p>
        </div>
      </footer>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2">
              {modalPlan === 'pro' ? 'Start Your 14-Day Free Trial' : 'Get Started Free'}
            </h2>
            <p className="text-gray-600 mb-6">Create your account to start generating contracts.</p>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="you@example.com" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="Create a password" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Create Account
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-500 text-center">By signing up, you agree to our Terms of Service.</p>
          </div>
        </div>
      )}
    </>
  )
}
