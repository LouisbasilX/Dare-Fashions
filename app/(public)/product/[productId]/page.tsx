import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import AddToBasketButton from '@/components/products/AddToBasketButton'
import { formatCurrency } from '@/lib/utils'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Fetch product details
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error || !product) {
    notFound()
  }

  // Get current user and guest session
  const { data: { user } } = await supabase.auth.getUser()
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  let initialQuantity = 1
  let isInBasket = false

  // Only attempt to fetch basket if we have a user or guest session
  if (user || guestSessionId) {
    let basketQuery = supabase
      .from('baskets')
      .select('items:basket_items(product_id, quantity)')
      .eq('status', 'pending')

    if (user) {
      basketQuery = basketQuery.eq('customer_id', user.id)
    } else if (guestSessionId) {
      basketQuery = basketQuery.eq('guest_session_id', guestSessionId)
    }

    const { data: basket } = await basketQuery.maybeSingle()
    if (basket?.items) {
      const found = basket.items.find((item: any) => item.product_id === productId)
      if (found) {
        isInBasket = true
        initialQuantity = found.quantity
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 page-content">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/shop" className="hover:underline">Shop</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Media (unchanged) */}
        <div className="space-y-4">
          {product.image_url && (
            <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow">
              <Image
                src={product.image_url}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-auto object-contain rounded"
                priority
              />
            </div>
          )}

          {product.video_url && (
            <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Product Video</h3>
              <video
                src={product.video_url}
                controls
                className="w-full rounded"
                poster={product.image_url || undefined}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!product.image_url && !product.video_url && (
            <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow">
              <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No media available
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {formatCurrency(product.price)}
          </p>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              {product.description || 'No description provided.'}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Availability:</span>{' '}
              {product.available > 0 ? (
                <span className="text-green-600 dark:text-green-400">
                  In stock ({product.available} available)
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">Out of stock</span>
              )}
            </p>
          </div>

          <AddToBasketButton
            productId={product.id}
            maxAvailable={product.available}
            initialQuantity={initialQuantity}
            isInBasket={isInBasket}
          />
        </div>
      </div>
    </div>
  )
}