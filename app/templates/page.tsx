'use client'

import { useEffect, useState, useCallback } from 'react'
import Modal from '@/components/Modal'
import type { EmailTemplate } from '@/drizzle/schema'
import { FileText, Plus, Pencil, Trash2, Eye } from 'lucide-react'

const fieldClass = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

const SAMPLE = { name: 'Acme Corp', company: 'Acme Corp', website: 'acme.com', location: 'Chennai' }

function preview(text: string) {
  return text
    .replace(/\{\{name\}\}/g, SAMPLE.name)
    .replace(/\{\{company\}\}/g, SAMPLE.company)
    .replace(/\{\{website\}\}/g, SAMPLE.website)
    .replace(/\{\{location\}\}/g, SAMPLE.location)
}

function TemplateForm({ initial, onSubmit, submitLabel = 'Save Template' }: {
  initial?: Partial<EmailTemplate>
  onSubmit: (data: { name: string; subject: string; body: string }) => Promise<void>
  submitLabel?: string
}) {
  const [form, setForm] = useState({ name: initial?.name ?? '', subject: initial?.subject ?? '', body: initial?.body ?? '' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Template Name *</label>
        <input required className={fieldClass} placeholder="e.g. Cold outreach v1" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Subject Line *</label>
        <input required className={fieldClass} placeholder="e.g. Partnership opportunity for {{company}}" value={form.subject} onChange={e => set('subject', e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-[#475569]">Email Body *</label>
          <div className="flex gap-1 text-xs">
            {(['edit', 'preview'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`px-2 py-0.5 rounded-md capitalize transition-colors ${tab === t ? 'bg-[#FF5E8D] text-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {tab === 'edit' ? (
          <textarea required className={`${fieldClass} resize-y font-mono text-xs`} rows={10}
            placeholder={'Hi {{name}},\n\nI came across {{company}} and wanted to reach out...\n\nBest,\nLuminousLogics Team'}
            value={form.body} onChange={e => set('body', e.target.value)} />
        ) : (
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F7F8FB] text-sm text-[#475569] min-h-[200px] whitespace-pre-wrap font-sans">
            <p className="text-xs text-[#94A3B8] mb-2 font-medium">Preview with sample data:</p>
            <p className="font-medium text-xs text-[#0F172A] mb-3">Subject: {preview(form.subject)}</p>
            <hr className="border-[#E2E8F0] mb-3" />
            {preview(form.body)}
          </div>
        )}
      </div>
      <p className="text-xs text-[#94A3B8]">
        Variables: <code className="bg-[#F1F5F9] px-1 rounded">{'{{name}}'}</code> <code className="bg-[#F1F5F9] px-1 rounded">{'{{company}}'}</code> <code className="bg-[#F1F5F9] px-1 rounded">{'{{website}}'}</code> <code className="bg-[#F1F5F9] px-1 rounded">{'{{location}}'}</code>
      </p>
      <button type="submit" disabled={loading}
        className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/email-templates')
    setTemplates(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (data: { name: string; subject: string; body: string }) => {
    const res = await fetch('/api/email-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const row = await res.json()
    setTemplates(t => [row, ...t])
    setAdding(false)
  }

  const handleEdit = async (data: { name: string; subject: string; body: string }) => {
    if (!editing) return
    const res = await fetch(`/api/email-templates/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const updated = await res.json()
    setTemplates(t => t.map(x => x.id === editing.id ? updated : x))
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/email-templates/${id}`, { method: 'DELETE' })
    setTemplates(t => t.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Email Templates</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 bg-[#FF5E8D] hover:bg-[#E14F79] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Template
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />)}</div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
            <FileText size={24} className="text-[#FF5E8D]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">No templates yet</p>
          <p className="text-sm text-[#94A3B8]">Create a reusable email template to use in campaigns.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="group bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-all">
              <div className="min-w-0">
                <p className="font-semibold text-[#0F172A]">{t.name}</p>
                <p className="text-xs text-[#6366F1] mt-0.5 truncate">{t.subject}</p>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{t.body}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setPreviewing(t)} title="Preview"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7] text-[#94A3B8] hover:text-[#6366F1]">
                  <Eye size={14} />
                </button>
                <button onClick={() => setEditing(t)} title="Edit"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7] text-[#94A3B8] hover:text-[#FF5E8D]">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(t.id)} title="Delete"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <Modal title="New Template" onClose={() => setAdding(false)} width="max-w-2xl"><TemplateForm onSubmit={handleAdd} /></Modal>}
      {editing && <Modal title="Edit Template" onClose={() => setEditing(null)} width="max-w-2xl"><TemplateForm initial={editing} onSubmit={handleEdit} submitLabel="Update Template" /></Modal>}
      {previewing && (
        <Modal title={`Preview — ${previewing.name}`} onClose={() => setPreviewing(null)} width="max-w-2xl">
          <div className="space-y-3">
            <div className="bg-[#F7F8FB] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] mb-1">Subject</p>
              <p className="font-medium text-sm text-[#0F172A]">{preview(previewing.subject)}</p>
            </div>
            <div className="bg-[#F7F8FB] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] mb-2">Body</p>
              <pre className="text-sm text-[#475569] whitespace-pre-wrap font-sans leading-relaxed">{preview(previewing.body)}</pre>
            </div>
            <p className="text-xs text-[#94A3B8] text-center">Previewed with sample data (Acme Corp, Chennai)</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
