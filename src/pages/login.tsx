import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        router.push('/dashboard')
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
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 hover:underline">{isSignUp ? 'Sign in' : 'Sign up'}</button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
