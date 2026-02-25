'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sex, setSex] = useState(searchParams.get('sex') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (sex) params.set('sex', sex)
    if (sort) params.set('sort', sort)
    // Preserve search query if exists
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`/shop?${params.toString()}`)
  }

  const resetFilters = () => {
    setSex('')
    setSort('')
    // Keep search query when resetting filters? Usually yes.
    const q = searchParams.get('q')
    router.push(q ? `/shop?q=${q}` : '/shop')
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sex Filter */}
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

        {/* Sort by Price */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        >
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2 md:col-span-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-[#D4AF37] hover:bg-[#B8960F] disabled:bg-gray-400 text-white p-3 rounded-full transition-all transform hover:scale-110 disabled:hover:scale-100">
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
  )
}