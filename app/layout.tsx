import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { BotIdClient } from 'botid/client'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RP Apparels',
  description: 'Premium fashion for the modern individual',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {/* Use type assertion to bypass the strict type check */}
        <BotIdClient protect={ [ { path: '/', method: 'POST' },
  { path: '/about', method: 'POST' }, { path: '/faq', method: 'POST' }, { path: '/contact', method: 'POST' }, { path: '/shop', method: 'POST' }]} />
      </body>
    </html>
  )
}