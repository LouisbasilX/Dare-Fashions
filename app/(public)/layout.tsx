'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Get guest session ID from cookies
    const cookies = document.cookie.split('; ').find(row => row.startsWith('guest_session_id='))
    const guestId = cookies?.split('=')[1] || null
    setGuestSessionId(guestId)

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, supabase])

  // Realtime subscription for baskets
  useEffect(() => {
    if (!user && !guestSessionId) return

    const filter = user
      ? `customer_id=eq.${user.id}`
      : `guest_session_id=eq.${guestSessionId}`

    const basketChannel = supabase
      .channel('basket-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'baskets',
          filter,
        },
        (payload) => {
          if (payload.new.status === 'paid') {
            toast.success(`Basket #${payload.new.id.slice(0, 8)} has been paid!`, {
              duration: 5000,
            })
            router.refresh()
          } else if (payload.new.status === 'invalid') {
            toast.error(`Basket #${payload.new.id.slice(0, 8)} is now invalid – please review.`, {
              duration: 5000,
            })
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(basketChannel)
    }
  }, [user, guestSessionId, router, supabase])

  // Realtime subscription for orders (delivered status)
  useEffect(() => {
    if (!user && !guestSessionId) return

    const setupOrderSubscription = async () => {
      let orderFilter = ''

      if (user) {
        orderFilter = `customer_id=eq.${user.id}`
      } else if (guestSessionId) {
        // Get all baskets for this guest
        const { data: baskets } = await supabase
          .from('baskets')
          .select('id')
          .eq('guest_session_id', guestSessionId)
        const basketIds = baskets?.map(b => b.id) || []
        if (basketIds.length === 0) return
        // Use IN filter for realtime
        orderFilter = `original_basket_id=in.(${basketIds.join(',')})`
      }

      if (!orderFilter) return

      const orderChannel = supabase
        .channel('order-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: orderFilter,
          },
          (payload) => {
            if (payload.new.delivered_at && !payload.old.delivered_at) {
              toast.success(`Order #${payload.new.id.slice(0, 8)} has been delivered!`, {
                duration: 5000,
              })
              router.refresh()
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(orderChannel)
      }
    }

    const cleanup = setupOrderSubscription()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [user, guestSessionId, router, supabase])

  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster position="top-right" />
      <ScrollToTopButton />
      <Footer />
      
    </>
  )
}