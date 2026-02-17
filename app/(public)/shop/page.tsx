import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import ProductSearch from '@/components/products/ProductSearch'
import Link from 'next/link'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
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

  let query = supabase.from('products').select('*').order('name')
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  const { data: products } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            RP Apparels
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Discover premium fashion for the modern individual
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
  <Link
    href="/baskets"
    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center w-full sm:w-auto"
  >
    View My Baskets
  </Link>
  {isAdmin && (
    <Link
      href="/admin"
      className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition text-center w-full sm:w-auto"
    >
      Admin Dashboard
    </Link>
  )}
</div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-8">
        <ProductSearch />
      </section>

      {/* Products Grid - Bento Style */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}