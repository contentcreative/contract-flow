import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FileText, Plus, CreditCard, Settings, LogOut, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<any[]>([])
  const [plan, setPlan] = useState<'starter' | 'pro'>('starter')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Get user profile
      const { data: profile } = await supabase
        .from('cf_users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setPlan(profile.plan)
      }
      
      // Get contracts
      const { data: contractData } = await supabase
        .from('cf_contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (contractData) {
        setContracts(contractData)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Dashboard — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">ContractFlow</Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {plan === 'pro' ? 'Pro' : 'Starter'}
              </span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-gray-500 text-sm mb-1">Total Contracts</div>
              <div className="text-3xl font-bold">{contracts.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-gray-500 text-sm mb-1">Plan</div>
              <div className="text-3xl font-bold">{plan === 'pro' ? 'Unlimited' : '2/mo'}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-gray-500 text-sm mb-1">Member Since</div>
              <div className="text-3xl font-bold">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="font-semibold text-lg mb-4">Create New Contract</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {['MSA', 'SOW', 'NDA', 'Contractor', 'Consulting'].map((type) => (
                <Link
                  key={type}
                  href={`/generate?type=${type}`}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center"
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="font-medium text-sm">{type}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Contracts */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Recent Contracts</h2>
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No contracts yet. Create your first one above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.slice(0, 10).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.contract_type}</div>
                        <div className="text-sm text-gray-500">{contract.client_name || 'No client name'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{new Date(contract.created_at).toLocaleDateString()}</div>
                      <span className={`text-xs px-2 py-1 rounded ${contract.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {contract.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
