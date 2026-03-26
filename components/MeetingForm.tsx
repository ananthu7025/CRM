'use client'

import { useState } from 'react'
import type { Project } from '@/drizzle/schema'

export interface MeetingData {
  title?: string | null
  projectId?: string | null
  description?: string | null
  datetime?: string | Date | null
  notes?: string | null
}

interface Props {
  initial?: MeetingData
  projects: Project[]
  onSubmit: (data: MeetingData) => Promise<void>
  submitLabel?: string
}

export default function MeetingForm({ initial = {}, projects, onSubmit, submitLabel = 'Save' }: Props) {
  const toDatetimeLocal = (val: string | Date | null | undefined) => {
    if (!val) return ''
    const d = new Date(val)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const [form, setForm] = useState({
    title: initial.title ?? '',
    projectId: initial.projectId ?? '',
    description: initial.description ?? '',
    datetime: toDatetimeLocal(initial.datetime),
    notes: initial.notes ?? '',
  })
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  const field = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Meeting Title *</label>
        <input
          required
          className={field}
          placeholder="e.g. Kickoff Meeting"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Project *</label>
        <select
          required
          className={field}
          value={form.projectId}
          onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
        >
          <option value="">Select a project…</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Date & Time *</label>
        <input
          required
          type="datetime-local"
          className={field}
          value={form.datetime}
          onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Description</label>
        <textarea
          className={`${field} resize-none`}
          rows={2}
          placeholder="What is this meeting about?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors mt-2"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
