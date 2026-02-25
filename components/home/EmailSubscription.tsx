'use client'

import { useState } from 'react'
import { subscribeEmail } from '@/actions/subscribe'

export default function EmailSubscription() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', email)

    const result = await subscribeEmail(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setEmail('')
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-[#7A1E2C] dark:bg-[#4A2C2A] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">Be First to Know</h2>
        <p className="mb-6 opacity-90">Get exclusive updates on new drops, restocks and special offers.</p>
        
        {success ? (
          <p className="text-lg">Thank you for subscribing! 🎉</p>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-100">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="flex-1 px-4 py-3 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F2C6C2] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#F2C6C2] text-[#7A1E2C] font-semibold px-6 py-3 rounded hover:bg-[#E0AFA8] transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'JOIN THE VIP LIST'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}