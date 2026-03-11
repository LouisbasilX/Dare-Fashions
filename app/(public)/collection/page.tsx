import Link from 'next/link'

const collections = [
  {
    sex: 'women',
    label: 'Women',
    tagline: 'Bold. Elegant. Unapologetic.',
    description: 'Curated pieces that command every room — from chic dresses to statement sets.',
    href: '/shop?sex=women',
    accent: 'var(--gold)',
    accentRgb: '212,175,55',
    pattern: `repeating-linear-gradient(
      135deg,
      rgba(212,175,55,0.06) 0px, rgba(212,175,55,0.06) 1px,
      transparent 1px, transparent 12px
    )`,
    number: '01',
  },
  {
    sex: 'men',
    label: 'Men',
    tagline: 'Sharp. Refined. Powerful.',
    description: 'Elevated essentials and trend-forward styles built for the modern man.',
    href: '/shop?sex=men',
    accent: 'var(--emerald)',
    accentRgb: '26,92,69',
    pattern: `repeating-linear-gradient(
      45deg,
      rgba(26,92,69,0.07) 0px, rgba(26,92,69,0.07) 1px,
      transparent 1px, transparent 12px
    )`,
    number: '02',
  },
  {
    sex: 'unisex',
    label: 'Unisex',
    tagline: 'Boundless. Free. Iconic.',
    description: 'Pieces that transcend — designed for everyone, styled by you.',
    href: '/shop?sex=unisex',
    accent: 'var(--gold-dark)',
    accentRgb: '184,150,15',
    pattern: `repeating-linear-gradient(
      90deg,
      rgba(212,175,55,0.05) 0px, rgba(212,175,55,0.05) 1px,
      transparent 1px, transparent 10px
    ), repeating-linear-gradient(
      0deg,
      rgba(26,92,69,0.05) 0px, rgba(26,92,69,0.05) 1px,
      transparent 1px, transparent 10px
    )`,
    number: '03',
  },
]

export default function CollectionsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=Montserrat:wght@300;400;600&display=swap');

        .collection-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease;
        }
        .collection-card:hover {
          transform: translateY(-6px);
        }
        .collection-card .card-arrow {
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0;
          transform: translateX(-6px);
        }
        .collection-card:hover .card-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .collection-card .card-line {
          transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
          width: 32px;
        }
        .collection-card:hover .card-line {
          width: 64px;
        }
        .collection-card .card-overlay {
          transition: opacity 0.4s ease;
          opacity: 0;
        }
        .collection-card:hover .card-overlay {
          opacity: 1;
        }

        @keyframes col-fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .col-animate {
          animation: col-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
      `}</style>

      <div className="min-h-screen bg-[#F6F9F7] dark:bg-[#0C1A14]">

        {/* ── Hero header ───────────────────────────────────────────────── */}
        <div
          className="relative py-20 px-4 text-center overflow-hidden"
          style={{
            background: 'var(--gold)',
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
              repeating-linear-gradient(
                45deg,
                rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px,
                transparent 2px, transparent 8px,
                rgba(26,92,69,0.35) 8px, rgba(26,92,69,0.35) 10px,
                transparent 10px, transparent 18px
              )
            `,
            boxShadow: '0 8px 32px rgba(212,175,55,0.3)',
          }}
        >
          <div
            className="inline-block px-12 py-10 rounded-2xl w-full max-w-2xl mx-auto"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}
          >
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.5))' }} />
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '10px',
                letterSpacing: '4px',
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
              }}>
                Dare Fashion
              </span>
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.5))' }} />
            </div>

            <h1
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 300,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              Our <em>Collections</em>
            </h1>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              marginTop: '16px',
            }}>
              Shop by Category
            </p>
          </div>
        </div>

        {/* ── Collection cards ──────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col, i) => (
              <Link
                key={col.sex}
                href={col.href}
                className="collection-card col-animate block rounded-2xl"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                  textDecoration: 'none',
                }}
              >
                {/* Top patterned band */}
                <div
                  className="relative h-40 rounded-t-2xl overflow-hidden"
                  style={{
                    background: `var(--emerald-dark)`,
                    backgroundImage: col.pattern,
                  }}
                >
                  {/* Hover glow overlay */}
                  <div
                    className="card-overlay absolute inset-0 rounded-t-2xl"
                    style={{ background: `radial-gradient(circle at 50% 60%, rgba(${col.accentRgb},0.25) 0%, transparent 70%)` }}
                  />

                  {/* Large number watermark */}
                  <span
                    className="absolute bottom-2 right-4"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '6rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.06)',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {col.number}
                  </span>

                  {/* Accent line top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ background: col.accent }}
                  />

                  {/* Label pill */}
                  <div className="absolute top-4 left-5">
                    <span
                      className="px-3 py-1 rounded-full text-white"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '9px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {col.label}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  {/* Tagline */}
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '9px',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                      color: col.accent,
                    }}
                  >
                    {col.tagline}
                  </p>

                  {/* Title */}
                  <h2
                    className="mb-3 text-gray-900 dark:text-white"
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '2rem',
                      fontWeight: 600,
                      lineHeight: 1.1,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {col.label}'s Collection
                  </h2>

                  {/* Description */}
                  <p
                    className="text-gray-500 dark:text-gray-400 mb-6"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {col.description}
                  </p>

                  {/* CTA row */}
                  <div className="flex items-center gap-3">
                    <div
                      className="card-line h-[1px] rounded-full"
                      style={{ background: col.accent }}
                    />
                    <span
                      className="card-arrow flex items-center gap-1"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '10px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: col.accent,
                        fontWeight: 600,
                      }}
                    >
                      Shop Now
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Bottom all collections link ───────────────────────────── */}
          <div className="mt-14 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-3 rounded-xl font-semibold transition"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                backgroundColor: 'var(--emerald)',
                color: '#ffffff',
              }}
            >
              Browse All Products
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}