'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NoteCard from '@/components/NoteCard'
import CredentialCard from '@/components/CredentialCard'
import Modal from '@/components/Modal'
import StatsCard from '@/components/StatsCard'
import { ArrowLeft, FileText, CalendarDays, Clock, Plus, Send, KeyRound } from 'lucide-react'
import Link from 'next/link'
import type { Project, Meeting } from '@/drizzle/schema'
import type { NoteData } from '@/components/NoteCard'
import type { CredentialData } from '@/components/CredentialCard'

interface ProjectDetail extends Project {
  notes: NoteData[]
  meetings: Meeting[]
}

const fieldClass = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

function CredentialForm({
  initial,
  onSubmit,
  submitLabel = 'Save',
}: {
  initial?: Partial<CredentialData>
  onSubmit: (data: Partial<CredentialData>) => Promise<void>
  submitLabel?: string
}) {
  const [form, setForm] = useState({
    label: initial?.label ?? '',
    username: initial?.username ?? '',
    password: initial?.password ?? '',
    url: initial?.url ?? '',
    notes: initial?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Label / Service Name *</label>
        <input required className={fieldClass} placeholder="e.g. AWS Console, GitHub, DB" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Username / Email</label>
        <input className={fieldClass} placeholder="username or email" value={form.username ?? ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className={`${fieldClass} pr-10 font-mono`}
            placeholder="••••••••"
            value={form.password ?? ''}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#FF5E8D]">
            {showPass ? '🙈' : '👁'}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">URL</label>
        <input className={fieldClass} placeholder="https://..." value={form.url ?? ''} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Notes</label>
        <textarea className={`${fieldClass} resize-none`} rows={2} placeholder="Any extra info…" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [creds, setCreds] = useState<CredentialData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandNote, setExpandNote] = useState<NoteData | null>(null)
  const [editNote, setEditNote] = useState<NoteData | null>(null)
  const [editContent, setEditContent] = useState('')
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addingCred, setAddingCred] = useState(false)
  const [editCred, setEditCred] = useState<CredentialData | null>(null)

  const load = useCallback(async () => {
    const [projRes, credRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/credentials?projectId=${id}`),
    ])
    if (!projRes.ok) { router.push('/projects'); return }
    const [projData, credData] = await Promise.all([projRes.json(), credRes.json()])
    setProject(projData)
    setCreds(credData)
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const addNote = async () => {
    if (!newNote.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, content: newNote.trim() }),
    })
    const note = await res.json()
    setProject(p => p ? { ...p, notes: [note, ...p.notes] } : p)
    setNewNote('')
    setAddingNote(false)
    setSubmitting(false)
  }

  const saveNote = async () => {
    if (!editNote) return
    const res = await fetch(`/api/notes/${editNote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })
    const updated = await res.json()
    setProject(p => p ? { ...p, notes: p.notes.map(n => n.id === editNote.id ? updated : n) } : p)
    setEditNote(null)
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
    setProject(p => p ? { ...p, notes: p.notes.filter(n => n.id !== noteId) } : p)
  }

  const addCred = async (data: Partial<CredentialData>) => {
    const res = await fetch('/api/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, projectId: id }),
    })
    const row = await res.json()
    setCreds(c => [row, ...c])
    setAddingCred(false)
  }

  const saveCred = async (data: Partial<CredentialData>) => {
    if (!editCred) return
    const res = await fetch(`/api/credentials/${editCred.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setCreds(c => c.map(x => x.id === editCred.id ? updated : x))
    setEditCred(null)
  }

  const deleteCred = async (credId: string) => {
    if (!confirm('Delete this credential?')) return
    await fetch(`/api/credentials/${credId}`, { method: 'DELETE' })
    setCreds(c => c.filter(x => x.id !== credId))
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-white rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
      </div>
    </div>
  )

  if (!project) return null

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all text-[#94A3B8]">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">{project.name}</h1>
          <p className="text-xs text-[#94A3B8]">{fmt(project.startDate)} → {fmt(project.endDate)}</p>
        </div>
        {project.budget && (
          <span className="ml-auto text-sm font-bold text-[#FF5E8D]">
            ₹{Number(project.budget).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {project.description && (
        <p className="text-sm text-[#475569] leading-relaxed bg-white border border-[#E2E8F0] rounded-2xl p-4">
          {project.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatsCard label="Notes" value={project.notes.length} icon={<FileText size={18} />} color="#6366F1" />
        <StatsCard label="Meetings" value={project.meetings.length} icon={<CalendarDays size={18} />} color="#10B981" />
        <StatsCard label="Total Hours" value="—" icon={<Clock size={18} />} color="#F59E0B" />
      </div>

      {/* Credentials Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-[#FF5E8D]" />
            <h2 className="font-semibold text-[#0F172A]">Credentials</h2>
            {creds.length > 0 && (
              <span className="text-xs bg-[#FF5E8D]/10 text-[#FF5E8D] font-medium px-2 py-0.5 rounded-full">{creds.length}</span>
            )}
          </div>
          <button
            onClick={() => setAddingCred(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#FF5E8D] hover:bg-[#FF5E8D]/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Credential
          </button>
        </div>

        {creds.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
            <KeyRound size={20} className="text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm text-[#94A3B8]">No credentials yet. Store passwords, API keys, and access info securely.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {creds.map(c => (
              <CredentialCard key={c.id} credential={c} onEdit={setEditCred} onDelete={deleteCred} />
            ))}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#6366F1]" />
            <h2 className="font-semibold text-[#0F172A]">Project Notes</h2>
            {project.notes.length > 0 && (
              <span className="text-xs bg-[#6366F1]/10 text-[#6366F1] font-medium px-2 py-0.5 rounded-full">{project.notes.length}</span>
            )}
          </div>
          <button
            onClick={() => setAddingNote(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#6366F1] hover:bg-[#6366F1]/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Note
          </button>
        </div>

        {addingNote && (
          <div className="bg-white border-2 border-[#6366F1]/30 rounded-2xl p-4 mb-4 transition-all">
            <textarea
              autoFocus
              className="w-full text-sm text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none min-h-[80px]"
              placeholder="Write a note, jot anything…"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote()
                if (e.key === 'Escape') { setAddingNote(false); setNewNote('') }
              }}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F3F7]">
              <span className="text-xs text-[#94A3B8]">⌘↵ to save · Esc to cancel</span>
              <button
                onClick={addNote}
                disabled={submitting || !newNote.trim()}
                className="flex items-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Send size={11} /> Save
              </button>
            </div>
          </div>
        )}

        {project.notes.length === 0 && !addingNote ? (
          <div className="text-center py-10 bg-white border border-dashed border-[#E2E8F0] rounded-2xl">
            <p className="text-sm text-[#94A3B8]">No notes yet. Click &quot;Add Note&quot; to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {project.notes.map((note, i) => (
              <NoteCard
                key={note.id}
                note={note}
                index={i}
                onExpand={setExpandNote}
                onEdit={n => { setEditNote(n); setEditContent(n.content) }}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}
      </div>

      {expandNote && (
        <Modal title="Note" onClose={() => setExpandNote(null)} width="max-w-2xl">
          <pre className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed font-sans">{expandNote.content}</pre>
        </Modal>
      )}

      {editNote && (
        <Modal title="Edit Note" onClose={() => setEditNote(null)} width="max-w-xl">
          <textarea
            className="w-full border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] min-h-[160px]"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <button
            onClick={saveNote}
            className="mt-3 w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Update Note
          </button>
        </Modal>
      )}

      {addingCred && (
        <Modal title="Add Credential" onClose={() => setAddingCred(false)}>
          <CredentialForm onSubmit={addCred} submitLabel="Save Credential" />
        </Modal>
      )}

      {editCred && (
        <Modal title="Edit Credential" onClose={() => setEditCred(null)}>
          <CredentialForm initial={editCred} onSubmit={saveCred} submitLabel="Update Credential" />
        </Modal>
      )}
    </div>
  )
}
