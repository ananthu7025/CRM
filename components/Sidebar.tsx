'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CalendarDays, Bell, GitBranch } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Meetings', href: '/meetings', icon: CalendarDays },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Timeline', href: '/timeline', icon: GitBranch },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#E2E8F0] flex flex-col z-40">
      <div className="px-6 py-5 border-b border-[#E2E8F0]">
        <Image src="/logo.svg" alt="LuminousTracker" width={140} height={36} priority />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-[#FF5E8D]/10 text-[#FF5E8D]'
                  : 'text-[#475569] hover:bg-[#F1F3F7] hover:text-[#0F172A]'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-6 py-4 border-t border-[#E2E8F0]">
        <p className="text-xs text-[#94A3B8]">v1.0.0 · Internal Tool</p>
      </div>
    </aside>
  )
}
