import Link from 'next/link'
import { BookOpen, Target, Rocket, Sparkles, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#1A1A1A]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#7A1E2C] py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About RP APPARELS
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Fashion with purpose, style with confidence.
        </p>
      </div>

      {/* Content Cards */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-6">
          {/* Our Story */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#7A1E2C] dark:text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Story
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  RP APPARELS was created for People who understand that style is power.
                  What started as a passion for fashion quickly became a mission — to provide trendy, classy and confidence‑boosting outfits that help women feel bold in every space they enter.
                  We are not just about clothes. We are about presence.
                </p>
              </div>
            </div>
          </div>

          {/* Our Vision */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-lg">
                <Target className="w-6 h-6 text-[#7A1E2C] dark:text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Vision
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  To become a leading fashion brand known for bold femininity, effortless elegance and empowering style.
                </p>
              </div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-lg">
                <Rocket className="w-6 h-6 text-[#7A1E2C] dark:text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Mission
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  To curate high‑quality, trendy fashion pieces that help women feel confident, stylish and unapologetically themselves.
                </p>
              </div>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-[#7A1E2C] dark:text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  What Makes Us Different
                </h2>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside">
                  <li>We select pieces that flatter and elevate</li>
                  <li>We prioritise quality and comfort</li>
                  <li>We focus on trendy yet timeless styles</li>
                  <li>We serve confidence — not just fashion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Our Promise */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 rounded-lg">
                <Heart className="w-6 h-6 text-[#7A1E2C] dark:text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Promise
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  When you shop with RP APPARELS, you’re not just buying an outfit.
                  You’re investing in how you show up in the world.
                  And we take that seriously.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-block bg-[#D4AF37] hover:bg-[#B8960F] text-gray-900 font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105 shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}