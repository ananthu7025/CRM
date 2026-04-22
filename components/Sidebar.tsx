'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CalendarDays, Bell, GitBranch, Users, Send, FileText, X, BookOpen, MessageSquare, Briefcase, Mail, Receipt } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Invoices', href: '/invoices', icon: Receipt },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Campaigns', href: '/campaigns', icon: Send },
  { label: 'Templates', href: '/templates', icon: FileText },
  { label: 'Meetings', href: '/meetings', icon: CalendarDays },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Timeline', href: '/timeline', icon: GitBranch },
]

const websiteItems = [
  { label: 'Blog Posts', href: '/blog-posts', icon: BookOpen },
  { label: 'Testimonials', href: '/testimonials', icon: MessageSquare },
  { label: 'Case Studies', href: '/case-studies', icon: Briefcase },
  { label: 'Contact Form', href: '/contact-form', icon: Mail },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={`fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#E2E8F0] flex flex-col z-40 transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="LuminousTracker" width={32} height={41} priority />
          <span className="text-[#FF5E8D] font-bold text-lg tracking-tight leading-tight">Luminous<br/>Tracker</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7] text-[#94A3B8]"
        >
          <X size={16} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
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

        <div className="my-4 pt-4 border-t border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide px-3 mb-2">Website</p>
          {websiteItems.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
        </div>
      </nav>
      <div className="px-6 py-4 border-t border-[#E2E8F0]">
        <p className="text-xs text-[#94A3B8]">v1.0.0 · Internal Tool</p>
      </div>
    </aside>
  )
}
