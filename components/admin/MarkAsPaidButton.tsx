'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markBasketsPaid } from '@/actions/admin'

export default function MarkAsPaidButton({ basketId }: { basketId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMarkPaid = async () => {
    if (!confirm('Mark this basket as paid? This will reduce available stock.')) return
    setLoading(true)
    try {
      await markBasketsPaid([basketId])
      alert('Basket marked as paid')
      router.refresh() // refresh the page to reflect new status
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkPaid}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
    >
      {loading ? 'Processing...' : 'Mark as Paid'}
    </button>
  )
}