import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import ProductSearchAndFilters from '@/components/products/ProductSearchAndFilters' // 👈 new combined component
import { isProductNew } from '@/lib/utils'
import Link from 'next/link'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sex?: string; sort?: string; new?: string}>
}) {
  const { q, sex, sort, new: newProducts} = await searchParams
  const supabase = await createClient()

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

  // Build query
  let query = supabase
    .from('products')
    .select('*')
    .eq('deleted', false) // exclude deleted products

    
  // Apply search filter
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Apply sex filter if valid
  if (sex && ['men', 'women', 'unisex'].includes(sex)) {
    query = query.eq('sex', sex)
  }

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    // Default sort by name
    query = query.order('name')
  }



  const { data: products } = await query

    // Filter new arrivals if ?new=true
  const filteredProducts = newProducts === 'true'
    ? products?.filter(p => isProductNew(p.created_at))
    : products
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section (unchanged) */}
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}