'use client'

import { BasketWithItems } from '@/lib/types'
import { updateBasketItem } from '@/actions/basket'
import Image from 'next/image'
import { useState } from 'react'
import { getVideoThumbnailUrl } from '@/lib/cloudinary-helpers'
import { Trash2 } from 'lucide-react'

export default function BasketItemList({
  basket,
  isEditable,
}: {
  basket: BasketWithItems
  isEditable: boolean
}) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleUpdate = async (productId: string, quantity: number) => {
    setUpdating(productId)
    try {
      await updateBasketItem(basket.id, productId, quantity)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      {basket.items.map((item) => {
        const invalid = item.quantity > item.product.available
        const imageSrc = item.product.image_url || getVideoThumbnailUrl(item.product.video_url)
        return (
          <div
            key={item.id}
            className={`border rounded p-4 flex gap-4 ${
              invalid 
                ? 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700' 
                : 'bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700'
            }`}
          >
            {imageSrc && (
              <Image
                src={imageSrc}
                alt={item.product.name}
                width={80}
                height={80}
                className="rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Price: ₦{item.product.price}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Ordered: {item.quantity}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Available: {item.product.available}
              </p>
              {invalid && item.product.available > 0 && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  ⚠️ Only {item.product.available} available
                </p>
              )}
              {invalid && item.product.available === 0 && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  ⚠️ Sold Out – Please set quantity to zero
                </p>
              )}
            </div>
            {isEditable && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={item.product.available + item.quantity}
                  defaultValue={item.quantity}
                  className="w-16 border rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  onBlur={(e) => {
                    const newQty = parseInt(e.target.value)
                    if (newQty !== item.quantity) {
                      handleUpdate(item.product.id, newQty)
                    }
                  }}
                  disabled={updating === item.product.id}
                />
                <button
                  onClick={() => handleUpdate(item.product.id, 0)}
                  disabled={updating === item.product.id}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}