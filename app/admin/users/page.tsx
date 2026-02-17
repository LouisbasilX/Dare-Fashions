import { createAdminClient } from '@/lib/supabase/admin'
import UserCardList from '@/components/admin/UserCardList'

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  // 1. Fetch all customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, role, name, phone, state, created_at')
    .order('created_at', { ascending: false })

  if (customersError) {
    console.error('Error fetching customers:', customersError)
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-red-500">Failed to load users. Please check console.</p>
      </div>
    )
  }

  // 2. Fetch all auth users (using admin API)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-red-500">Failed to load users. Please check console.</p>
      </div>
    )
  }

  // 3. Combine: attach email to each customer
  const users = customers?.map(customer => {
    const authUser = authUsers.users.find(u => u.id === customer.id)
    return {
      ...customer,
      email: authUser?.email || 'Unknown',
    }
  }) || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Manage Users</h1>
      <UserCardList users={users} />
    </div>
  )
}