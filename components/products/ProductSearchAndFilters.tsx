'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, X, ChevronDown, Sparkles } from 'lucide-react'

const PRICE_BRACKETS = [
  { label: 'Under ₦10k',   min: 0,     max: 10000 },
  { label: '₦10k – ₦30k', min: 10000, max: 30000  },
  { label: '₦30k – ₦50k', min: 30000, max: 50000  },
  { label: 'Over ₦50k',   min: 50000, max: null   },
]

// #1a1714 — very dark warm charcoal, not pure black, reads as "rich dark" not void
const inputCls = [
  'w-full border border-[#2e2b27] bg-[#1a1714] text-gray-100 rounded-xl',
  'px-4 py-2.5 text-sm placeholder:text-[#5a5550]',
  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]',
  'hover:border-[#3e3b37] transition-colors duration-200',
].join(' ')

const selectCls = [
  'w-full border border-[#2e2b27] bg-[#1a1714] text-gray-100 rounded-xl',
  'px-4 py-2.5 pr-9 text-sm appearance-none cursor-pointer',
  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]',
  'hover:border-[#3e3b37] transition-colors duration-200',
].join(' ')

const numberCls = [
  'w-28 border border-[#2e2b27] bg-[#1a1714] text-gray-100 rounded-xl',
  'px-3 py-2.5 text-sm placeholder:text-[#5a5550]',
  'focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]',
  'hover:border-[#3e3b37] transition-colors duration-200',
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
].join(' ')

interface PanelProps {
  search: string;       setSearch:      (v: string)  => void
  sex: string;          setSex:         (v: string)  => void
  sort: string;         setSort:        (v: string)  => void
  newArrivals: boolean; setNewArrivals: (v: boolean) => void
  minPrice: string;     setMinPrice:    (v: string)  => void
  maxPrice: string;     setMaxPrice:    (v: string)  => void
  activeCount: number
  onClose:         () => void
  onApply:         () => void
  onReset:         () => void
  setPriceBracket: (min: number | null, max: number | null) => void
}

function FilterPanelContent({
  search, setSearch, sex, setSex, sort, setSort,
  newArrivals, setNewArrivals, minPrice, setMinPrice,
  maxPrice, setMaxPrice, activeCount,
  onClose, onApply, onReset, setPriceBracket,
}: PanelProps) {
  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden shadow-2xl border border-[#252525] w-full">
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]"
        style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.10) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
          <span className="font-bold text-white text-sm tracking-widest uppercase">Refine Results</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#7A1E2C] text-white text-[11px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…" className={inputCls}
          />
          <div className="relative">
            <select value={sex} onChange={e => setSex(e.target.value)} className={selectCls}>
              <option value="">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)} className={selectCls}>
              <option value="">Default Sort</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#2e2b27] bg-[#1a1714] cursor-pointer hover:border-[#D4AF37] transition-colors select-none">
            <div className="relative w-9 h-5 flex-shrink-0">
              <input type="checkbox" checked={newArrivals} onChange={e => setNewArrivals(e.target.checked)} className="sr-only" />
              <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${newArrivals ? 'bg-[#D4AF37]' : 'bg-[#333]'}`} />
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${newArrivals ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-white font-medium">New Arrivals</span>
          </label>
        </div>

        <div className="pt-5 border-t border-[#1e1e1e]">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-3">Price Range (₦)</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className={numberCls} />
              <span className="text-gray-700 text-lg font-light select-none">—</span>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className={numberCls} />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICE_BRACKETS.map(bracket => {
                const isActive = minPrice === (bracket.min?.toString() ?? '') && maxPrice === (bracket.max?.toString() ?? '')
                return (
                  <button
                    key={bracket.label}
                    onClick={() => setPriceBracket(bracket.min, bracket.max)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-gray-900 shadow-[0_0_14px_rgba(212,175,55,0.45)]'
                        : 'bg-transparent border-[#2e2e2e] text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                  >
                    {bracket.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onReset} className="px-5 py-2.5 text-sm font-medium rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] text-gray-400 hover:bg-[#222] hover:text-white hover:border-[#444] transition-colors">
            Reset
          </button>
          <button
            onClick={onApply}
            className="group relative px-8 py-2.5 text-sm font-bold rounded-xl overflow-hidden text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(122,30,44,0.4)]"
            style={{ background: 'linear-gradient(135deg, #9A2E40 0%, #7A1E2C 100%)' }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <span className="relative z-10">Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductSearchAndFilters() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search,       setSearch]       = useState(searchParams.get('q')        || '')
  const [sex,          setSex]          = useState(searchParams.get('sex')      || '')
  const [sort,         setSort]         = useState(searchParams.get('sort')     || '')
  const [newArrivals,  setNewArrivals]  = useState(searchParams.get('new') === 'true')
  const [minPrice,     setMinPrice]     = useState(searchParams.get('minPrice') || '')
  const [maxPrice,     setMaxPrice]     = useState(searchParams.get('maxPrice') || '')

  // isFloating: true = pill mode, false = inline mode
  const [isFloating, setIsFloating] = useState(false)

  // Refs to measure actual DOM positions
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Core scroll logic ─────────────────────────────────────────────────────
  //
  //  Transition to FLOATING when: scrollY >= button's top edge (button scrolls out of view)
  //  Transition back to INLINE when: scrollY < button's top edge
  //
  //  When panel is OPEN and user scrolls:
  //    — pill cannot appear until scroll is 80px BELOW the panel's bottom edge
  //    — at that point panel closes and pill appears
  //
  useEffect(() => {
    const onScroll = () => {
      if (!btnRef.current) return

      const btnTop = btnRef.current.getBoundingClientRect().top

      // Button top has scrolled to/above the viewport top edge → go floating
      const shouldFloat = btnTop <= 0

      if (shouldFloat && !isFloating) {
        // Transitioning inline → floating
        if (isFilterOpen) {
          // Panel is open — check if we're far enough below it
          if (panelRef.current) {
            const panelBottom = panelRef.current.getBoundingClientRect().bottom
            // Only switch if panel bottom is 80px above viewport top (i.e. well off-screen)
            if (panelBottom > -80) return // not yet — stay inline
          }
          setIsFilterOpen(false)
        }
        setIsFloating(true)
      } else if (!shouldFloat && isFloating) {
        // Transitioning floating → inline — close modal if open
        setIsFilterOpen(false)
        setIsFloating(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isFloating, isFilterOpen])

  // Lock body scroll when modal is open in floating mode
  useEffect(() => {
    document.body.style.overflow = (isFilterOpen && isFloating) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isFilterOpen, isFloating])

  const activeCount = [search, sex, sort, newArrivals ? 'new' : '', minPrice, maxPrice].filter(Boolean).length

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search)      params.set('q',        search)
    if (sex)         params.set('sex',      sex)
    if (sort)        params.set('sort',     sort)
    if (newArrivals) params.set('new',      'true')
    if (minPrice)    params.set('minPrice', minPrice)
    if (maxPrice)    params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
    setIsFilterOpen(false)
  }

  const resetFilters = () => {
    setSearch(''); setSex(''); setSort('')
    setNewArrivals(false); setMinPrice(''); setMaxPrice('')
    router.push('/shop')
    setIsFilterOpen(false)
  }

  const panelProps: PanelProps = {
    search, setSearch, sex, setSex, sort, setSort,
    newArrivals, setNewArrivals, minPrice, setMinPrice,
    maxPrice, setMaxPrice, activeCount,
    onClose: () => setIsFilterOpen(false),
    onApply: applyFilters,
    onReset: resetFilters,
    setPriceBracket: (min, max) => {
      setMinPrice(min?.toString() ?? '')
      setMaxPrice(max?.toString() ?? '')
    },
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          MAIN BUTTON — always in document flow, never removed from DOM.
          Transforms visually into a ghost placeholder when floating so the
          layout doesn't collapse and we keep measuring its position.
      ───────────────────────────────────────────────────────────────────── */}
      <div className="mb-6">

        {/*
          Outer wrapper stays in flow always.
          When floating: the real button is invisible (opacity-0, pointer-events-none),
          replaced visually by the pill via fixed positioning.
          This keeps the layout stable AND lets us measure btnRef position.
        */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => !isFloating && setIsFilterOpen(o => !o)}
            aria-expanded={isFilterOpen && !isFloating}
            className={`
              group relative w-full flex items-center justify-between
              px-8 py-5 rounded-2xl overflow-hidden
              font-bold text-gray-900 text-base tracking-wide
              focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/40
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              shadow-[0_6px_30px_rgba(212,175,55,0.35)]
              ${isFloating
                // Shrink + fade out — the pill takes over
                ? 'opacity-0 scale-95 pointer-events-none cursor-default'
                : 'opacity-100 scale-100 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_14px_50px_rgba(212,175,55,0.55)]'
              }
            `}
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C9A227 40%, #B8960F 100%)' }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
            <span className="absolute inset-0 rounded-2xl border-2 border-white/40 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" style={{ animationDuration: '1.2s' }} />

            {/* Left */}
            <span className="relative z-10 flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-black/10 group-hover:bg-black/15 transition-colors">
                <SlidersHorizontal className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-base font-bold">Filter &amp; Sort Products</span>
                <span className="text-xs font-medium text-gray-700 opacity-80">
                  {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'Find your perfect piece'}
                </span>
              </span>
            </span>

            {/* Right */}
            <span className="relative z-10 flex items-center gap-2">
              {activeCount > 0 && (
                <span className="flex items-center justify-center w-6 h-6 bg-[#7A1E2C] text-white text-xs font-bold rounded-full shadow-md">
                  {activeCount}
                </span>
              )}
              <Sparkles className="w-4 h-4 text-gray-800 opacity-70" />
              <span className="hidden sm:inline text-sm font-semibold text-gray-800 opacity-80">Open</span>
              <ChevronDown className={`w-5 h-5 text-gray-800 transition-transform duration-300 ${isFilterOpen && !isFloating ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {/* ── FLOATING PILL — fixed, appears exactly when main btn scrolls out ── */}
          <div
            className={`
              fixed top-[72px] right-5 z-50
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isFloating
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 -translate-y-2 scale-90 pointer-events-none'
              }
            `}
          >
            <button
              onClick={() => setIsFilterOpen(o => !o)}
              className="
                group relative flex items-center gap-2.5
                px-5 py-3 rounded-2xl overflow-hidden
                font-bold text-gray-900 text-sm
                focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/40
                transition-all duration-300
                hover:-translate-y-1 hover:scale-105 active:scale-95
                shadow-[0_8px_32px_rgba(212,175,55,0.5)] hover:shadow-[0_16px_48px_rgba(212,175,55,0.65)]
              "
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8960F 100%)' }}
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none" />
              <SlidersHorizontal className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
              <span className="relative z-10 hidden sm:inline">Filters</span>
              {activeCount > 0 && (
                <span className="relative z-10 flex items-center justify-center w-5 h-5 bg-[#7A1E2C] text-white text-[11px] font-bold rounded-full">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── INLINE PANEL (only in non-floating mode) ─────────────────────── */}
        <div
          ref={panelRef}
          className={`
            overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isFilterOpen && !isFloating
              ? 'max-h-[900px] opacity-100 mt-4'
              : 'max-h-0 opacity-0 pointer-events-none mt-0'}
          `}
        >
          <FilterPanelContent {...panelProps} />
        </div>
      </div>

      {/* ── MODAL (floating mode only) ────────────────────────────────────── */}
      {isFloating && (
        <div
          className={`
            fixed inset-0 z-[60] transition-all duration-300 ease-out
            ${isFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
        >
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ backdropFilter: 'blur(14px) saturate(0.6)', backgroundColor: 'rgba(0,0,0,0.55)' }}
            onClick={() => setIsFilterOpen(false)}
          />
          <div
            className={`
              relative z-10 mx-auto mt-24 w-full max-w-2xl px-4
              transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${isFilterOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'}
            `}
          >
            <div
              className="absolute -inset-1 rounded-3xl blur-xl opacity-25 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #7A1E2C)' }}
            />
            <FilterPanelContent {...panelProps} />
          </div>
        </div>
      )}

      <style>{`
        option { background-color: #0a0a0a !important; color: #ffffff !important; }
      `}</style>
    </>
  )
}
