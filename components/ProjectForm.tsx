'use client'

import { useState } from 'react'
import type { Project } from '@/drizzle/schema'

interface Props {
  initial?: Partial<Project>
  onSubmit: (data: Partial<Project>) => Promise<void>
  submitLabel?: string
}

export default function ProjectForm({ initial = {}, onSubmit, submitLabel = 'Save' }: Props) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    description: initial.description ?? '',
    budget: initial.budget ?? '',
    startDate: initial.startDate ?? '',
    endDate: initial.endDate ?? '',
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
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Project Name *</label>
        <input
          required
          className={field}
          placeholder="e.g. Website Redesign"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Description</label>
        <textarea
          className={`${field} resize-none`}
          rows={3}
          placeholder="What is this project about?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Budget (₹)</label>
        <input
          type="number"
          className={field}
          placeholder="0.00"
          value={form.budget}
          onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Start Date</label>
          <input
            type="date"
            className={field}
            value={form.startDate ?? ''}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">End Date</label>
          <input
            type="date"
            className={field}
            value={form.endDate ?? ''}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
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
