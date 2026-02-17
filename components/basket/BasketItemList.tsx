'use client'

import { BasketWithItems } from '@/lib/types'
import { updateBasketItem } from '@/actions/basket'
import Image from 'next/image'
import { useState } from 'react'

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
        return (
          <div
            key={item.id}
            className={`border rounded p-4 flex gap-4 ${invalid ? 'bg-red-50 border-red-300' : ''}`}
          >
            {item.product.image_url && (
              <Image
                src={item.product.image_url}
                alt={item.product.name}
                width={80}
                height={80}
                className="rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-sm text-gray-600">Price: ₦{item.product.price}</p>
              <p className="text-sm">Ordered: {item.quantity}</p>
              <p className="text-sm">Available: {item.product.available}</p>
              {invalid && (
                <p className="text-red-600 text-sm">⚠️ Only {item.product.available} available</p>
              )}
            </div>
            {isEditable && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={item.product.available + item.quantity}
                  defaultValue={item.quantity}
                  className="w-16 border rounded px-2 py-1"
                  onBlur={(e) => {
                    const newQty = parseInt(e.target.value)
                    if (newQty !== item.quantity) {
                      handleUpdate(item.product.id, newQty)
                    }
                  }}
                  disabled={updating === item.product.id}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}