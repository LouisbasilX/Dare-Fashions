'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { softDeleteProduct } from '@/actions/admin'

export function ProductCardList({ products }: { products: Product[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This will invalidate any pending baskets.`)) return
    setDeletingId(productId)
    try {
      await softDeleteProduct(productId)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow hover:shadow-md transition border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <Link href={`/product/${product.id}`} className="block aspect-square bg-gray-100 dark:bg-gray-800 relative">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                No image
              </div>
            )}
            {product.deleted && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-white font-bold">Deleted</span>
              </div>
            )}
          </Link>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Stock: {product.stock} / Avail: {product.available}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition"
              >
                Edit
              </Link>
              {!product.deleted && (
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
                >
                  {deletingId === product.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}