import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { Database } from './types'

export async function updateSession(request: NextRequest) {
  console.log('[Proxy] Path:', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[Proxy] User:', user?.email ?? 'none', 'Error:', error?.message ?? 'none')

  // Protect admin routes – EXCEPT the login page itself
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (!user && isAdminRoute && !isLoginPage) {
    console.log('[Proxy] No user, redirecting to /admin/login')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return supabaseResponse
}