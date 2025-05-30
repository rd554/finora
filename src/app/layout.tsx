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
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <img src="/finora-logo.png" alt="Finora Logo" className="fixed top-4 left-4 h-10 w-auto z-50" />
        <main className="min-h-screen">
          {children}
        </main>
        <FloatingChatWidget />
      </body>
    </html>
  )
} 