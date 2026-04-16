'use client'

import { useState } from 'react'
import { CaseStudy } from '@/drizzle/schema'
import ImageUpload from './ImageUpload'

interface CaseStudyFormProps {
  initial?: Partial<CaseStudy>
  onSubmit: (data: Partial<CaseStudy>) => Promise<void>
  submitLabel?: string
}

export default function CaseStudyForm({ initial, onSubmit, submitLabel = 'Create Case Study' }: CaseStudyFormProps) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    thumbnail: initial?.thumbnail || '',
    industry: initial?.industry || '',
    stack: initial?.stack || '',
    description: initial?.description || '',
    content: initial?.content || '',
    published: initial?.published ?? false,
  })
  const [loading, setLoading] = useState(false)

  const fieldClass = 'border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] outline-none w-full transition-colors'
  const labelClass = 'text-xs font-medium text-[#475569] mb-1.5'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) return

    setLoading(true)
    try {
      await onSubmit({
        title: form.title,
        slug: form.slug,
        thumbnail: form.thumbnail || null,
        industry: form.industry || null,
        stack: form.stack || null,
        description: form.description || null,
        content: form.content || null,
        published: form.published,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Project Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Project name"
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Slug *</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="project-slug"
          className={fieldClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Industry</label>
          <input
            type="text"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="Healthcare"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tech Stack</label>
          <input
            type="text"
            value={form.stack}
            onChange={(e) => setForm({ ...form, stack: e.target.value })}
            placeholder="Next.js, React, Node.js"
            className={fieldClass}
          />
        </div>
      </div>

      <ImageUpload
        value={form.thumbnail}
        onChange={(url) => setForm({ ...form, thumbnail: url })}
        folder="case-studies"
        label="Project Thumbnail"
      />

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief project description (shown in list view)"
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Full Content</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Detailed case study content (markdown supported)"
          rows={6}
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="w-4 h-4 rounded accent-[#FF5E8D]"
        />
        <span className="text-xs font-medium text-[#475569]">Published</span>
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
