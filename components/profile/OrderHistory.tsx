import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function OrderHistory({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">You have no orders yet.</p>
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/admin/orders/${order.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                Order #{order.id.slice(0, 8)}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(order.paid_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-300">{order.items.length} item(s)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Paid</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}