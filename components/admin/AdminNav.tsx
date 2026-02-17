'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false)
  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/baskets', label: 'Baskets' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/users', label: 'Users' },
   
  ]

  return (
    <nav className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 sticky top-[73px] z-40">
      <div className="container mx-auto px-4">
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6 py-3">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex items-center justify-between py-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Admin Menu</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}