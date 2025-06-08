import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import FloatingChatWidget from '@/components/FloatingChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finora - AI-Powered Financial Burn Risk Coach',
  description: 'Analyze your monthly expense-to-income burn risk with AI-powered insights and recommendations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_32.png" />
        <link rel="shortcut icon" href="/favicon_32.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Fixed Navbar */}
        <nav className="fixed top-0 left-0 w-full h-14 bg-white shadow z-50 flex items-center justify-between px-6">
          <img src="/finora-logo.png" alt="Finora Logo" className="h-10 w-auto" />
          <a href="https://www.producthunt.com/products/finora?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-finora" target="_blank" rel="noopener noreferrer">
            <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=975162&theme=light&t=1749367183195" alt="Finora - Your AI-powered financial burn risk coach | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
          </a>
        </nav>
        {/* Main content with top padding for navbar */}
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <FloatingChatWidget />
      </body>
    </html>
  )
} 
