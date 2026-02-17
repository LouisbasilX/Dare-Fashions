'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BasketWithItems } from '@/lib/types'
import { markBasketsPaid } from '@/actions/admin'
import { formatCurrency } from '@/lib/utils'

export function BasketCardList({ baskets }: { baskets: BasketWithItems[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === baskets.length) {
      setSelected([])
    } else {
      setSelected(baskets.map(b => b.id))
    }
  }

  const handleMarkPaid = async () => {
    if (!confirm('Mark selected baskets as paid? This will reduce available stock.')) return
    setLoading(true)
    try {
      await markBasketsPaid(selected)
      alert('Baskets marked paid')
      setSelected([])
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1e1e1e] rounded-lg shadow flex items-center justify-between border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selected.length} basket(s) selected
          </span>
          <button
            onClick={handleMarkPaid}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Mark Paid'}
          </button>
        </div>
      )}

      {/* Select All */}
      <div className="mb-4 flex items-center">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={selected.length === baskets.length && baskets.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
          Select all
        </label>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {baskets.map((basket) => {
          const total = basket.items.reduce(
            (sum, item) => sum + item.quantity * item.product.price,
            0
          )
          const isSelected = selected.includes(basket.id)

          return (
            <div
              key={basket.id}
              className={`
                bg-white dark:bg-[#1e1e1e] rounded-lg shadow hover:shadow-md transition border-l-4
                ${basket.status === 'paid' ? 'border-green-500' :
                  basket.status === 'invalid' ? 'border-red-500' : 'border-yellow-500'}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(basket.id)}
                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    #{basket.id.slice(0, 8)}
                  </span>
                </div>

                <Link href={`/admin/baskets/${basket.id}`} className="block">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {basket.customer_name || 'Anonymous'}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {basket.phone && <p>📞 {basket.phone}</p>}
                    {basket.state && <p>📍 {basket.state}</p>}
                    <p>📦 {basket.items.length} item(s)</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      basket.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      basket.status === 'invalid' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {basket.status}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {baskets.length === 0 && (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No baskets found.</p>
      )}
    </div>
  )
}