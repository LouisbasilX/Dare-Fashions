'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function OrderFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [delivered, setDelivered] = useState(searchParams.get('delivered') || '')

  const applyFilter = () => {
    const params = new URLSearchParams()
    if (delivered) params.set('delivered', delivered)
    router.push(`/orders?${params.toString()}`)
  }

  const resetFilter = () => {
    setDelivered('')
    router.push('/orders')
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={delivered}
          onChange={(e) => setDelivered(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">All Orders</option>
          <option value="false">Pending Delivery</option>
          <option value="true">Delivered</option>
        </select>

        <div className="flex gap-2 md:col-span-2">
          <button
            onClick={applyFilter}
            className="flex-1 bg-(--gold-dark) hover:bg-(--gold) text-white px-4 py-2 rounded transition"
          >
            Apply
          </button>
          <button
            onClick={resetFilter}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}