import ProductCard from '@/components/products/ProductCard'

export default function FeaturedCollection({ products }: { products: any[] }) {
  return (
    <section className="py-16 bg-white dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Best Sellers</h2>
        <p className="section-subtitle text-center">Customer favourites you can't go wrong with.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}