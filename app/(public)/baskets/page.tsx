import { getUserBaskets, getUserOrders } from '@/actions/basket'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { ShoppingBag, Package, AlertCircle, CheckCircle } from 'lucide-react'

export default async function BasketsPage() {
  const baskets = await getUserBaskets()
  const orders = await getUserOrders()

  const pending = baskets?.filter(b => b.status === 'pending') || []
  const invalid = baskets?.filter(b => b.status === 'invalid') || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Your Baskets
      </h1>

      {pending.length === 0 && invalid.length === 0 && orders.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have no baskets yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Pending Baskets */}
      {pending.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-600 dark:text-yellow-500">
            <Package className="w-5 h-5 mr-2" />
            Pending ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pending.map(basket => (
              <BasketCard key={basket.id} basket={basket} status="pending" />
            ))}
          </div>
        </section>
      )}

      {/* Invalid Baskets */}
      {invalid.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600 dark:text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            Invalid ({invalid.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invalid.map(basket => (
              <BasketCard key={basket.id} basket={basket} status="invalid" />
            ))}
          </div>
        </section>
      )}

      {/* Past Orders */}
      {orders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-green-600 dark:text-green-500">
            <CheckCircle className="w-5 h-5 mr-2" />
            Past Orders ({orders.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BasketCard({ basket, status }: { basket: any; status: string }) {
  const total = basket.items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.product.price,
    0
  )

  const statusColors = {
    pending: 'border-yellow-500 dark:border-yellow-600',
    invalid: 'border-red-500 dark:border-red-600',
  }

  return (
    <Link
      href={`/basket/${basket.id}`}
      className={`block bg-white dark:bg-[#1e1e1e] rounded-lg shadow hover:shadow-md transition border-l-4 ${
        statusColors[status as keyof typeof statusColors]
      } p-6`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(basket.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
            #{basket.id.slice(0, 8)}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${
          status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {status}
        </span>
      </div>

      <p className="font-medium text-gray-900 dark:text-white mb-2">
        {basket.items.length} item(s)
      </p>

      {basket.customer_name && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {basket.customer_name}
        </p>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(total)}
        </span>
        <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  )
}

function OrderCard({ order }: { order: any }) {
  const total = order.total || order.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
  const isDelivered = order.delivered_at !== null

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.paid_at).toLocaleDateString()}
          </p>
          <p className="font-medium text-gray-900 dark:text-white mt-1">
            {order.items.length} item(s)
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.customer_name || 'Not provided'}
          </p>
          {isDelivered && order.delivered_at && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Delivered on {new Date(order.delivered_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</p>
          <p className={`text-sm ${
            isDelivered
              ? 'text-green-600 dark:text-green-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {isDelivered ? 'Delivered' : 'Paid'}
          </p>
        </div>
      </div>
    </div>
  )
}