'use client'

import { CalendarDays, Clock, Pencil, Trash2, FileText } from 'lucide-react'

interface MeetingData {
  id: string
  title: string
  projectId: string
  projectName?: string | null
  description?: string | null
  datetime: string | Date
  notes?: string | null
  createdAt: string | Date
}

interface Props {
  meeting: MeetingData
  onViewNotes: (m: MeetingData) => void
  onEdit: (m: MeetingData) => void
  onDelete: (id: string) => void
}

export default function MeetingCard({ meeting, onViewNotes, onEdit, onDelete }: Props) {
  const dt = new Date(meeting.datetime)
  const date = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md hover:border-[#FF5E8D]/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] text-base truncate">{meeting.title}</h3>
          {meeting.projectName && (
            <span className="inline-block mt-1 text-xs font-medium bg-[#FF5E8D]/10 text-[#FF5E8D] px-2 py-0.5 rounded-full">
              {meeting.projectName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#94A3B8] mb-3">
        <span className="flex items-center gap-1"><CalendarDays size={12} />{date}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{time}</span>
      </div>

      {meeting.description && (
        <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed mb-4">{meeting.description}</p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-[#F1F3F7]">
        <button
          onClick={() => onViewNotes(meeting)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F3F7] hover:bg-[#FF5E8D] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <FileText size={12} /> Notes
        </button>
        <button
          onClick={() => onEdit(meeting)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F3F7] hover:bg-[#0F172A] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(meeting.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF1F5] hover:bg-red-500 hover:text-white text-red-400 text-xs font-medium transition-colors ml-auto"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}
