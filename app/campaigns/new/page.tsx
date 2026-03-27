'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EmailTemplate, Lead } from '@/drizzle/schema'
import { ArrowLeft, Search, CheckSquare, Square, Eye } from 'lucide-react'
import Link from 'next/link'

const fieldClass = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

function substitute(template: string, lead: Lead): string {
  return template
    .replace(/\{\{name\}\}/g, lead.name)
    .replace(/\{\{company\}\}/g, lead.name)
    .replace(/\{\{website\}\}/g, lead.website ?? '')
    .replace(/\{\{location\}\}/g, lead.location ?? '')
}

type Step = 1 | 2 | 3

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/email-templates').then(r => r.json()),
      fetch('/api/leads').then(r => r.json()),
    ]).then(([t, l]) => { setTemplates(t); setAllLeads(l) })
  }, [])

  const applyTemplate = (id: string) => {
    setSelectedTemplateId(id)
    const t = templates.find(x => x.id === id)
    if (t) { setSubject(t.subject); setBody(t.body) }
  }

  const toggleLead = (id: string) => {
    setSelectedLeads(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    const visible = filtered.map(l => l.id)
    const allSelected = visible.every(id => selectedLeads.has(id))
    setSelectedLeads(s => {
      const n = new Set(s)
      allSelected ? visible.forEach(id => n.delete(id)) : visible.forEach(id => n.add(id))
      return n
    })
  }

  const filtered = allLeads.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase())
  )

  const previewLead = allLeads.find(l => selectedLeads.has(l.id)) ?? allLeads[0]

  const create = async () => {
    setSubmitting(true)
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject, body, templateId: selectedTemplateId || undefined, leadIds: Array.from(selectedLeads) }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) router.push(`/campaigns/${data.id}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] text-[#94A3B8] transition-all">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-bold text-[#0F172A]">New Campaign</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === s ? 'bg-[#FF5E8D] text-white' : step > s ? 'bg-[#10B981] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
            }`}>{step > s ? '✓' : s}</div>
            <span className={`text-sm ${step === s ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}>
              {['Compose', 'Select Leads', 'Preview'][i]}
            </span>
            {i < 2 && <div className="w-8 h-px bg-[#E2E8F0]" />}
          </div>
        ))}
      </div>

      {/* Step 1: Compose */}
      {step === 1 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Campaign Name *</label>
            <input className={fieldClass} placeholder="e.g. Chennai IT Outreach Jan 2026" value={name} onChange={e => setName(e.target.value)} />
          </div>
          {templates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">Load from Template</label>
              <select className={fieldClass} value={selectedTemplateId} onChange={e => applyTemplate(e.target.value)}>
                <option value="">— Write manually —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Subject Line *</label>
            <input className={fieldClass} placeholder="e.g. Quick question for {{company}}" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">Email Body *</label>
            <textarea className={`${fieldClass} resize-y font-mono text-xs`} rows={10}
              placeholder={'Hi {{name}},\n\nI came across {{company}} and...\n\nBest,\nLuminousLogics'}
              value={body} onChange={e => setBody(e.target.value)} />
            <p className="text-xs text-[#94A3B8] mt-1">Variables: {'{{name}}'} {'{{company}}'} {'{{website}}'} {'{{location}}'}</p>
          </div>
          <button onClick={() => setStep(2)} disabled={!name || !subject || !body}
            className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            Next: Select Leads →
          </button>
        </div>
      )}

      {/* Step 2: Select leads */}
      {step === 2 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#0F172A]">{selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected</p>
            <button onClick={toggleAll} className="text-xs text-[#FF5E8D] hover:underline">
              {filtered.every(l => selectedLeads.has(l.id)) ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D]"
              placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {filtered.map(lead => (
              <button key={lead.id} onClick={() => toggleLead(lead.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  selectedLeads.has(lead.id) ? 'bg-[#FF5E8D]/5 border border-[#FF5E8D]/30' : 'bg-[#F7F8FB] border border-transparent hover:border-[#E2E8F0]'
                }`}>
                {selectedLeads.has(lead.id)
                  ? <CheckSquare size={16} className="text-[#FF5E8D] flex-shrink-0" />
                  : <Square size={16} className="text-[#94A3B8] flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{lead.name}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{lead.email}</p>
                </div>
                {lead.industry && <span className="ml-auto text-[10px] bg-[#6366F1]/10 text-[#6366F1] px-2 py-0.5 rounded-full flex-shrink-0">{lead.industry}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl text-sm hover:bg-[#F7F8FB] transition-colors">← Back</button>
            <button onClick={() => setStep(3)} disabled={selectedLeads.size === 0}
              className="flex-1 bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
              Next: Preview →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview + Create */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={16} className="text-[#FF5E8D]" />
              <p className="font-semibold text-[#0F172A] text-sm">Email Preview</p>
              {previewLead && <span className="text-xs text-[#94A3B8]">for {previewLead.name}</span>}
            </div>
            {previewLead ? (
              <>
                <div className="bg-[#F7F8FB] rounded-xl p-3">
                  <p className="text-xs text-[#94A3B8] mb-1">Subject</p>
                  <p className="text-sm font-medium text-[#0F172A]">{substitute(subject, previewLead)}</p>
                </div>
                <div className="bg-[#F7F8FB] rounded-xl p-3">
                  <p className="text-xs text-[#94A3B8] mb-2">Body</p>
                  <pre className="text-sm text-[#475569] whitespace-pre-wrap font-sans leading-relaxed">{substitute(body, previewLead)}</pre>
                </div>
              </>
            ) : <p className="text-sm text-[#94A3B8]">No leads selected.</p>}
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0F172A]">{name}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} · Will be sent immediately</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 border border-[#E2E8F0] text-[#475569] py-2.5 rounded-xl text-sm hover:bg-[#F7F8FB] transition-colors">← Back</button>
            <button onClick={create} disabled={submitting}
              className="flex-1 bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
              {submitting ? 'Creating…' : 'Create Campaign →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
