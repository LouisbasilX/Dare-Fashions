'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBasket } from '@/actions/basket'
import { Check } from 'lucide-react'

interface AddToBasketButtonProps {
  productId: string
  maxAvailable: number
  initialQuantity?: number
  isInBasket?: boolean
}

export default function AddToBasketButton({
  productId,
  maxAvailable,
  initialQuantity = 1,
  isInBasket = false,
}: AddToBasketButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  // Update quantity when initialQuantity changes (e.g., after login)
  useEffect(() => {
    setQuantity(initialQuantity)
  }, [initialQuantity])

  const handleAddToBasket = async () => {
    if (quantity > maxAvailable) {
      alert('Quantity exceeds available stock')
      return
    }
    setLoading(true)
    try {
      await createBasket(productId, quantity)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      // Optionally redirect or just stay
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel = isInBasket
    ? (showSuccess ? 'Updated!' : 'Update Basket')
    : (showSuccess ? 'Added!' : 'Add to Basket')

  return (
    <div className="flex items-center gap-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          max={maxAvailable}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          disabled={loading || maxAvailable === 0}
        />
      </div>
      <button
        onClick={handleAddToBasket}
        disabled={loading || maxAvailable === 0}
        className={`
          flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300
          flex items-center justify-center gap-2
          ${showSuccess
            ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
            : isInBasket
              ? 'bg-[#D4AF37] hover:bg-[#B8960F] text-gray-900'
              : 'bg-(--emerald-dark) hover:bg-[#5A1620] text-white'
          }
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transform hover:scale-105 active:scale-95
        `}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : showSuccess ? (
          <Check className="w-5 h-5" />
        ) : null}
        {buttonLabel}
      </button>
    </div>
  )
}