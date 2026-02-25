

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import OrderCard from '@/components/orders/OrderCard'
import OrderFilter from '@/components/orders/OrderFilter'
import { Package } from 'lucide-react'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ delivered?: string }>
}) {
  const { delivered } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*')
    .order('paid_at', { ascending: false })

  if (delivered === 'true') {
    query = query.not('delivered_at', 'is', null)
  } else if (delivered === 'false') {
    query = query.is('delivered_at', null)
  }

  const { data: orders } = await query

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <Link
          href="/baskets"
          className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C4A030] text-gray-900 px-4 py-2 rounded-lg transition"
        >
          <Package className="w-4 h-4" />
          Back to Basket
        </Link>
      </div>

      <OrderFilter />

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-6">No orders yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#C4A030] text-gray-900 rounded-lg transition"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  )
}