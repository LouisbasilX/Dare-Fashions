'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getPendingBasketCount } from '@/actions/basket'

export default function BasketIcon() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getPendingBasketCount()
        setPendingCount(count)
      } catch (error) {
        console.error('Failed to fetch basket count', error)
      }
    }
    fetchCount()

    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/baskets" className="relative">
      <ShoppingCart className="w-6 h-6" />
      {pendingCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          1
        </span>
      )}
    </Link>
  )
}