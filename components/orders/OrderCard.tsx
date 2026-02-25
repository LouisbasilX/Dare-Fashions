import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  total: number
  paid_at: string
  delivered_at: string | null
}

export default function OrderCard({ order }: { order: Order }) {
  const isDelivered = order.delivered_at !== null

  return (
    <Link href={`/orders/${order.id}`} className="block">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(order.paid_at).toLocaleDateString()}
            </p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              Order #{order.id.slice(0, 8)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.total)}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded text-xs font-medium ${
                isDelivered
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {isDelivered ? 'Delivered' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}