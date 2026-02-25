'use client'

import { formatCurrency } from '@/lib/utils'
import { AlertCircle, ShoppingBag } from 'lucide-react'
import BasketItemList from './BasketItemList'
import BasketActions from './BasketActions'
import Link from 'next/link'

interface ActiveBasketProps {
  basket: any // ideally import your BasketWithItems type
}

export default function ActiveBasket({ basket }: ActiveBasketProps) {
  const isPaid = basket.status === 'paid'
  const isValid = basket.status !== 'invalid'
  const total = basket.items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.product.price,
    0
  )
  const hasItems = basket.items.length > 0

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Basket #{basket.id.slice(0, 8)}
          </h2>
          <span className={`px-3 py-1 rounded text-xs font-medium ${
            basket.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : basket.status === 'invalid'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {basket.status}
          </span>
        </div>

        {basket.status === 'invalid' && hasItems && (
          <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <AlertCircle className="inline w-4 h-4 mr-2" />
            Some items exceed available stock. Please adjust quantities below.
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!hasItems ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your basket is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Looks like you haven't added any items yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-gray-900 font-semibold px-6 py-3 rounded-lg transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <BasketItemList basket={basket} isEditable={!isPaid} />
        )}
      </div>

      {/* Footer (only shown when there are items) */}
      {hasItems && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#151515]">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Total:
            </span>
            <span className="text-2xl font-bold text-[var(--gold-dark)] dark:text-[var(--gold)]">
              {formatCurrency(total)}
            </span>
          </div>

          {!isPaid && (
            <div className="mt-4">
              <BasketActions basket={basket} total={total} isValid={isValid} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}