import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, X} from 'lucide-react'

export default function Footer() {
  interface IconProps {
  className?: string; // The '?' means it is optional
}

const TikTokIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13 3.44-.3 6.88-.45 10.32-.13 2.13-1.13 4.23-2.94 5.37-2.02 1.34-4.87 1.4-6.91.12-2.12-1.21-3.32-3.7-3.08-6.12.18-2.13 1.54-4.08 3.53-4.87.53-.22 1.1-.34 1.67-.4V17c-.88.13-1.74.55-2.28 1.25-.56.7-.76 1.64-.53 2.51.22.88.88 1.6 1.72 1.95 1.12.49 2.5.29 3.42-.48.86-.68 1.25-1.76 1.23-2.83-.11-4.03-.26-8.05-.39-12.08l.05-8.3Z" />
  </svg>
);
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">RP Apparels</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Premium fashion for the modern individual. Quality fabrics, timeless designs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]">Shop</Link></li>
              <li><Link href="/baskets" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]">My Baskets</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]">FAQ</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]">About</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+234 812 785 6114</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>rpapparels001@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://instagram.com/rpapparels_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/rpapparels"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]"
              >
                <X className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/rpapparels"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] dark:hover:text-[#E3B347]"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} RP Apparels. All rights reserved.
        </div>
      </div>
    </footer>
  )
}