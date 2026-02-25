import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#9B1B30] to-[#7A1E2C] animate-gradient-shift">
        {/* Subtle diagonal line overlay (instead of SVG) */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
      </div>

      {/* Floating geometric accents */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#7A1E2C]/30 to-transparent rounded-full blur-3xl animate-pulse-slower" />

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg">
          Own Your Confidence.
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90 drop-shadow">
          Trendy, elegant and statement fashion pieces curated for bold people who love to stand out effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop?new=true"
            className="bg-white text-[#7A1E2C] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
          >
            SHOP NEW ARRIVALS
          </Link>
          <Link
            href="/shop"
            className="bg-[#7A1E2C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5A1620] transition transform hover:scale-105 shadow-lg border border-[#D4AF37]/30"
          >
            EXPLORE COLLECTION
          </Link>
        </div>
      </div>

      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAF7F4] dark:from-[#1A1A1A] to-transparent" />
    </section>
  )
}