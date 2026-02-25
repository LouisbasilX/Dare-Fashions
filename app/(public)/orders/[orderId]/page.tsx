import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { getVideoThumbnailUrl } from '@/lib/cloudinary-helpers'
import { ArrowLeft } from 'lucide-react'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('guest_session_id')?.value
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch order first
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    notFound()
  }

  // Check ownership
  const isOwner =
    (user && order.customer_id === user.id) ||
    (!user && guestSessionId && order.guest_session_id === guestSessionId)

  if (!isOwner) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/orders"
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Order #{orderId.slice(0, 8)}
      </h1>

      {/* Order Summary Card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
            <p className="text-gray-900 dark:text-white">{new Date(order.paid_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
              order.delivered_at
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {order.delivered_at ? 'Delivered' : 'Pending'}
            </span>
          </div>
          {order.delivered_at && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered At</p>
              <p className="text-gray-900 dark:text-white">{new Date(order.delivered_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Items</h2>
        <div className="space-y-4">
          {order.items.map((item: any) => {
            const imageSrc = item.image_url || getVideoThumbnailUrl(item.video_url)
            return (
              <div key={item.id} className="flex gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                {imageSrc && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image src={imageSrc} alt={item.product_name} fill className="object-cover rounded" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.product_name}</h3>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit Price: {formatCurrency(item.price_at_time)}</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      Subtotal: {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            Total: {formatCurrency(order.total)}
          </p>
        </div>
      </div>
    </div>
  )
}