'use client'

import { useState, useEffect } from 'react'
import { BasketWithItems } from '@/lib/types'
import { updateBasketDetails, getAdminNumber } from '@/actions/basket'
import { createClient } from '@/lib/supabase/client'
import { NIGERIAN_STATES } from '@/lib/constants'

interface OrderModalProps {
  basket: BasketWithItems
  total: number
  isOpen: boolean
  onClose: () => void
}

export default function OrderModal({ basket, total, isOpen, onClose }: OrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerState, setCustomerState] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadCustomerData = async () => {
      if (!isOpen) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('customers')
          .select('name, phone, state')
          .eq('id', user.id)
          .single()
        if (data) {
          setCustomerName(data.name || '')
          setCustomerPhone(data.phone || '')
          setCustomerState(data.state || '')
        }
      } else {
        setCustomerName('')
        setCustomerPhone('')
        setCustomerState('')
      }
    }
    loadCustomerData()
  }, [isOpen, supabase])

  if (!isOpen) return null

  const isValid = customerName.trim() && customerPhone.trim() && customerState.trim()

  const handleContinue = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)

    try {
      await updateBasketDetails(basket.id, {
        customer_name: customerName,
        phone: customerPhone,
        state: customerState,
      })

      // ✅ await inside async function — works correctly now
      const phone = await getAdminNumber()

      const message =
        `🛒 *NEW ORDER RECEIVED*\n\n` +
        `📌 Basket ID: ${basket.id}\n\n` +
        `👤 CUSTOMER DETAILS\n` +
        `Name: ${customerName}\n` +
        `Phone: ${customerPhone}\n` +
        `State: ${customerState}\n\n` +
        `📦 ORDER ITEMS\n` +
        basket.items.map((item, index) =>
          `${index + 1}. ${item.product.name}\n` +
          `   Qty: ${item.quantity}\n` +
          `   Unit Price: ₦${item.product.price}\n` +
          `   Subtotal: ₦${item.quantity * item.product.price}\n`
        ).join('\n') +
        `\n💰 TOTAL: ₦${total}\n\n` +
        `🕒 Order Date: ${new Date().toLocaleString()}\n` +
        `🔗 Admin Link:\n${process.env.NEXT_PUBLIC_SITE_URL}/admin/baskets/${basket.id}\n\n` +
        `Thank you 🙏`

      const params = new URLSearchParams({ phone, text: message })
      window.open(`https://api.whatsapp.com/send?${params.toString()}`, '_blank')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Your Order</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Please provide your details to send the order via WhatsApp.
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              placeholder="08012345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State / Region <span className="text-red-500">*</span>
            </label>
            <select
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isSubmitting ? 'Saving...' : 'Continue to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}