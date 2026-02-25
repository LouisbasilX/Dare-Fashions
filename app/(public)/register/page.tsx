'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NIGERIAN_STATES } from '@/lib/constants'
import { mergeGuestBasket } from '@/actions/basket' // import the new function

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // 1. Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Signup failed – no user returned')
        setLoading(false)
        return
      }

      // 2. Update customer record with optional details
      const updates: any = {}
      if (name) updates.name = name
      if (phone) updates.phone = phone
      if (state) updates.state = state

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('customers')
          .update(updates)
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Failed to update customer details:', updateError)
        }
      }

      // 3. Merge any existing guest basket into the new user's account
      try {
        // mergeGuestBasket with consent = true (merge automatically)
        await mergeGuestBasket(true)
        console.log('Guest basket merged successfully')
      } catch (err) {
        console.error('Failed to merge guest basket:', err)
      }

      // 4. Redirect to homepage (user is already logged in)
      console.log('Redirecting to homepage')
      router.push('/')
      router.refresh()

      // 5. Fallback hard redirect in case router.push doesn't work
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch (err: any) {
      console.error('Unexpected error during registration:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md mx-auto my-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sign Up</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email *"
          required
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password *"
          required
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password *"
          required
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name (optional)"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number (optional)"
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">Select State (optional)</option>
          {NIGERIAN_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded transition"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}