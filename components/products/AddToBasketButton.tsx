'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBasket } from '@/actions/basket'

export default function AddToBasketButton({
  productId,
  maxAvailable,
}: {
  productId: string
  maxAvailable: number
}) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddToBasket = async () => {
    if (quantity > maxAvailable) {
      alert('Quantity exceeds available stock')
      return
    }
    setLoading(true)
    try {
      const { basketId } = await createBasket(productId, quantity)
      router.push(`/basket/${basketId}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          max={maxAvailable}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20 border rounded px-3 py-2"
          disabled={maxAvailable === 0}
        />
      </div>
      <button
        onClick={handleAddToBasket}
        disabled={loading || maxAvailable === 0}
        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Adding...' : maxAvailable > 0 ? 'Add to Basket' : 'Out of Stock'}
      </button>
    </div>
  )
}