import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { auth } from '@/auth' // Import auth helper

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAG Chatbot',
  description: 'AI Document Assistant',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth(); // Fetch session server-side

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Pass the session to Providers */}
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}