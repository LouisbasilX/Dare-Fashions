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
    <>
      <style>{`
        /* ── Desktop nav: gold underline slide from center ── */
        .rp-nav {
          position: relative;
          padding-bottom: 2px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .rp-nav::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #B8860B, #D4AF37, #E3B347);
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1),
                      left  0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .rp-nav:hover::after,
        .rp-nav-active::after {
          width: 100%;
          left: 0;
        }
        .rp-nav:hover      { color: #B8860B !important; transform: translateY(-1px); }
        .rp-nav-active     { color: #B8860B !important; font-weight: 600; }
        .rp-nav-active::before {
          content: '';
          position: absolute;
          inset: -5px -8px;
          background: radial-gradient(ellipse, rgba(184,134,11,0.1) 0%, transparent 70%);
          border-radius: 6px;
          pointer-events: none;
        }

        /* ── Logo glow on hover ── */
        .rp-logo { transition: transform 0.25s ease, filter 0.25s ease; }
        .rp-logo:hover {
          transform: scale(1.04);
          filter: drop-shadow(0 0 8px rgba(212,175,55,0.5));
        }

        /* ── Mobile menu: 3D drop-in entrance ── */
        @keyframes rp-dropin {
          from { opacity: 0; transform: perspective(500px) rotateX(-6deg) translateY(-10px); }
          to   { opacity: 1; transform: perspective(500px) rotateX(0deg)  translateY(0px); }
        }
        .rp-mobile-menu {
          animation: rp-dropin 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
          transform-origin: top center;
        }

        /* ── Mobile links: stagger slide-in ── */
        @keyframes rp-slidein {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .rp-mob-link {
          opacity: 0;
          animation: rp-slidein 0.25s ease forwards;
          transition: color 0.18s ease, padding-left 0.18s ease;
        }
        .rp-mob-link:nth-child(1)  { animation-delay: 0.04s; }
        .rp-mob-link:nth-child(2)  { animation-delay: 0.08s; }
        .rp-mob-link:nth-child(3)  { animation-delay: 0.12s; }
        .rp-mob-link:nth-child(4)  { animation-delay: 0.16s; }
        .rp-mob-link:nth-child(5)  { animation-delay: 0.20s; }
        .rp-mob-link:nth-child(6)  { animation-delay: 0.24s; }
        .rp-mob-link:nth-child(7)  { animation-delay: 0.28s; }
        .rp-mob-link:nth-child(8)  { animation-delay: 0.32s; }
        .rp-mob-link:nth-child(9)  { animation-delay: 0.36s; }
        .rp-mob-link:nth-child(10) { animation-delay: 0.40s; }

        .rp-mob-link:hover { color: #B8860B !important; padding-left: 4px; }
        .rp-mob-active     { color: #B8860B !important; font-weight: 600; }
      `}</style>

      <header className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">

            {/* Logo & Home Link — added rp-logo class only */}
            <Link href="/" className="flex items-center space-x-2 group rp-logo">
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

            {/* Desktop Navigation — changed color classes + added rp-nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`rp-nav text-sm font-medium transition ${
                  pathname === '/'
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`rp-nav text-sm font-medium transition ${
                  pathname?.startsWith('/shop')
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className={`rp-nav text-sm font-medium transition ${
                  pathname?.startsWith('/about')
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                About
              </Link>
              <Link
                href="/faq"
                className={`rp-nav text-sm font-medium transition ${
                  pathname?.startsWith('/faq')
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Faq
              </Link>
              <Link
                href="/baskets"
                className={`rp-nav text-sm font-medium transition ${
                  pathname?.startsWith('/baskets')
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                My Baskets
              </Link>
              <Link
                href="/contact"
                className={`rp-nav text-sm font-medium transition ${
                  pathname?.startsWith('/contact')
                    ? 'rp-nav-active text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Contact
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

            {/* Right Section: Icons — untouched */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <BasketIcon />

              {/* User Menu (Desktop) — untouched */}
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
                          href="/shop"
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
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#B8860B] dark:hover:text-[#D4AF37] transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium px-3 py-1 bg-[#1B5E20] text-white rounded hover:bg-[#2E7D32] transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button — untouched */}
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

          {/* Mobile Menu — same structure as original, added rp-mobile-menu + frosted glass + gold colors */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 rp-mobile-menu">
              {/* frosted glass card wrapping the original border-t nav */}
              <div
                className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                style={{
                  background: 'rgba(255,253,250,0.95)',
                  backdropFilter: 'blur(18px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
                }}
              >
                {/* 2px gold accent bar at top */}
                <div style={{ height: '2px', background: 'linear-gradient(90deg,#B8860B,#D4AF37,#E3B347,transparent)' }} />

                <nav className="flex flex-col space-y-0 px-4 py-2 dark:bg-[#161616]/95">
                  <Link
                    href="/"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname === '/' ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname?.startsWith('/shop') ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/about"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname?.startsWith('/about') ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/faq"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname?.startsWith('/faq') ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/contact"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname?.startsWith('/contact') ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/baskets"
                    className={`rp-mob-link text-sm font-medium py-3 border-b border-gray-100 dark:border-gray-800 ${pathname?.startsWith('/baskets') ? 'rp-mob-active' : 'text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Baskets
                  </Link>

                  {user ? (
                    <>
                      <div className="rp-mob-link pt-3 border-t border-gray-200 dark:border-gray-700 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 pb-2">
                          Logged in as: {user.email}
                        </p>
                        <Link
                          href="/profile"
                          className="block text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-[#B8860B] py-2 transition"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {userRole === 'admin' && !isAdminRoute && (
                          <Link
                            href="/admin"
                            className="block text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 py-2 transition"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        {isAdminRoute && (
                          <Link
                            href="/shop"
                            className="block text-sm font-medium text-[#B8860B] hover:text-[#D4AF37] py-2 transition"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Back to Store
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 py-2 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rp-mob-link flex flex-col space-y-2 pt-3 pb-1">
                      <Link
                        href="/login"
                        className="text-sm font-semibold text-center py-2.5 rounded-lg border-2 border-[#D4AF37] text-[#B8860B] hover:bg-[#D4AF37]/10 transition"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="text-sm font-semibold text-center bg-[#1B5E20] text-white px-3 py-2.5 rounded-lg hover:bg-[#2E7D32] transition"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
