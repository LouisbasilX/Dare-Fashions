import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import BasketItemList from '@/components/basket/BasketItemList'
import BasketActions from '@/components/basket/BasketActions'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ basketId: string }>
  searchParams: Promise<{ guestId?: string; customerId?: string }>
}

export default async function ReviveBasketPage({ params, searchParams }: Props) {
  const { basketId } = await params
  const { guestId, customerId } = await searchParams

// Use whichever identifier is present
const identifier = guestId || customerId
const supabase = await createClient(identifier)

  const { data: { user } } = await supabase.auth.getUser()

  const { data: basket, error } = await supabase
    .from('baskets')
    .select(`
      *,
      items:basket_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', basketId)
    .single()

  if (error || !basket) notFound()


  const isValid = basket.status !== 'invalid'
  const isPaid = basket.status === 'paid'
  const total = basket.items.reduce((sum: number, item: any) =>
    sum + item.quantity * item.product.price, 0
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/baskets" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Baskets
      </Link>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Basket #{basketId.slice(0, 8)}
          </h1>

          <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg">
            🔁 You are viewing a shared basket link. Add items to your cart or proceed to checkout.
          </div>

          {isPaid && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              ✅ This basket has been paid. Thank you! You can no longer edit it.
            </div>
          )}

          {!isValid && !isPaid && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              ⚠️ Some items exceed available stock. Please adjust quantities below.
            </div>
          )}
        </div>

        <div className="p-6">
          <BasketItemList basket={basket} isEditable={!isPaid} />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#151515]">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Total:</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(total)}
            </span>
          </div>
          {!isPaid && (
            <div className="mt-4">
              <BasketActions basket={basket} total={total} isValid={isValid} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}