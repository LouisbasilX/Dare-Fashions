import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import ProductCard from '@/components/products/ProductCard'
import ProductSearchAndFilters from '@/components/products/ProductSearchAndFilters'
import { isProductNew } from '@/lib/utils'
import Link from 'next/link'
import { Product } from '@/lib/types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sex?: string; sort?: string; new?: string; minPrice?: string; maxPrice?: string }>
}) {
  const { q, sex, sort, new: newProducts, minPrice, maxPrice } = await searchParams
  const supabase = await createClient()
  const cookieStore = await cookies()

  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = customer?.role === 'admin'
  }

  // ─────────────────────────────────────────────────────────
  // 1. Fetch the user's current pending basket (if any)
  //    to determine which products are already in it.
  // ─────────────────────────────────────────────────────────
  const guestSessionId = cookieStore.get('guest_session_id')?.value
  let basketProductIds = new Set<string>()

  if (user) {
    const { data: basket } = await supabase
      .from('baskets')
      .select('items:basket_items(product_id)')
      .eq('customer_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()
    if (basket?.items) {
      basketProductIds = new Set(basket.items.map((item: any) => item.product_id))
    }
  } else if (guestSessionId) {
    const { data: basket } = await supabase
      .from('baskets')
      .select('items:basket_items(product_id)')
      .eq('guest_session_id', guestSessionId)
      .eq('status', 'pending')
      .maybeSingle()
    if (basket?.items) {
      basketProductIds = new Set(basket.items.map((item: any) => item.product_id))
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. Build product query (unchanged)
  // ─────────────────────────────────────────────────────────
  let query = supabase
    .from('products')
    .select('*')
    .eq('deleted', false)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  if (sex && ['men', 'women', 'unisex'].includes(sex)) {
    query = query.eq('sex', sex)
  }
  if (minPrice) {
    query = query.gte('price', parseInt(minPrice))
  }
  if (maxPrice) {
    query = query.lte('price', parseInt(maxPrice))
  }

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('price', { ascending: false })
    query = query.order('created_at', { ascending: false })
  }

  let { data: products } = await query

  // Custom sort when no explicit sort is selected (unchanged)
  if (!sort) {
    const female = products?.filter(p => p.sex === 'women') ?? []
    const male = products?.filter(p => p.sex === 'men') ?? []
    const unisex = products?.filter(p => p.sex === 'unisex') ?? []

    const part = (items: Product[], half: 0 | 1) =>
      half === 0
        ? items.slice(0, Math.floor(items.length / 2)) || []
        : items.slice(Math.floor(items.length / 2)) || []

    products = [
      ...part(female, 0),
      ...part(male, 0),
      ...part(female, 1),
      ...part(male, 1),
      ...unisex,
    ]
  }

  // Filter new arrivals if needed
  const filteredProducts = newProducts === 'true'
    ? products?.filter(p => isProductNew(p.created_at))
    : products

  // ─────────────────────────────────────────────────────────
  // 3. Render the page (unchanged, except passing isInBasket)
  // ─────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 page-content">
  <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#7A1E2C] rounded-2xl p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            RP Apparels
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Fashion in Vogue
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/baskets"
              className="bg-white text-[#7A1E2C] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center w-full sm:w-auto"
            >
              View My Basket
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-[#7A1E2C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5A1620] transition text-center w-full sm:w-auto"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Combined Search & Filters */}
      <section className="mb-8">
        <ProductSearchAndFilters />
      </section>

      {/* Products Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInBasket={basketProductIds.has(product.id)}
            />
          ))}
        </div>
      </section>
    </div>
   </div>
    
  )
}