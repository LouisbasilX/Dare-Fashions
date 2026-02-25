'use client'

import { Product } from '@/lib/types'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createBasket } from '@/actions/basket'
import { ShoppingCart, Eye } from 'lucide-react'
import { isProductNew } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToBasket = async () => {
    setLoading(true)
    try {
      await createBasket(product.id, quantity)
      alert('Added to basket!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="card group relative overflow-hidden rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] dark:hover:border-[#E3B347] transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.image_url ? (
          // Show image if available
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : product.video_url ? (
          // Show video if no image but video exists
          <video
            src={product.video_url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Quick View Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Eye className="w-8 h-8 text-white" />
        </div>
        
        {/* New Badge */}
        {isProductNew(product.created_at) && (
          <div className="absolute top-2 left-2 bg-[#7A1E2C] text-white text-xs font-bold px-2 py-1 rounded z-10">
            NEW
          </div>
        )}

        {/* Availability Badge */}
        {product.available <= 5 && product.available > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            Only {product.available} left!
          </div>
        )}
        {product.available === 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white hover:text-[#D4AF37] dark:hover:text-[#E3B347] transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₦{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {product.available} avail.
            </span>
          </div>

          <button
            onClick={handleAddToBasket}
            disabled={loading || product.available === 0}
            className="bg-[#D4AF37] hover:bg-[#B8960F] disabled:bg-gray-400 text-white p-3 rounded-full transition-all transform hover:scale-110 disabled:hover:scale-100"
            title="Add to basket"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}