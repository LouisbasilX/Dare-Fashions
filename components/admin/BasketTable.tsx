'use client'

import { BasketWithItems } from '@/lib/types'
import { markBasketsPaid } from '@/actions/admin' // ✅ removed assignBasketsToDelivery import
import { useState } from 'react'
import Link from 'next/link'

export function BasketTable({ baskets }: { baskets: BasketWithItems[] }) {
  const [selected, setSelected] = useState<string[]>([])

  const handleMarkPaid = async () => {
    if (!confirm('Mark selected baskets as paid? This will reduce available stock.')) return
    try {
      await markBasketsPaid(selected)
      alert('Baskets marked paid')
      setSelected([])
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-4 items-center">
        <button
          onClick={handleMarkPaid}
          disabled={selected.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Mark Paid
        </button>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            {/* Checkbox column */}
            <th className="p-2 border">
              <input
                type="checkbox"
                onChange={(e) =>
                  setSelected(e.target.checked ? baskets.map((b) => b.id) : [])
                }
              />
            </th>
            {/* ID column */}
            <th className="p-2 border">ID</th>
            {/* Customer column */}
            <th className="p-2 border">Customer</th>
            {/* State column */}
            <th className="p-2 border">State</th>
            {/* Status column */}
            <th className="p-2 border">Status</th>
            {/* Items column */}
            <th className="p-2 border">Items</th>
            {/* Total column */}
            <th className="p-2 border">Total</th>
            {/* Actions column */}
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {baskets.map((basket) => {
            const total = basket.items.reduce(
              (sum, item) => sum + item.quantity * item.product.price,
              0
            )
            return (
              <tr key={basket.id} className={basket.status === 'invalid' ? 'bg-red-50' : ''}>
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selected.includes(basket.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelected([...selected, basket.id])
                      else setSelected(selected.filter((id) => id !== basket.id))
                    }}
                  />
                </td>
                <td className="p-2 border font-mono text-xs">{basket.id.slice(0, 8)}</td>
                <td className="p-2 border">{basket.customer_name || '-'}</td>
                <td className="p-2 border">{basket.state || '-'}</td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      basket.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : basket.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : basket.status === 'invalid'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {basket.status}
                  </span>
                </td>
                <td className="p-2 border">{basket.items.length}</td>
                <td className="p-2 border">₦{total}</td>
                <td className="p-2 border">
                  <Link
                    href={`/admin/baskets/${basket.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}