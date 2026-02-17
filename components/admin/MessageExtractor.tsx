'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MessageExtractor() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const extractAndRedirect = () => {
    setError(null)

    // Regex to find basket URL – matches both localhost and production domains
    const urlRegex = /(https?:\/\/[^\s]+\/admin\/baskets\/([a-f0-9-]+))/i
    const match = message.match(urlRegex)

    if (!match) {
      setError('No valid basket link found in the message.')
      return
    }

    const basketId = match[2]
    router.push(`/admin/baskets/${basketId}`)
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Quick Basket Lookup</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Paste a WhatsApp message containing a basket link, and we'll take you there.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 text-sm"
          placeholder="Paste the full WhatsApp message here..."
        />
        <button
          onClick={extractAndRedirect}
          disabled={!message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition self-start sm:self-center whitespace-nowrap"
        >
          Go to Basket
        </button>
      </div>
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}