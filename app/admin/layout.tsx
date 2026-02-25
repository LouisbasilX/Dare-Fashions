import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import Header from '@/components/layout/Header'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  
  // ✅ getClaims() works locally with asymmetric keys, getUser() may fail
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/login')
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', data.claims.sub)  // sub = user ID
    .single()

  if (!customer || customer.role !== 'admin') {
    redirect('/shop')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />
      <AdminNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}