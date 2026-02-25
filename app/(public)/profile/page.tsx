import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import OrderHistory from '@/components/profile/OrderHistory'


export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer details
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', user.id)
    .order('paid_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            My Profile
          </h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Shipping Details
              </h2>
              <ProfileForm customer={customer} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Order History
              </h2>
              <OrderHistory orders={orders || []} />
            </div>
          </div>
        </div>
      </main>
    
    </div>
  )
}