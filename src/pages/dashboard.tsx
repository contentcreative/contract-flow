import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FileText, CreditCard, Settings, LogOut, Check, User, Crown, X, Save, Trash2, Eye, Pen, Copy, Clock, FileSignature, Zap, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'

type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  subscription_status: string
  currency: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contracts, setContracts] = useState<any[]>([])
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // Profile editing
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [editingCompany, setEditingCompany] = useState(false)
  const [tempName, setTempName] = useState('')
  const [tempCompany, setTempCompany] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Contract actions
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('GBP')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Get user profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // Create profile if it doesn't exist or error occurred
      if (profileError || !profileData) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            subscription_status: 'free',
            currency: 'GBP'
          })
          .select()
          .single()
        
        if (!insertError && newProfile) {
          profileData = newProfile
        } else {
          console.error('Error creating profile:', insertError)
          // Continue with default values
          profileData = {
            id: user.id,
            email: user.email,
            subscription_status: 'free',
            currency: 'GBP',
            full_name: null,
            company_name: null
          }
        }
      }
      
      if (profileData) {
        setProfile(profileData)
        setPlan(profileData.subscription_status || 'free')
        setTempName(profileData.full_name || '')
        setTempCompany(profileData.company_name || '')
        setSelectedCurrency(profileData.currency || 'GBP')
      }
      
      // Get contracts via API
      const contractsRes = await fetch('/api/get-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      const contractsResult = await contractsRes.json()
      if (contractsResult.success && contractsResult.data) {
        setContracts(contractsResult.data)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: tempName,
        company_name: tempCompany,
        currency: selectedCurrency
      })
      .eq('id', user.id)
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, full_name: tempName, company_name: tempCompany, currency: selectedCurrency } : null)
      setEditingName(false)
      setEditingCompany(false)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUpgrade = async () => {
    if (!user) return
    setCheckingOut(true)
    
    // Price IDs for each currency
    const priceIds: Record<string, string> = {
      GBP: 'price_1TCjOh6xVWAQY92bSZOQbedh',  // £9 GBP
      USD: 'price_1TCjOR6xVWAQY92bUtS2fpJm',  // $9 USD
      EUR: 'price_1TCjP06xVWAQY92bg7MQgWER'   // €9 EUR
    }
    
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          price_id: priceIds[selectedCurrency]
        })
      })
      
      const result = await res.json()
      
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        alert('Error starting checkout: ' + (result.error || 'Unknown error'))
        setCheckingOut(false)
      }
    } catch (error: any) {
      alert('Error starting checkout: ' + error.message)
      setCheckingOut(false)
    }
  }

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract)
    setShowContractModal(true)
  }

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return
    
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_id: contractId })
      })
      const result = await res.json()
      
      if (result.success) {
        setContracts(contracts.filter(c => c.id !== contractId))
      } else {
        alert('Error deleting contract: ' + result.error)
      }
    } catch (error: any) {
      alert('Error deleting contract: ' + error.message)
    }
    setDeleting(false)
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
              <Link href="/affiliate" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Earn Money
              </Link>
              <button onClick={() => setShowSettingsModal(true)} className="text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                {plan === 'pro' ? 'Pro' : 'Free'}
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
            <div className="grid md:grid-cols-6 gap-4">
              {[
                { type: 'MSA', name: 'Master Service Agreement', desc: 'General framework for ongoing services' },
                { type: 'SOW', name: 'Statement of Work', desc: 'Specific project details and deliverables' },
                { type: 'NDA', name: 'Non-Disclosure Agreement', desc: 'Protect confidential information' },
                { type: 'Contractor', name: 'Independent Contractor', desc: 'Hire a contractor for work' },
                { type: 'Consulting', name: 'Consulting Agreement', desc: 'Hire a consultant for advice' },
                { type: 'Templates', name: 'Templates', desc: 'Use saved templates or create new', link: '/templates' }
              ].map(({ type, name, desc, link }) => (
                link ? (
                  <Link
                    key={type}
                    href={link}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-gray-500 mt-1">{desc}</div>
                  </Link>
                ) : (
                  <Link
                    key={type}
                    href={`/generate?type=${type}`}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-gray-500 mt-1">{desc}</div>
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Subscription CTA */}
          {plan === 'free' && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-sm mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg mb-1">Upgrade to Pro</h2>
                  <p className="text-blue-100 text-sm">Unlimited contracts, AI customization, priority support</p>
                </div>
                <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50">
                  Upgrade — {selectedCurrency === 'GBP' ? '£9' : selectedCurrency === 'USD' ? '$9' : '€9'}/mo
                </button>
              </div>
            </div>
          )}

          {/* Recent Contracts */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Your Contracts ({contracts.length})</h2>
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No contracts yet. Create your first one above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.slice(0, 10).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.title || contract.contract_type || 'Untitled'}</div>
                        <div className="text-sm text-gray-500">
                          {contract.client_name || 'No client name'} • {contract.contract_type || 'Contract'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm text-gray-500">{new Date(contract.created_at).toLocaleDateString()}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          contract.status === 'generated' ? 'bg-blue-100 text-blue-700' :
                          contract.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {contract.status || 'draft'}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleViewContract(contract)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteContract(contract.id)}
                        disabled={deleting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm text-gray-500 mb-2 block">Full Name</label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter your name"
                      />
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setEditingName(false); setTempName(profile?.full_name || ''); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{profile?.full_name || 'Not set'}</div>
                      <button 
                        onClick={() => setEditingName(true)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm text-gray-500 mb-2 block">Company Name</label>
                  {editingCompany ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempCompany}
                        onChange={(e) => setTempCompany(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter company name"
                      />
                      <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setEditingCompany(false); setTempCompany(profile?.company_name || ''); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{profile?.company_name || 'Not set'}</div>
                      <button 
                        onClick={() => setEditingCompany(true)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Email (read only) */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm text-gray-500">Email</label>
                  <div className="font-medium">{user?.email}</div>
                  <p className="text-xs text-gray-400 mt-1">Contact support to change your email</p>
                </div>

                {/* Currency Selection */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm text-gray-500 mb-2 block">Currency</label>
                  <div className="flex gap-2">
                    {['GBP', 'USD', 'EUR'].map((currency) => (
                      <button
                        key={currency}
                        onClick={() => setSelectedCurrency(currency)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCurrency === currency
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedCurrency === 'GBP' ? '£9/mo' : selectedCurrency === 'USD' ? '$9/mo' : '€9/mo'}
                  </p>
                </div>

                {/* Subscription */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm text-gray-500">Current Plan</label>
                  <div className="font-medium flex items-center gap-2 mt-1">
                    {plan === 'pro' ? <Crown className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-gray-600" />}
                    {plan === 'pro' ? `Pro - ${selectedCurrency === 'GBP' ? '£9' : selectedCurrency === 'USD' ? '$9' : '€9'}/mo` : 'Free - 2 contracts/mo'}
                  </div>
                  {plan === 'pro' && (
                    <button className="mt-3 w-full p-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm">
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contract View Modal */}
        {showContractModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold">{selectedContract.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedContract.signature_status === 'signed' ? 'bg-green-100 text-green-700' :
                      selectedContract.signature_status === 'awaiting_signature' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedContract.signature_status === 'signed' ? '✓ Signed' : 
                       selectedContract.signature_status === 'awaiting_signature' ? '⏳ Awaiting Signature' : 
                       'Not Signed'}
                    </span>
                    <span className="text-xs text-gray-500">{selectedContract.contract_type}</span>
                    {selectedContract.version > 1 && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                        v{selectedContract.version}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-xl font-mono text-sm whitespace-pre-wrap mb-6">
                  {selectedContract.generated_text || 'No content available'}
                </div>

                {/* Contract Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <button 
                    onClick={() => {
                      const email = prompt("Enter client's email address for signature request:")
                      if (email) alert(`Signature request sent to ${email}`)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Pen className="w-4 h-4" /> Request Sign
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (confirm('Create a duplicate of this contract?')) {
                        fetch('/api/contracts/duplicate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            original_contract_id: selectedContract.id,
                            user_id: user.id
                          })
                        }).then(res => res.json()).then(data => {
                          if (data.success) alert('Contract duplicated!')
                          setShowContractModal(false)
                        })
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedContract.generated_text || '')
                      alert('Contract text copied to clipboard!')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Text
                  </button>

                  <button 
                    onClick={() => {
                      if (selectedContract.version > 1) {
                        const version = prompt(`Enter version number to restore (1-${selectedContract.version}):`)
                        if (version) alert(`Would restore to version ${version}`)
                      } else {
                        alert('No previous versions available')
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Version History
                  </button>
                </div>

                {/* E-Signature Status */}
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <h3 className="font-medium mb-3">E-Signature Status</h3>
                  {selectedContract.signature_status === 'signed' ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-5 h-5" /> This contract has been signed
                    </div>
                  ) : selectedContract.signature_status === 'awaiting_signature' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-700">Signature request has been sent. Waiting for client to sign.</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Resend Request
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Request a signature from your client to make this contract legally binding.</p>
                      <button 
                        onClick={() => {
                          const email = prompt("Enter client's email address:")
                          if (email) alert(`Signature request sent to ${email}. They will receive a link to sign.`)
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                      >
                        <FileSignature className="w-4 h-4" /> Request Signature
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowContractModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleDeleteContract(selectedContract.id)}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  )
}
