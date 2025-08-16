import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LoveConnect - Find Your Perfect Match',
  description: 'A modern dating app built with Next.js and Zoho Catalyst integration. Connect with people, chat, and find meaningful relationships.',
  keywords: 'dating, relationships, chat, video calls, matches',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
