'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import catalogData from '@/lib/product-catalog.json'

interface CatalogItem {
  id: string
  name: string
  descriptions: string[]
}

interface Subcategory {
  name: string
  items: CatalogItem[]
}

interface Catalog {
  femaleWear: { category: string; subcategories: Subcategory[] }
  maleWear: { category: string; subcategories: Subcategory[] }
}

const catalog = catalogData as Catalog

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (name: string, description: string) => void
}

export default function CatalogSelector({ isOpen, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'femaleWear' | 'maleWear' | 'all'>('all')
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([])

  useEffect(() => {
    if (!isOpen) return

    const allItems: CatalogItem[] = []
    if (selectedCategory === 'all' || selectedCategory === 'femaleWear') {
      catalog.femaleWear.subcategories.forEach(sub =>
        sub.items.forEach(item => allItems.push(item))
      )
    }
    if (selectedCategory === 'all' || selectedCategory === 'maleWear') {
      catalog.maleWear.subcategories.forEach(sub =>
        sub.items.forEach(item => allItems.push(item))
      )
    }

    const filtered = allItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.descriptions.some(d => d.toLowerCase().includes(search.toLowerCase()))
    )
    setFilteredItems(filtered)
  }, [search, selectedCategory, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Catalog</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('femaleWear')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'femaleWear'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Female Wear
            </button>
            <button
              onClick={() => setSelectedCategory('maleWear')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'maleWear'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Male Wear
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found.</p>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition cursor-pointer"
                  onClick={() => {
                    onSelect(item.name, item.descriptions[0])
                    onClose()
                  }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.descriptions[0]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {item.descriptions.length} description lines available
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}