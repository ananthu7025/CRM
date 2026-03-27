'use client'

import { useState } from 'react'
import type { Lead } from '@/drizzle/schema'

const fieldClass = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

interface LeadFormProps {
  initial?: Partial<Lead>
  onSubmit: (data: Partial<Lead>) => Promise<void>
  submitLabel?: string
}

export default function LeadForm({ initial, onSubmit, submitLabel = 'Save Lead' }: LeadFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    website: initial?.website ?? '',
    location: initial?.location ?? '',
    industry: initial?.industry ?? '',
    notes: initial?.notes ?? '',
    status: initial?.status ?? 'not_contacted',
  })
  const [loading, setLoading] = useState(false)

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      ...form,
      phone: form.phone || null,
      website: form.website || null,
      location: form.location || null,
      industry: form.industry || null,
      notes: form.notes || null,
    } as Partial<Lead>)
    setLoading(false)
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Business Name *</label>
          <input required className={fieldClass} placeholder="e.g. Acme Corp" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Email *</label>
          <input required type="email" className={fieldClass} placeholder="contact@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Phone</label>
          <input className={fieldClass} placeholder="+91 98765 43210" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Website</label>
          <input className={fieldClass} placeholder="https://..." value={form.website ?? ''} onChange={e => set('website', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Location</label>
          <input className={fieldClass} placeholder="City, Country" value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Industry</label>
          <input className={fieldClass} placeholder="e.g. IT company, Law firm" value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Status</label>
          <select className={fieldClass} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="not_contacted">Not Contacted</option>
            <option value="contacted">Contacted</option>
            <option value="responded">Responded</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Notes</label>
        <textarea className={`${fieldClass} resize-none`} rows={3} placeholder="Internal notes about this lead…" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
