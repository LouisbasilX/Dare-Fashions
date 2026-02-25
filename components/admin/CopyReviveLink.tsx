'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  basketId: string
  customerId?: string | null
  guestId?: string | null
}

export default function CopyReviveLink({ basketId, customerId, guestId }: Props) {
  const [copied, setCopied] = useState(false)

  const getReviveUrl = () => {
    const base = `${window.location.origin}/revive-basket/${basketId}`
    // Always append an identifier so the recipient can access without being logged in
    if (guestId) return `${base}?guestId=${guestId}`
    if (customerId) return `${base}?customerId=${customerId}`
    return base
  }

  const handleCopy = async () => {
    const url = getReviveUrl()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!customerId && !guestId) return null

  return (
    <button
      onClick={handleCopy}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
      title="Copy revive link"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}