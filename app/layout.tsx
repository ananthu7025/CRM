import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LuminousTracker',
  description: 'Internal project and meeting management tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F7F8FB]`}>
        <Sidebar />
        <Topbar />
        <main className="ml-60 pt-14 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  )
}
