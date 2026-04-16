'use client'

import { useState } from 'react'
import { Testimonial } from '@/drizzle/schema'

interface TestimonialFormProps {
  initial?: Partial<Testimonial>
  onSubmit: (data: Partial<Testimonial>) => Promise<void>
  submitLabel?: string
}

export default function TestimonialForm({ initial, onSubmit, submitLabel = 'Create Testimonial' }: TestimonialFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    company: initial?.company || '',
    avatar: initial?.avatar || '',
    testimonial: initial?.testimonial || '',
    active: initial?.active ?? true,
    displayOrder: initial?.displayOrder?.toString() || '0',
  })
  const [loading, setLoading] = useState(false)

  const fieldClass = 'border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] outline-none w-full transition-colors'
  const labelClass = 'text-xs font-medium text-[#475569] mb-1.5'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.testimonial) return

    setLoading(true)
    try {
      await onSubmit({
        name: form.name,
        company: form.company || null,
        avatar: form.avatar || null,
        testimonial: form.testimonial,
        active: form.active,
        displayOrder: parseInt(form.displayOrder),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Client name or company"
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Company</label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="Company name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Avatar / Logo URL</label>
        <input
          type="text"
          value={form.avatar}
          onChange={(e) => setForm({ ...form, avatar: e.target.value })}
          placeholder="/images/client-logo.svg"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Testimonial *</label>
        <textarea
          value={form.testimonial}
          onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
          placeholder="Client testimonial quote"
          rows={3}
          className={fieldClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
            placeholder="0"
            className={fieldClass}
          />
        </div>
        <div />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="w-4 h-4 rounded accent-[#FF5E8D]"
        />
        <span className="text-xs font-medium text-[#475569]">Active</span>
      </label>

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
