'use client'

import { useState, useEffect } from 'react'
import { BasketWithItems } from '@/lib/types'
import { updateBasketDetails } from '@/actions/basket'
import { createClient } from '@/lib/supabase/client'
import { NIGERIAN_STATES } from '@/lib/constants'
import { shortenUrl } from '@/actions/links'; // Adjust the import path as needed

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
  const [deliveryNote, setDeliveryNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load saved customer details if logged in
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
        // Reset for guest
        setCustomerName('')
        setCustomerPhone('')
        setCustomerState('')
        setDeliveryNote('')
      }
    }
    loadCustomerData()
  }, [isOpen, supabase])

  if (!isOpen) return null

  const isValid = customerName.trim() && customerPhone.trim() && customerState.trim()

const generateWhatsAppLink = () => {
  const basketId = basket.id
  const phone = '2348127856114' // Your sister's number
  
  // Build the message (emojis included - they'll be encoded properly)
  const message = 
    `🛒 *NEW ORDER RECEIVED*\n\n` +
    `📌 Basket ID: ${basketId}\n\n` +
    `👤 CUSTOMER DETAILS\n` +
    `Name: ${customerName}\n` +
    `Phone: ${customerPhone}\n` +
    `State: ${customerState}\n` +
    (deliveryNote ? `Note: ${deliveryNote}\n` : '') + '\n' +
    `📦 ORDER ITEMS\n` +
    basket.items.map((item, index) =>
      `${index + 1}. ${item.product.name}\n` +
      `   Qty: ${item.quantity}\n` +
      `   Unit Price: ₦${item.product.price}\n` +
      `   Subtotal: ₦${item.quantity * item.product.price}\n`
    ).join('\n') +
    `\n💰 TOTAL: ₦${total}\n\n` +
    `🕒 Order Date: ${new Date().toLocaleString()}\n` +
      // 👇 Clean link on its own line – WhatsApp will make it clickable
    `🔗 Admin Link:\n${process.env.NEXT_PUBLIC_SITE_URL}/admin/baskets/${basketId}\n\n` +
    `Thank you 🙏`
  // Use api.whatsapp.com instead of wa.me for better emoji support
  const baseUrl = 'https://api.whatsapp.com/send'
  const params = new URLSearchParams({
    phone: phone,
    text: message  // URLSearchParams handles encoding automatically
  })
  
  return `${baseUrl}?${params.toString()}`
}

  const handleContinue = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError(null)

    try {
      await updateBasketDetails(basket.id, {
        customer_name: customerName,
        phone: customerPhone,
        state: customerState,
        delivery_note: deliveryNote || undefined,
      })
      const link = generateWhatsAppLink()
      window.open(link, '_blank')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Complete Your Order</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your details to send the order via WhatsApp.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="08012345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State / Region <span className="text-red-500">*</span>
            </label>
            <select
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Note (Optional)
            </label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Landmark, special instructions..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Continue to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}