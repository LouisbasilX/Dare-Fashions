'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole, sendPasswordReset } from '@/actions/admin'
import { formatDate } from '@/lib/utils'
import { UserCog, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'

interface User {
  id: string
  email: string
  role: string
  name: string | null
  phone: string | null
  state: string | null
  created_at: string
}

export default function UserCardList({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleChange = async () => {
    if (!editingUser || !newRole) return
    setLoading(true)
    try {
      await updateUserRole(editingUser.id, newRole)
      alert('Role updated successfully')
      setEditingUser(null)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (email: string) => {
    setResetLoading(email)
    try {
      await sendPasswordReset(email)
      alert(`Password reset email sent to ${email}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setResetLoading(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`
              bg-white dark:bg-[#1e1e1e] rounded-lg shadow hover:shadow-md transition border-l-4
              ${user.role === 'admin' ? 'border-purple-500' : 'border-gray-400'}
            `}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {user.id.slice(0, 8)}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {user.role}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 break-all">
                {user.email}
              </h3>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {user.name && (
                  <p className="flex items-center gap-1">
                    <UserCog className="w-3.5 h-3.5" />
                    {user.name}
                  </p>
                )}
                {user.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </p>
                )}
                {user.state && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.state}
                  </p>
                )}
                <p className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDate(user.created_at)}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingUser(user)
                    setNewRole(user.role)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded transition"
                >
                  Edit Role
                </button>
                <button
                  onClick={() => handlePasswordReset(user.email)}
                  disabled={resetLoading === user.email}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm py-1.5 rounded transition"
                >
                  {resetLoading === user.email ? 'Sending...' : 'Reset PW'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No users found.</p>
      )}

      {/* Role Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Change Role for {editingUser.email}
            </h3>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-4"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleRoleChange}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}