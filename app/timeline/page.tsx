import { db } from '@/lib/db'
import { projects, meetings } from '@/drizzle/schema'
import { asc } from 'drizzle-orm'
import { GitBranch } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TimelinePage() {
  const [allProjects, allMeetings] = await Promise.all([
    db.select().from(projects).orderBy(asc(projects.startDate)),
    db.select().from(meetings).orderBy(asc(meetings.datetime)),
  ])

  type TimelineEvent = {
    id: string
    type: 'project-start' | 'project-end' | 'meeting'
    label: string
    sub: string
    date: Date
    color: string
  }

  const events: TimelineEvent[] = [
    ...allProjects.flatMap(p => {
      const items: TimelineEvent[] = []
      if (p.startDate)
        items.push({ id: `ps-${p.id}`, type: 'project-start', label: p.name, sub: 'Project started', date: new Date(p.startDate), color: '#FF5E8D' })
      if (p.endDate)
        items.push({ id: `pe-${p.id}`, type: 'project-end', label: p.name, sub: 'Project ends', date: new Date(p.endDate), color: '#E14F79' })
      return items
    }),
    ...allMeetings.map(m => ({
      id: `m-${m.id}`,
      type: 'meeting' as const,
      label: m.title,
      sub: 'Meeting',
      date: new Date(m.datetime),
      color: '#10B981',
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Timeline</h1>
        <p className="text-sm text-[#94A3B8] mt-1">All project and meeting events in chronological order</p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
            <GitBranch size={24} className="text-[#FF5E8D]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">No timeline events yet</p>
          <p className="text-sm text-[#94A3B8]">Add projects and meetings to see them here.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[140px] top-0 bottom-0 w-px bg-[#E2E8F0]" />
          <div className="space-y-0">
            {events.map((ev, i) => (
              <div key={ev.id} className="flex items-start gap-0">
                <div className="w-[140px] flex-shrink-0 text-right pr-5 pt-3">
                  <p className="text-xs text-[#94A3B8]">
                    {ev.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {ev.type === 'meeting' && (
                    <p className="text-[10px] text-[#94A3B8]">
                      {ev.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="relative flex-shrink-0 flex items-center justify-center w-3 mt-3.5">
                  <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: ev.color }} />
                </div>
                <div className={`ml-5 pb-6 ${i === events.length - 1 ? '' : ''}`}>
                  <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 hover:shadow-sm hover:border-[#FF5E8D]/20 transition-all">
                    <p className="text-sm font-semibold text-[#0F172A]">{ev.label}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{ev.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
