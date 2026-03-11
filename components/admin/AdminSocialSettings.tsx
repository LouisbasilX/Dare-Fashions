'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAdminSocialSettings } from '@/actions/admin'
import { Phone, X, Check, Pencil, Instagram, Mail } from 'lucide-react'

// ── X (Twitter) SVG icon (no lucide equivalent) ──────────────────────────────
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
type SocialField = 'admin_whatsapp_number' | 'admin_x_handle' | 'admin_tiktok_handle' | 'admin_instagram_handle' | 'admin_gmail'

interface SocialSettings {
  admin_whatsapp_number: string
  admin_x_handle: string
  admin_tiktok_handle: string
  admin_instagram_handle: string
  admin_gmail: string
}

// ── Field config ──────────────────────────────────────────────────────────────
const FIELDS: {
  key: SocialField
  label: string
  placeholder: string
  prefix?: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    key: 'admin_whatsapp_number',
    label: 'WhatsApp',
    placeholder: '+234...',
    icon: <Phone className="w-4 h-4" />,
    color: '#25D366',
  },
  {
    key: 'admin_x_handle',
    label: 'X (Twitter)',
    placeholder: '@handle',
    prefix: '@',
    icon: <XIcon className="w-4 h-4" />,
    color: '#e5e5e5',
  },
  {
    key: 'admin_tiktok_handle',
    label: 'TikTok',
    placeholder: '@handle',
    prefix: '@',
    icon: <TikTokIcon className="w-4 h-4" />,
    color: '#e1593a',
  },
  {
    key: 'admin_instagram_handle',
    label: 'Instagram',
    placeholder: '@handle',
    prefix: '@',
    icon: <Instagram className="w-4 h-4" />,
    color: '#8900ea',
  },
  { key: 'admin_gmail',
    label: 'Email',
    placeholder: '@handle',
    prefix: '@',
    icon: <Mail className="w-4 h-4" />,
    color: '#0099b8',
  },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminSocialSettings() {
  const [settings, setSettings] = useState<SocialSettings>({
    admin_whatsapp_number: '',
    admin_x_handle: '',
    admin_tiktok_handle: '',
    admin_instagram_handle: '',
    admin_gmail: ''
  })
  const [loading, setLoading] = useState(true)
  const [activeField, setActiveField] = useState<SocialField | null>(null)
  const [editValue, setEditValue] = useState('')
  const [updating, setUpdating] = useState(false)
  const [savedField, setSavedField] = useState<SocialField | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select(
          'admin_whatsapp_number, admin_x_handle, admin_tiktok_handle, admin_instagram_handle, admin_gmail'
        )
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Failed to fetch social settings:', error)
      } else {
        setSettings({
          admin_whatsapp_number: data.admin_whatsapp_number ?? '',
          admin_x_handle: data.admin_x_handle ?? '',
          admin_tiktok_handle: data.admin_tiktok_handle ?? '',
          admin_instagram_handle: data.admin_instagram_handle ?? '',
          admin_gmail: data.admin_gmail ?? ''
        })
      }
      setLoading(false)
    }
    fetchSettings()
  }, [supabase])

  const handleOpen = (field: SocialField) => {
    setEditValue(settings[field])
    setActiveField(field)
  }

  const handleSave = async () => {
    if (!activeField || !editValue.trim()) return
    setUpdating(true)
    try {
      await updateAdminSocialSettings({ [activeField]: editValue.trim() })
      setSettings((prev) => ({ ...prev, [activeField]: editValue.trim() }))

      // Brief success flash
      setSavedField(activeField)
      setTimeout(() => setSavedField(null), 2000)
      setActiveField(null)
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update. Check console.')
    } finally {
      setUpdating(false)
    }
  }

  const activeConfig = FIELDS.find((f) => f.key === activeField)

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/60">
          <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
          <div className="animate-pulse h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/40 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="animate-pulse w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="animate-pulse h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="animate-pulse h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="animate-pulse h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    )
  }

  // ── Main card ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Social & Contact Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage public-facing contact and social handles
          </p>
        </div>

        {/* Field rows */}
        <ul className="divide-y divide-gray-100 dark:divide-gray-700/40">
          {FIELDS.map((field) => {
            const value = settings[field.key]
            const justSaved = savedField === field.key

            return (
              <li
                key={field.key}
                className="flex items-center justify-between px-6 py-4 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                onClick={() => handleOpen(field.key)}
              >
                {/* Icon + label + value */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
                    style={{ background: `${field.color}18`, color: field.color }}
                  >
                    {field.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {field.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {value || (
                        <span className="text-gray-400 dark:text-gray-600 italic font-normal">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Edit / saved indicator */}
                <button
                  onClick={() => handleOpen(field.key)}
                  className={`
                    ml-4 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${justSaved
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-[var(--gold)]/10 hover:text-[var(--gold-dark)] opacity-0 group-hover:opacity-100'
                    }
                  `}
                  title={`Edit ${field.label}`}
                >
                  {justSaved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Pencil className="w-3.5 h-3.5" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {activeField && activeConfig && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !updating) setActiveField(null)
          }}
        >
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${activeConfig.color}18`,
                  color: activeConfig.color,
                }}
              >
                {activeConfig.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                  Update {activeConfig.label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeConfig.key === 'admin_whatsapp_number'
                    ? 'Include country code e.g. +234...'
                    : 'Enter handle with or without @'}
                </p>
              </div>
            </div>

            {/* Input */}
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={activeConfig.placeholder}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold)] text-sm mb-5 transition"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={updating || !editValue.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition"
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveField(null)}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}