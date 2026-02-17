'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu, X, ShoppingBag, User, LogOut, Home } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import BasketIcon from '@/components/BasketIcon'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Check if we're on admin pages
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        setUserRole(customer?.role || null)
      }
    }

    fetchUserAndRole()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('customers')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data }) => setUserRole(data?.role || null))
      } else {
        setUserRole(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Home Link */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="RP Apparels"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              RP Apparels
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition ${
                pathname === '/' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/products') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Shop
            </Link>

             <Link 
              href="/about" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/about') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              About
            </Link>
            <Link 
              href="/faq" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/faq') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Faq
            </Link>
            <Link 
              href="/baskets" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/baskets') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              My Baskets
            </Link>
            {userRole === 'admin' && !isAdminRoute && (
              <Link 
                href="/admin" 
                className="text-sm font-medium px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Section: Icons */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <BasketIcon />
            
            {/* User Menu (Desktop) */}
            {user ? (
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e1e1e] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {user.email}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {userRole === 'admin' && !isAdminRoute && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {isAdminRoute && (
                      <Link
                        href="/"
                        className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Back to Store
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
              href="/about" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/about') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              About
            </Link>
            <Link 
              href="/faq" 
              className={`text-sm font-medium transition ${
                pathname?.startsWith('/faq') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              FAQ
            </Link>
              <Link
                href="/baskets"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Baskets
              </Link>
              
              {user ? (
                <>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                      Logged in as: {user.email}
                    </p>
                    <Link
                      href="/profile"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {userRole === 'admin' && !isAdminRoute && (
                      <Link
                        href="/admin"
                        className="block text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {isAdminRoute && (
                      <Link
                        href="/"
                        className="block text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Back to Store
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 py-2"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded text-center hover:bg-blue-700 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}