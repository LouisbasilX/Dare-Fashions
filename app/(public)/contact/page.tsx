import { Mail, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
        Get in Touch
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        Have questions or feedback? Reach out to us via email or WhatsApp. We&apos;re here to help!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">
            Email Us
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            For orders, inquiries, or support
          </p>
          <a
            href="mailto:rpapparels001@gmail.com"
            className="block text-center text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            rpapparels001@gmail.com
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white text-center">
            WhatsApp
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            Quick replies via WhatsApp
          </p>
          <a
            href="https://wa.me/2349029453254?text=Hello%20RP%20Apparels%2C%20I%20have%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-green-600 dark:text-green-400 hover:underline"
          >
            09029453254
          </a>
        </div>
      </div>

      {/* Optional back link */}
      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}