'use client'

import { MessageCircle } from 'lucide-react'

interface Props {
  phone: string | null
  basketId: string
  customerId?: string | null
  guestId?: string | null
}

export default function SendWhatsAppLink({ phone, basketId, customerId, guestId }: Props) {
  if (!phone) return null

  const handleSend = () => {
    // Build revive link using current origin
    const base = `${window.location.origin}/revive-basket/${basketId}`
    const url = customerId
      ? `${base}?customerId=${customerId}`
      : guestId
      ? `${base}?guestId=${guestId}`
      : base

    // Format phone number: remove non-digits, ensure it's international
    const cleanPhone = phone.replace(/\D/g, '')
    // Assume Nigerian numbers – you might want to add +234 if missing
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Here is your basket quick access link: ${url}`
    )}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleSend}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition"
      title="Send revive link via WhatsApp"
    >
      <MessageCircle className="w-4 h-4" />
      Send Link
    </button>
  )
}