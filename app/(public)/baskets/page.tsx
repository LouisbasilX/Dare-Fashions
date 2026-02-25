import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Package, ArrowRight, ArrowLeft } from 'lucide-react'
import ActiveBasket from '@/components/basket/ActiveBasket'
import EmptyBasket from '@/components/basket/Emptybasket'

export default async function BasketsPage() {
  const cookieStore = await cookies()
  const userBasketId = cookieStore.get('basketId')?.value
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let basket = null

  if (user) {
    // Get the most recent pending or invalid basket for this user
    const { data: userBasket } = await supabase
      .from('baskets')
      .select(`
        *,
        items:basket_items(
          *,
          product:products(*)
        )
      `)
      .eq('customer_id', user.id)
      .in('status', ['pending', 'invalid'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() // use maybeSingle to avoid error when none found

    if (userBasket) basket = userBasket
  }

  if (!basket && guestSessionId) {
    const { data: guestBasket } = await supabase
      .from('baskets')
      .select(`
        *,
        items:basket_items(
          *,
          product:products(*)
        )
      `)
      .eq('guest_session_id', guestSessionId)
      .in('status', ['pending', 'invalid'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    basket = guestBasket
  }

  if (!basket && userBasketId) {
    const { data: cookieBasket } = await supabase
      .from('baskets')
      .select(`
        *,
        items:basket_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', userBasketId)
      .in('status', ['pending', 'invalid'])
      .maybeSingle()

    basket = cookieBasket
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
    <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--burgundy)] dark:hover:text-[var(--burgundy-light)] transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Basket
        </h1>
     <Link
  href="/orders"
  className="inline-flex items-center gap-2 bg-(--gold) hover:bg-(--gold) text-gray-900 px-4 py-2 rounded-lg transition"
>
  <Package className="w-4 h-4" />
  Past Orders
  <ArrowRight className="w-4 h-4" />
</Link>
</div>

      {!basket ? (
        <EmptyBasket />
      ) : (
        <ActiveBasket basket={basket} />
      )}
    </div>
  )
}