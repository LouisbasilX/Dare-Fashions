'use server'

import { createClient } from '@/lib/supabase/server'

export async function vectorSearch(query: string) {
  const supabase = await createClient()

  const { data, error: embedError } = await supabase.functions.invoke('smooth-action', {
    body: { query },
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
  })

  if (embedError) throw embedError

  const queryEmbedding: number[] = data.embedding
  const embeddingString = `[${queryEmbedding.join(',')}]`

  const { data: matches, error } = await supabase.rpc('match_products', {
    query_embedding: embeddingString,
    match_threshold: 0.5,
  })

  if (error) throw error

  const matchList = matches as { id: string; similarity: number }[] | null
  if (!matchList || matchList.length === 0) return []

  const ids = matchList.map(m => m.id)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)

  const simMap = new Map(matchList.map(m => [m.id, m.similarity]))

  return (products ?? [])
    .sort((a, b) => (simMap.get(b.id) ?? 0) - (simMap.get(a.id) ?? 0))
    .map(p => ({ ...p, _similarity: simMap.get(p.id) ?? 0 }))
}