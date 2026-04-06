// Affiliate Dashboard Page
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Copy, Check, DollarSign, Users, MousePointer, TrendingUp, ArrowLeft, ExternalLink, Settings, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AffiliateDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'clicks' | 'commissions' | 'payouts'>('overview')

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
    loadAffiliateData(authUser.id)
  }

  const loadAffiliateData = async (userId: string) => {
    setLoading(true)
    try {
      // Check/create affiliate profile
      const res = await fetch('/api/affiliate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      
      if (data.success) {
        setStats({
          referralCode: data.referralCode,
          referralUrl: data.referralUrl,
          ...data.stats
        })
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (stats?.referralUrl) {
      navigator.clipboard.writeText(stats.referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareTwitter = () => {
    const text = `I love ContractFlow - AI contracts for freelancers! Get 20% off with my referral link:`
    const url = stats?.referralUrl
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareLinkedIn = () => {
    const url = stats?.referralUrl
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Try ContractFlow - AI Contracts for Freelancers'
    const body = `Hi,\n\nI've been using ContractFlow to generate professional contracts for my freelance business. It's amazing - AI-powered, plain language, legally sound.\n\nGet 20% off with my referral link: ${stats?.referralUrl}\n\nBest regards`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
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
        <title>Affiliate Dashboard — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-xl">Affiliate Dashboard</div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold">£{stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total Clicks</span>
              </div>
              <div className="text-3xl font-bold">{stats?.totalClicks || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Conversions</span>
              </div>
              <div className="text-3xl font-bold">{stats?.totalConversions || 0}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Pending Payout</span>
              </div>
              <div className="text-3xl font-bold">£{stats?.pendingPayout?.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={stats?.referralUrl || ''}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                  copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">Share your link:</p>
              <div className="flex gap-3">
                <button
                  onClick={shareTwitter}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </button>
                <button
                  onClick={shareLinkedIn}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </button>
                <button
                  onClick={shareEmail}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-medium mb-2">Share Your Link</h3>
                <p className="text-sm text-gray-500">Share your unique referral link with friends and followers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-medium mb-2">They Sign Up</h3>
                <p className="text-sm text-gray-500">When someone signs up, they get 20% off their first month</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-medium mb-2">You Earn</h3>
                <p className="text-sm text-gray-500">Earn 25% commission on every subscription they purchase</p>
              </div>
            </div>
          </div>

          {/* Payout Info */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg mb-1">Ready to Cash Out?</h2>
                <p className="text-blue-100">Minimum payout is £25. Request anytime!</p>
              </div>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Request Payout
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}