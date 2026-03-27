'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isAuth) return <>{children}</>

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Topbar onMenuClick={() => setSidebarOpen(v => !v)} />
      <main className="md:ml-60 pt-14 min-h-screen">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </>
  )
}
