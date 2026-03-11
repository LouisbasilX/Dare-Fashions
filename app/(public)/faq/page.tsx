'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is your First Come, First Serve policy?',
    answer:
      'Products are reserved only when a basket is marked <strong>Paid</strong>. Available quantity decreases only at that moment. Your basket may become invalid if another customer pays for the same product before you.',
  },
  {
    question: 'How do I know if my basket is valid?',
    answer:
      'On your basket page, items that exceed available stock are highlighted in red. The basket status will show as "Invalid". You must adjust quantities before sending your order.',
  },
  {
    question: 'Do I need an account to shop?',
    answer:
      'No account required. Your basket is saved via a cookie on your device. You can share the basket link with us via WhatsApp. If you create an account, your basket will be transferred automatically.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Add items to your basket, ensure it is valid, then click the WhatsApp button. This sends us your order with a link to your basket. We will confirm availability and payment details.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept bank transfers and direct payments. After you send your order via WhatsApp, we will provide payment details.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#1A1A1A]">
      {/* Hero Header */}
      {/* Hero Header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          background: 'var(--gold)',
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
            repeating-linear-gradient(
              45deg,
              rgba(0,0,0,0.2) 0px,
              rgba(0,0,0,0.2) 2px,
              transparent 2px,
              transparent 8px,
              rgba(26,92,69,0.35) 8px,
              rgba(26,92,69,0.35) 10px,
              transparent 10px,
              transparent 18px
            )
          `,
          boxShadow: '0 8px 32px rgba(212, 175, 55, 0.35)',
        }}
      >
        <div
          className="inline-block px-10 py-8 rounded-2xl max-w-2xl mx-auto"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg"
            style={{ color: 'rgba(255,255,255,0.92)' }}
          >
            Everything you need to know about shopping with Dare Fashion.
          </motion.p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                style={{ '--tw-ring-color': 'var(--gold)' } as React.CSSProperties}
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--gold)' }}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p
                      className="text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-700 dark:text-gray-300">
            Still have questions?{' '}
            <a
              href="/contact"
              className="font-medium underline transition"
              style={{ color: 'var(--gold)' }}
            >
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}