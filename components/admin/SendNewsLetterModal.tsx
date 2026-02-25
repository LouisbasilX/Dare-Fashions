'use client'

import { useState } from 'react'
import { sendNewsletter } from '@/actions/email'
import templates from '@/lib/emailTemplates.json'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SendNewsletterModal({ isOpen, onClose }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleSend = async () => {
    if (!selectedTemplateId) {
      alert('Please select a template.')
      return
    }

    setSending(true)
    setResult(null)
    try {
      const res = await sendNewsletter({
        templateId: selectedTemplateId,
        expiryDate: expiryDate || undefined,
      })
      setResult(res)
      if (res.success) {
        setTimeout(() => onClose(), 2000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setResult({ success: false, message: errorMessage })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-[var(--burgundy)]">Send Newsletter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Template catalog */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Choose a Template</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedTemplateId === t.id
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[var(--gold)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tone: {t.tone}</p>
                    </div>
                    {t.id === selectedTemplateId && (
                      <span className="text-[var(--gold)] text-sm">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: Preview & optional expiry */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            {selectedTemplate ? (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 mb-4">
                <p className="text-sm font-medium mb-2">Subject: {selectedTemplate.subject}</p>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedTemplate.body
                    .replace(/\{\{product_name\}\}/g, '[product name]')
                    .replace(/\{\{discount_code\}\}/g, '')
                    .replace(/\{\{expiry_date\}\}/g, expiryDate || '[expiry date]')
                  }
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Select a template to preview</p>
            )}

            <h3 className="text-lg font-semibold mt-4 mb-3">Optional</h3>
            <input
              type="text"
              placeholder="Expiry date (e.g., March 31, 2026)"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
            />

            {result && (
              <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {result.message}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSend}
                disabled={sending || !selectedTemplateId}
                className="flex-1 bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-gray-900 font-medium px-4 py-2 rounded transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Newsletter'}
              </button>
              <button
                onClick={onClose}
                disabled={sending}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}