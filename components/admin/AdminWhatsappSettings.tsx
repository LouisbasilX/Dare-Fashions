'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAdminWhatsAppNumber } from '@/actions/admin'
import { Phone, Settings, X, Check } from 'lucide-react'

export default function AdminWhatsAppSettings() {
  const [currentNumber, setCurrentNumber] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchNumber = async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('admin_whatsapp_number')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Failed to fetch admin number:', error)
      } else {
        setCurrentNumber(data.admin_whatsapp_number)
        setEditValue(data.admin_whatsapp_number)
      }
      setLoading(false)
    }
    fetchNumber()
  }, [supabase])

  const handleOpenModal = () => {
    setEditValue(currentNumber)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!editValue.trim()) return
    setUpdating(true)
    try {
      await updateAdminWhatsAppNumber(editValue.trim())
      setCurrentNumber(editValue.trim())
      setIsModalOpen(false)
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update number. Check console.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--gold)]/10 rounded-full">
            <Phone className="w-5 h-5 text-[var(--gold-dark)]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Admin WhatsApp</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white break-all">{currentNumber}</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-gray-900 rounded-lg transition w-full sm:w-auto"
        >
          <Settings className="w-4 h-4" />
          <span>WhatsApp Settings</span>
        </button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Update WhatsApp Number
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the new WhatsApp number (include country code, e.g., +234...)
            </p>

            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="+234..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] mb-6"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={updating || !editValue.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
              >
                {updating ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}