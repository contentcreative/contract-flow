import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Industry options for freelancer data collection
const INDUSTRIES = [
  { value: 'web_dev', label: 'Web Development' },
  { value: 'mobile_dev', label: 'Mobile App Development' },
  { value: 'design', label: 'Design (UI/UX, Graphic, Brand)' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'marketing', label: 'Digital Marketing & SEO' },
  { value: 'video', label: 'Video & Animation' },
  { value: 'consulting', label: 'Business Consulting' },
  { value: 'accounting', label: 'Accounting & Finance' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'admin', label: 'Virtual Assistant & Admin' },
  { value: 'other', label: 'Other' }
]

// Business type options
const BUSINESS_TYPES = [
  { value: 'sole_trader', label: 'Sole Trader / Individual' },
  { value: 'ltd', label: 'Limited Company (Ltd)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'agency', label: 'Agency / Studio' },
  { value: 'freelancer', label: 'Freelancer (no business registered)' }
]

// Primary goal options
const PRIMARY_GOALS = [
  { value: 'sign_contracts', label: 'Sign more contracts faster' },
  { value: 'professional_image', label: 'Look more professional' },
  { value: 'get_paid_faster', label: 'Get paid faster' },
  { value: 'save_time', label: 'Save time on admin' },
  { value: 'scale_business', label: 'Scale my business' }
]

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  
  // Phase 1: Extended registration fields
  const [industry, setIndustry] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('')
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Check if user already exists by querying the profiles table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (existingProfile) {
          setError('An account with this email already exists. Please sign in instead.')
          setIsSignUp(false)
          setLoading(false)
          return
        }

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
              industry,
              business_type: businessType,
              primary_goal: primaryGoal
            }
          }
        })

        if (error) throw error
        
        // Create profile record with extended fields
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            subscription_status: 'free',
            full_name: fullName,
            company_name: companyName,
            currency: 'GBP',
            // Phase 1: Extended registration data
            industry: industry || null,
            business_type: businessType || null,
            business_address: businessAddress || null,
            vat_number: vatNumber || null,
            primary_goal: primaryGoal || null
          })
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Continue anyway - dashboard will create profile if missing
          }
        }
        
        // Show verification message instead of redirecting
        setVerificationSent(true)
        setLoading(false)
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} — ContractFlow</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-bold text-2xl">ContractFlow</Link>
            <p className="text-gray-600 mt-2">AI contracts for freelancers</p>
          </div>

          {/* Verification email sent message */}
          {verificationSent && (
            <div className="bg-green-50 border border-green-200 p-8 rounded-2xl mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Check your email</h2>
              <p className="text-green-700 mb-4">
                We've sent a verification email to <strong>{email}</strong>
              </p>
              <p className="text-sm text-green-600 mb-4">
                Click the link in the email to verify your account, then sign in.
              </p>
              <p className="text-xs text-green-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setVerificationSent(false)} className="underline hover:text-green-700">
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Email & Password FIRST - for duplicate detection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>

              {isSignUp && (
                <>
                  {/* Rest of registration fields after email/password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      required={isSignUp}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Company Name <span className="text-gray-400 text-xs">(optional)</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Ltd"
                    />
                  </div>

                  {/* Phase 1: Extended Registration Fields */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Industry <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required={isSignUp}
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Business Type <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      required={isSignUp}
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Business Address</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="123 High Street, London, SW1A 1AA"
                      rows={2}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">VAT Number <span className="text-gray-400 text-xs">(if registered)</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="GB123456789"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Primary Goal <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      required={isSignUp}
                    >
                      <option value="">What do you want to achieve?</option>
                      {PRIMARY_GOALS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-blue-600 hover:underline">{isSignUp ? 'Sign in' : 'Sign up'}</button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
