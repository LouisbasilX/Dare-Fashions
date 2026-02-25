import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function EmptyBasket() {
  return (
    <div className="text-center py-16 bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your basket is empty.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center px-6 py-3 bg-(--gold-dark) text-white rounded-lg hover:bg-(--gold) transition"
      >
        Start Shopping
      </Link>
    </div>
  )
}