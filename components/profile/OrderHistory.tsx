import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function OrderHistory({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-gray-500">You have no orders yet.</p>
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                Order #{order.id.slice(0, 8)}
              </Link>
              <p className="text-sm text-gray-600">
                {new Date(order.paid_at).toLocaleDateString()}
              </p>
              <p className="text-sm">{order.items.length} item(s)</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(order.total)}</p>
              <p className="text-xs text-green-600">Paid</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}