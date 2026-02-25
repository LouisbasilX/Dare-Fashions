'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mergeGuestBasket } from '@/actions/basket'
import { verifyBot } from '@/actions/verifyBot'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/')
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await verifyBot()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user) {
        // Check for guest basket
        const guestId = document.cookie.split('; ').find(row => row.startsWith('guest_session_id='))?.split('=')[1]
        if (guestId) {
          const { data: basket } = await supabase
            .from('baskets')
            .select('id')
            .eq('guest_session_id', guestId)
            .in('status', ['pending', 'invalid'])
            .maybeSingle()
          if (basket) {
            setShowModal(true)
            setLoading(false)
            return
          }
        }
        // No guest basket: merge user's own baskets and redirect
        await mergeGuestBasket(false) // false will just consolidate (no guest)
        router.push('/shop')
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleMerge = async (consent: boolean) => {
    setLoading(true)
    try {
      await mergeGuestBasket(consent)
      router.push('/shop')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    } finally {
      setShowModal(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] py-8">
        <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Log In</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">{error}</div>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-(--gold-dark) hover:bg-(gold) disabled:bg-gray-400 text-white py-2 rounded transition">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
      Or continue with
    </span>
  </div>
</div>

<button
  type="button"
  onClick={() => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account', // Forces account selection every time
      },
    },
  })}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
  Continue with Google
</button>

          </form>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Don't have an account? <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Register</Link>
          </p>
        </div>
      </div>

      {/* Merge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Guest Basket Found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You have items in a guest basket. Would you like to add them to your existing basket?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleMerge(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">Yes, merge</button>
              <button onClick={() => handleMerge(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">No, discard</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}