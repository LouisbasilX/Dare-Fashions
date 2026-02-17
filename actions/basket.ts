// actions/basket.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { BasketInsert } from '@/lib/types'

// ------------------------------------------------------------------
// Create a new basket or add item to existing basket
// ------------------------------------------------------------------
export async function createBasket(productId: string, quantity: number) {
  const supabase = await createClient()

  // Get product details
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select('id, price, available')
    .eq('id', productId)
    .eq('deleted', false)
    .single()
  if (prodError || !product) throw new Error('Product not found')
  if (product.available < quantity) throw new Error('Not enough stock')

  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()

  // Guest session ID
  let guestSessionId = cookieStore.get('guest_session_id')?.value
  if (!guestSessionId && !user) {
    guestSessionId = crypto.randomUUID()
    cookieStore.set('guest_session_id', guestSessionId, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  // Get existing basket ID from cookie
  let basketId: string | null = cookieStore.get('basketId')?.value ?? null

  // Validate existing basket if any
  if (basketId) {
    const { data: existingBasket } = await supabase
      .from('baskets')
      .select('customer_id, guest_session_id, status')
      .eq('id', basketId)
      .single()

    if (existingBasket) {
      const belongsToCurrent =
        (user && existingBasket.customer_id === user.id) ||
        (!user && existingBasket.guest_session_id === guestSessionId)

      if (!belongsToCurrent) {
        // Basket belongs to another user – ignore it
        basketId = null
      } else if (existingBasket.status === 'paid') {
        // Basket is paid – we need a new one
        basketId = null
      }
    } else {
      // Basket not found (maybe deleted)
      basketId = null
    }
  }

  // Create new basket if needed
  if (!basketId) {
    const newBasket: BasketInsert = {
      status: 'pending',
      customer_id: user?.id || null,
      guest_session_id: guestSessionId || null,
    }

    const { data: basket, error: basketError } = await supabase
      .from('baskets')
      .insert(newBasket)
      .select('id')
      .single()
    if (basketError || !basket) {
      console.error('❌ Basket insert error details:', basketError)
      throw new Error(`Failed to create basket: ${basketError?.message || 'Unknown error'}`)
    }

    basketId = basket.id
    cookieStore.set('basketId', basketId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
  }

  // At this point, basketId is guaranteed to be a string
  if (!basketId) throw new Error('Basket ID missing after creation') // should never happen

  // Upsert basket item
  const { error: itemError } = await supabase
    .from('basket_items')
    .upsert(
      {
        basket_id: basketId,
        product_id: productId,
        quantity,
        price_at_time: product.price,
      },
      { onConflict: 'basket_id, product_id' }
    )
  if (itemError) throw itemError

  revalidatePath('/')
  revalidatePath(`/basket/${basketId}`)
  return { basketId }
}

// ------------------------------------------------------------------
// Update (or delete) an item in a basket
// ------------------------------------------------------------------
export async function updateBasketItem(basketId: string, productId: string, quantity: number) {
  const supabase = await createClient()

  if (quantity <= 0) {
    // Remove item
    await supabase
      .from('basket_items')
      .delete()
      .eq('basket_id', basketId)
      .eq('product_id', productId)
  } else {
    // Check availability
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('available, price')
      .eq('id', productId)
      .single()
    if (prodError || !product) throw new Error('Product not found')
    if (product.available < quantity) throw new Error('Not enough stock')

    await supabase
      .from('basket_items')
      .upsert(
        {
          basket_id: basketId,
          product_id: productId,
          quantity,
          price_at_time: product.price,
        },
        { onConflict: 'basket_id, product_id' }
      )
  }

  revalidatePath(`/basket/${basketId}`)
}

// ------------------------------------------------------------------
// Update basket with customer details (name, phone, state, note)
// ------------------------------------------------------------------
export async function updateBasketDetails(
  basketId: string,
  details: {
    customer_name: string
    phone: string
    state: string
    delivery_note?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('baskets')
    .update({
      customer_name: details.customer_name,
      phone: details.phone,
      state: details.state,
      delivery_note: details.delivery_note || null,
    })
    .eq('id', basketId)

  if (error) throw new Error('Failed to save customer details')
  revalidatePath(`/basket/${basketId}`)
}

// ------------------------------------------------------------------
// Get all active baskets (pending/invalid) for the current user/guest
// ------------------------------------------------------------------
export async function getUserBaskets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  let query = supabase
    .from('baskets')
    .select(`
      id,
      created_at,
      status,
      customer_name,
      phone,
      state,
      items:basket_items(
        quantity,
        price_at_time,
        product:products(name, price)
      )
    `)
    .in('status', ['pending', 'invalid'])
    .order('created_at', { ascending: false })

  if (user) {
    query = query.eq('customer_id', user.id)
  } else if (guestSessionId) {
    query = query.eq('guest_session_id', guestSessionId)
  } else {
    return []
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Get count of pending baskets for current session (for basket icon)
// ------------------------------------------------------------------
export async function getPendingBasketCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  let query = supabase
    .from('baskets')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  if (user) {
    query = query.eq('customer_id', user.id)
  } else if (guestSessionId) {
    query = query.eq('guest_session_id', guestSessionId)
  } else {
    return 0
  }

  const { count, error } = await query
  if (error) throw error
  return count || 0
}

// ------------------------------------------------------------------
// Get past orders for the current user/guest
// ------------------------------------------------------------------
export async function getUserOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('paid_at', { ascending: false })

  if (user) {
    query = query.eq('customer_id', user.id)
  } else if (guestSessionId) {
    // For guests, find orders via original_basket_id -> baskets
    const { data: guestBaskets } = await supabase
      .from('baskets')
      .select('id')
      .eq('guest_session_id', guestSessionId)
    const basketIds = guestBaskets?.map(b => b.id) || []
    if (basketIds.length === 0) return []
    query = query.in('original_basket_id', basketIds)
  } else {
    return []
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Link guest baskets to a newly registered user (call after signup)
// ------------------------------------------------------------------
export async function linkGuestBasketsToUser(userId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const guestSessionId = cookieStore.get('guest_session_id')?.value

  if (!guestSessionId) return

  // Transfer all baskets with this guest_session_id to the user
  const { error } = await supabase
    .from('baskets')
    .update({ customer_id: userId, guest_session_id: null })
    .eq('guest_session_id', guestSessionId)

  if (error) throw error

  // Clear the guest session cookie
  cookieStore.set('guest_session_id', '', { maxAge: 0, path: '/' })
}