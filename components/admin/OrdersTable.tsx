'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { markOrdersDelivered } from '@/actions/admin'

interface Order {
  id: string
  customer_name: string | null
  phone: string | null
  state: string | null
  total: number
  paid_at: string
  delivered_at: string | null
  items: any[]
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === orders.length) {
      setSelected([])
    } else {
      setSelected(orders.map(o => o.id))
    }
  }

  const handleMarkDelivered = async () => {
    if (!confirm(`Mark ${selected.length} order(s) as delivered?`)) return
    setLoading(true)
    try {
      await markOrdersDelivered(selected)
      alert('Orders marked as delivered')
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
      {selected.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1e1e1e] rounded-lg shadow flex items-center justify-between border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selected.length} order(s) selected
          </span>
          <button
            onClick={handleMarkDelivered}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
          >
            {loading ? 'Updating...' : 'Mark as Delivered'}
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={selected.length === orders.length && orders.length > 0}
            onChange={toggleSelectAll}
            className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
          Select all
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const isSelected = selected.includes(order.id)
          return (
            <div
              key={order.id}
              className={`
                bg-white dark:bg-[#1e1e1e] rounded-lg shadow hover:shadow-md transition border
                ${order.delivered_at ? 'border-green-500' : 'border-yellow-500'}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(order.id)}
                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <Link href={`/admin/orders/${order.id}`} className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline">
                    #{order.id.slice(0, 8)}
                  </Link>
                </div>

                <Link href={`/admin/orders/${order.id}`} className="block">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {order.customer_name || 'Anonymous'}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {order.phone && <p>📞 {order.phone}</p>}
                    {order.state && <p>📍 {order.state}</p>}
                    <p>📦 {order.items.length} item(s)</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.delivered_at
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.delivered_at ? 'Delivered' : 'Pending'}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {orders.length === 0 && (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No orders found.</p>
      )}
    </div>
  )
}