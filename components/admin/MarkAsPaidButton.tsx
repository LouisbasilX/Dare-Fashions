'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markBasketsPaid } from '@/actions/admin'

export default function MarkAsPaidButton({ basketId, currentStatus }: { basketId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMarkPaid = async () => {
    if (currentStatus !== 'pending') {
      alert(`This basket is now ${currentStatus} and cannot be marked as paid.`)
      router.refresh()
      return
    }


    if (!confirm('Mark this basket as paid? This will reduce available stock.')) return
    setLoading(true)
    try {
     const {paid, skipped} =  await markBasketsPaid([basketId])
      if(skipped.length > 0){
        alert(`❌ This basket is either invalid or already paid and cannot be marked as paid.`)
        router.refresh()
        return
      }
      alert('✅ Basket marked as paid successfully!')
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