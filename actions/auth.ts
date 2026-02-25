'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  console.log('[Logout] Starting logout')
  
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    console.log('[Logout] SignOut completed')

    const cookieStore = await cookies()
    
    // Clear custom cookies
    cookieStore.delete('basketId')
    cookieStore.delete('guest_session_id')
    console.log('[Logout] Deleted custom cookies')

    // Clear Supabase auth cookie
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]
    if (projectRef) {
      const authCookieName = `sb-${projectRef}-auth-token`
      cookieStore.delete(authCookieName)
      console.log('[Logout] Deleted auth cookie:', authCookieName)
    }

    console.log('[Logout] Redirecting to /')
  } catch (error) {
    console.error('[Logout] Error:', error)
  }

  redirect('/shop')
}