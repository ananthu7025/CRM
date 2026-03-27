'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Menu } from 'lucide-react'

const contextActions: Record<string, { label: string; href: string }> = {
  '/projects': { label: 'New Project', href: '/projects/new' },
  '/meetings': { label: 'Schedule Meeting', href: '/meetings/new' },
}

function getContextAction(pathname: string) {
  for (const [path, action] of Object.entries(contextActions)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      if (pathname === path) return action
    }
    if (pathname === path) return action
  }
  return contextActions[pathname] ?? null
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const action = getContextAction(pathname)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-14 bg-white border-b border-[#E2E8F0] flex items-center px-4 md:px-6 gap-3 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F8FB] text-[#475569]"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        {action && (
          <Link
            href={action.href}
            className="bg-[#FF5E8D] hover:bg-[#E14F79] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            + <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">New</span>
          </Link>
        )}
        <div className="flex items-center gap-2 sm:gap-3 text-sm text-[#475569] font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5E8D]/10 flex items-center justify-center">
              <User size={15} className="text-[#FF5E8D]" />
            </div>
            <span className="hidden sm:inline">Admin</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF1F5] text-[#94A3B8] hover:text-red-500 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
