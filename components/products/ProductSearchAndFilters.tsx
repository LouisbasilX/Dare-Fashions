'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductSearchAndFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sex, setSex] = useState(searchParams.get('sex') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '')
  const [newArrivals, setNewArrivals] = useState(searchParams.get('new') === 'true')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (sex) params.set('sex', sex)
    if (sort) params.set('sort', sort)
    if (newArrivals) params.set('new', 'true')
    router.push(`/shop?${params.toString()}`)
    setIsFilterOpen(false) // optionally close after apply
  }

  const resetFilters = () => {
    setSearch('')
    setSex('')
    setSort('')
    setNewArrivals(false)
    router.push('/shop')
    setIsFilterOpen(false)
  }

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8960F] text-gray-900 font-medium px-4 py-2 rounded-lg transition"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span>Filter</span>
      </button>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="mt-4 bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
            />

            {/* Sex filter */}
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
            >
              <option value="">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* Sort by price */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
            >
              <option value="">Sort by</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* New Arrivals checkbox */}
            <label className="flex items-center gap-2 text-gray-900 dark:text-white">
              <input
                type="checkbox"
                checked={newArrivals}
                onChange={(e) => setNewArrivals(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <span>New Arrivals</span>
            </label>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                 className="flex-1 bg-[#7A1E2C] hover:bg-[#5A1620] text-white font-medium px-4 py-2 rounded transition"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}