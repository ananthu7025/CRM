import { db } from '@/lib/db'
import { projects, notes, meetings } from '@/drizzle/schema'
import { desc, sql } from 'drizzle-orm'
import StatsCard from '@/components/StatsCard'
import Link from 'next/link'
import { FolderKanban, FileText, CalendarDays, Clock, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [projectCount, noteCount, meetingCount, recentProjects, upcomingMeetings] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(notes),
    db.select({ count: sql<number>`count(*)` }).from(meetings),
    db.select().from(projects).orderBy(desc(projects.createdAt)).limit(4),
    db.select().from(meetings).orderBy(desc(meetings.datetime)).limit(4),
  ])

  const stats = [
    { label: 'Total Projects', value: Number(projectCount[0].count), icon: <FolderKanban size={20} />, color: '#FF5E8D' },
    { label: 'Total Notes', value: Number(noteCount[0].count), icon: <FileText size={20} />, color: '#6366F1' },
    { label: 'Total Meetings', value: Number(meetingCount[0].count), icon: <CalendarDays size={20} />, color: '#10B981' },
    { label: 'Total Hours', value: '—', icon: <Clock size={20} />, color: '#F59E0B' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F172A] text-sm">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-[#FF5E8D] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No projects yet.</p>
            ) : (
              recentProjects.map(p => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F7F8FB] transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#FF5E8D] transition-colors">{p.name}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{p.description?.slice(0, 50)}…</p>
                  </div>
                  {p.budget && (
                    <span className="text-xs font-semibold text-[#FF5E8D] ml-3 flex-shrink-0">
                      ₹{Number(p.budget).toLocaleString('en-IN')}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F172A] text-sm">Upcoming Meetings</h2>
            <Link href="/meetings" className="text-xs text-[#FF5E8D] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {upcomingMeetings.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No meetings yet.</p>
            ) : (
              upcomingMeetings.map(m => {
                const dt = new Date(m.datetime)
                return (
                  <div key={m.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F7F8FB] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{m.title}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
                        {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#FF5E8D] flex-shrink-0" />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
