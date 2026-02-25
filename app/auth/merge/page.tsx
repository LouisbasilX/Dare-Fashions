'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { mergeGuestBasket } from '@/actions/basket'
import { createClient } from '@/lib/supabase/client'

export default function MergePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/shop'
  const [loading, setLoading] = useState(true)
  const [hasBasket, setHasBasket] = useState(false)

  useEffect(() => {
    const check = async () => {
      const guestId = document.cookie
        .split('; ')
        .find(r => r.startsWith('guest_session_id='))
        ?.split('=')[1]

      if (!guestId) {
        // No guest cookie, just move on
        router.replace(next)
        return
      }

      const supabase = createClient()
      const { data: basket } = await supabase
        .from('baskets')
        .select('id')
        .eq('guest_session_id', guestId)
        .in('status', ['pending', 'invalid'])
        .maybeSingle()

      if (!basket) {
        // Cookie exists but no basket, just move on
        router.replace(next)
        return
      }

      setHasBasket(true)
      setLoading(false)
    }

    check()
  }, [next, router])

  const handleMerge = async (consent: boolean) => {
    setLoading(true)
    await mergeGuestBasket(consent)
    router.push(next)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasBasket) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Guest Basket Found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You have items in a guest basket. Would you like to add them to your account?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleMerge(true)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
          >
            Yes, merge
          </button>
          <button
            onClick={() => handleMerge(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded"
          >
            No, discard
          </button>
        </div>
      </div>
    </div>
  )
}