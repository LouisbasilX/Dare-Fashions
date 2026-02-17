import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './types'

function base64UrlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/')
}

export const createClient = async () => {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const allCookies = cookieStore.getAll()
  console.log('[ServerClient] All cookies:', allCookies.map(c => c.name))

  let accessToken: string | undefined
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

  const possibleNames = [
    projectRef ? `sb-${projectRef}-auth-token` : null,
    'sb-access-token',
    'supabase-auth-token',
  ].filter(Boolean) as string[]

  for (const name of possibleNames) {
    const cookie = cookieStore.get(name)
    if (!cookie) continue

    console.log(`[ServerClient] Found cookie: ${name}, value length: ${cookie.value.length}, first 50 chars: ${cookie.value.substring(0, 50)}`)
    let value = cookie.value

    // Check for "base64-" prefix and remove it
    if (value.startsWith('base64-')) {
      console.log('[ServerClient] Detected base64- prefix, stripping it')
      value = value.substring(7) // length of "base64-" is 7
    }

    // Try parsing as JSON first (if it's already JSON)
    try {
      const parsed = JSON.parse(value)
      console.log('[ServerClient] JSON parse succeeded, keys:', Object.keys(parsed))
      accessToken = parsed.access_token
      if (accessToken) {
        console.log('[ServerClient] Extracted access_token via JSON')
        break
      }
    } catch (e) {
      console.log('[ServerClient] JSON parse failed:', (e as Error).message)
      // Not JSON, try base64 decode
      try {
        const base64 = base64UrlToBase64(value)
        const jsonStr = atob(base64)
        const parsed = JSON.parse(jsonStr)
        console.log('[ServerClient] Base64 decode succeeded, parsed keys:', Object.keys(parsed))
        accessToken = parsed.access_token
        if (accessToken) {
          console.log('[ServerClient] Extracted access_token via base64')
          break
        }
      } catch (e2) {
        console.log('[ServerClient] Base64 decode also failed:', (e2 as Error).message)
      }
    }
  }

  if (!accessToken) {
    console.log('[ServerClient] No access token found in cookies')
  } else {
    console.log('[ServerClient] Access token obtained, length:', accessToken.length)
  }

  const options = accessToken
    ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    : {}

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, options)
}