'use client'

import { useState } from 'react'
import SendNewsletterModal from './SendNewsLetterModal'

export default function NewsletterSection() {
  const [showNewsletterModal, setShowNewsletterModal] = useState(false)

  return (
    <>
      <div className="mt-8 p-6 bg-white dark:bg-[#1e1e1e] rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Newsletter</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Send a beautifully crafted “New Arrivals” email to all subscribers.
        </p>
        <button
          onClick={() => setShowNewsletterModal(true)}
          className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-gray-900 px-4 py-2 rounded transition"
        >
          Compose & Send Newsletter
        </button>
      </div>

      <SendNewsletterModal
        isOpen={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
      />
    </>
  )
}