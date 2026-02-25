// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'  // ← SSR package, not supabase-js
import { cookies } from 'next/headers'
import { Database } from './types'

export const createClient = async (sessionIdOverride?: string) => {
  const cookieStore = await cookies()
  const guestSessionId = sessionIdOverride || cookieStore.get('guest_session_id')?.value

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
      // ✅ Preserve guest session header if present
      global: {
        headers: guestSessionId
          ? { 'x-guest-session-id': guestSessionId }
          : {},
      },
    }
  )

  return client
}