'use client'

import { useState } from 'react'
import { Blog } from '@/drizzle/schema'
import ImageUpload from './ImageUpload'

interface BlogFormProps {
  initial?: Partial<Blog>
  onSubmit: (data: Partial<Blog>) => Promise<void>
  submitLabel?: string
}

export default function BlogForm({ initial, onSubmit, submitLabel = 'Create Blog' }: BlogFormProps) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    publishDate: initial?.publishDate || '',
    thumbnail: initial?.thumbnail || '',
    tag: initial?.tag || '',
    author: initial?.author || '',
    readTime: initial?.readTime?.toString() || '',
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
        publishDate: form.publishDate || null,
        thumbnail: form.thumbnail,
        tag: form.tag,
        author: form.author,
        readTime: form.readTime ? parseInt(form.readTime) : null,
        description: form.description,
        content: form.content,
        published: form.published,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Blog post title"
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
          placeholder="blog-post-slug"
          className={fieldClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Publish Date</label>
          <input
            type="date"
            value={form.publishDate}
            onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Read Time (minutes)</label>
          <input
            type="number"
            value={form.readTime}
            onChange={(e) => setForm({ ...form, readTime: e.target.value })}
            placeholder="8"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="Luminous Team"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tag</label>
          <input
            type="text"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            placeholder="Architecture"
            className={fieldClass}
          />
        </div>
      </div>

      <ImageUpload
        value={form.thumbnail}
        onChange={(url) => setForm({ ...form, thumbnail: url })}
        folder="blog"
        label="Blog Thumbnail"
      />

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short excerpt (shown in list view)"
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Content</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Full article content (markdown supported)"
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
