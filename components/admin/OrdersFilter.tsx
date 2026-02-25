'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { NIGERIAN_STATES } from '@/lib/constants'

export default function OrdersFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState(searchParams.get('state') || '')
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [delivered, setDelivered] = useState(searchParams.get('delivered') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (delivered) params.set('delivered', delivered)
    router.push(`/admin/orders?${params.toString()}`)
  }

  const resetFilters = () => {
    setState('')
    setFrom('')
    setTo('')
    setDelivered('')
    router.push('/admin/orders')
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">All States</option>
          {NIGERIAN_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        />

        <select
          value={delivered}
          onChange={(e) => setDelivered(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">All Orders</option>
          <option value="false">Pending Delivery</option>
          <option value="true">Delivered</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-(--gold-dark) hover:bg-(--gold) text-white px-4 py-2 rounded transition"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}