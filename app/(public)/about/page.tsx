import Link from 'next/link'
import { BookOpen, Target, Rocket, Sparkles, Heart } from 'lucide-react'

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Dare Fashion
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Fashion with purpose, style with confidence.
          </p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-6">
          {/* Our Story */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--emerald)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Story
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Dare Fashion was created for people who understand that style is power.
                  What started as a passion for fashion quickly became a mission — to provide trendy, classy and confidence‑boosting outfits that help women feel bold in every space they enter.
                  We are not just about clothes. We are about presence.
                </p>
              </div>
            </div>
          </div>

          {/* Our Vision */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                <Target className="w-6 h-6" style={{ color: 'var(--emerald)' }} />
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
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                <Rocket className="w-6 h-6" style={{ color: 'var(--emerald)' }} />
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
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--emerald)' }} />
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
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                <Heart className="w-6 h-6" style={{ color: 'var(--emerald)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Our Promise
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  When you shop with Dare Fashion, you're not just buying an outfit.
                  You're investing in how you show up in the world.
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
            className="inline-block font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105 shadow-md"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'black',
            }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}