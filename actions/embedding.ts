'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProductEmbedding(productId: string, keywords: any) {
  const text = [
    ...(keywords.colors     || []),
    ...(keywords.materials  || []),
    ...(keywords.patterns   || []),
    ...(keywords.categories || []),
    ...(keywords.occasions  || []),
  ].join(' ')

  if (!text) return

  const supabase = await createClient()

  const { error } = await supabase.functions.invoke('hyper-responder', {
    body: { productId, keywords },
  })

  if (error) throw error
}