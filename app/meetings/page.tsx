'use client'

import { useEffect, useState, useCallback } from 'react'
import MeetingCard from '@/components/MeetingCard'
import Modal from '@/components/Modal'
import MeetingForm from '@/components/MeetingForm'
import type { MeetingData as MeetingFormData } from '@/components/MeetingForm'
import { CalendarDays } from 'lucide-react'
import type { Project } from '@/drizzle/schema'

interface Meeting {
  id: string
  title: string
  projectId: string
  projectName?: string | null
  description?: string | null
  datetime: string | Date
  notes?: string | null
  createdAt: string | Date
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null)
  const [viewNotes, setViewNotes] = useState<Meeting | null>(null)
  const [notesContent, setNotesContent] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const load = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([
      fetch('/api/meetings'),
      fetch('/api/projects'),
    ])
    const [m, p] = await Promise.all([mRes.json(), pRes.json()])
    setMeetings(m)
    setProjects(p)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting?')) return
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    setMeetings(m => m.filter(x => x.id !== id))
  }

  const handleEdit = async (data: MeetingFormData) => {
    if (!editMeeting) return
    const res = await fetch(`/api/meetings/${editMeeting.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    const proj = projects.find(p => p.id === updated.projectId)
    setMeetings(m => m.map(x => x.id === editMeeting.id ? { ...updated, projectName: proj?.name } : x))
    setEditMeeting(null)
  }

  const saveNotes = async () => {
    if (!viewNotes) return
    setSavingNotes(true)
    const res = await fetch(`/api/meetings/${viewNotes.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesContent }),
    })
    const updated = await res.json()
    setMeetings(m => m.map(x => x.id === viewNotes.id ? { ...x, notes: updated.notes } : x))
    setViewNotes(null)
    setSavingNotes(false)
  }

  const filtered = filter ? meetings.filter(m => m.projectId === filter) : meetings

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Meetings</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{filtered.length} meeting{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <select
          className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] bg-white"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mb-4">
            <CalendarDays size={24} className="text-[#10B981]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">No meetings found</p>
          <p className="text-sm text-[#94A3B8]">Click &quot;Schedule Meeting&quot; to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onViewNotes={m => { setViewNotes(m); setNotesContent(m.notes ?? '') }}
              onEdit={setEditMeeting}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editMeeting && (
        <Modal title="Edit Meeting" onClose={() => setEditMeeting(null)}>
          <MeetingForm
            initial={editMeeting}
            projects={projects}
            onSubmit={handleEdit}
            submitLabel="Update Meeting"
          />
        </Modal>
      )}

      {viewNotes && (
        <Modal title={`Notes — ${viewNotes.title}`} onClose={() => setViewNotes(null)} width="max-w-2xl">
          <textarea
            className="w-full border border-[#E2E8F0] rounded-xl p-3.5 text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] min-h-[220px] font-mono"
            placeholder="Add meeting notes here…"
            value={notesContent}
            onChange={e => setNotesContent(e.target.value)}
          />
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-3 w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {savingNotes ? 'Saving…' : 'Save Notes'}
          </button>
        </Modal>
      )}
    </div>
  )
}
