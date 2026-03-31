'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import LeadCard from '@/components/LeadCard'
import LeadForm from '@/components/LeadForm'
import Modal from '@/components/Modal'
import type { Lead } from '@/drizzle/schema'
import { Users, Upload, Plus, MapPin, Loader2 } from 'lucide-react'

type StatusFilter = 'all' | 'not_contacted' | 'contacted' | 'responded' | 'bookmarked' | 'favorited'

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_contacted', label: 'Not Contacted' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'responded', label: 'Responded' },
  { key: 'bookmarked', label: 'Bookmarked' },
  { key: 'favorited', label: 'Favorites' },
]

const fieldClass = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] transition-all'

function ScrapeModal({ onClose, onDone }: { onClose: () => void; onDone: (msg: string) => void }) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [maxResults, setMaxResults] = useState('20')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/leads/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, location, maxResults: Number(maxResults) }),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(result.error ?? 'Scrape failed')
      return
    }
    onDone(`Scraped ${result.imported} leads from Google Maps${result.skipped ? ` (${result.skipped} skipped)` : ''}.`)
    onClose()
  }

  return (
    <form onSubmit={run} className="space-y-4">
      <div className="bg-[#F7F8FB] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs text-[#475569] flex items-start gap-2">
        <MapPin size={13} className="text-[#FF5E8D] mt-0.5 flex-shrink-0" />
        Searches Google Maps for businesses matching your keyword and location. Results are automatically added as leads.
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Keyword / Industry *</label>
        <input
          required
          className={fieldClass}
          placeholder="e.g. IT company, web design agency, law firm"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Location *</label>
        <input
          required
          className={fieldClass}
          placeholder="e.g. Chennai, India"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1.5">Max Results</label>
        <select className={fieldClass} value={maxResults} onChange={e => setMaxResults(e.target.value)}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="60">60</option>
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Scraping… this may take 1–2 minutes
          </>
        ) : (
          <>
            <MapPin size={14} /> Scrape Google Maps
          </>
        )}
      </button>
    </form>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StatusFilter>('all')
  const [industryFilter, setIndustryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [addingLead, setAddingLead] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [scraping, setScraping] = useState(false)
  const [importing, setImporting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/leads')
    const data = await res.json()
    setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Unique industry and location values for dropdowns
  const industries = Array.from(new Set(leads.map(l => l.industry).filter(Boolean))) as string[]
  const locations = Array.from(new Set(leads.map(l => l.location).filter(Boolean))) as string[]

  const filtered = leads.filter(l => {
    if (tab === 'bookmarked') {
      if (!l.bookmarked) return false
    } else if (tab === 'favorited') {
      if (!l.favorited) return false
    } else if (tab !== 'all' && l.status !== tab) {
      return false
    }
    
    if (industryFilter && l.industry !== industryFilter) return false
    if (locationFilter && l.location !== locationFilter) return false
    return true
  })

  const showMsg = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 6000)
  }

  const handleAdd = async (data: Partial<Lead>) => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const row = await res.json()
    setLeads(l => [row, ...l])
    setAddingLead(false)
  }

  const handleEdit = async (data: Partial<Lead>) => {
    if (!editLead) return
    const res = await fetch(`/api/leads/${editLead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setLeads(l => l.map(x => x.id === editLead.id ? updated : x))
    setEditLead(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(l => l.filter(x => x.id !== id))
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updated = await res.json()
    setLeads(l => l.map(x => x.id === id ? updated : x))
  }

  const handleToggleBookmark = async (id: string, currentValue: boolean) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: !currentValue }),
    })
    const updated = await res.json()
    setLeads(l => l.map(x => x.id === id ? updated : x))
  }

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorited: !currentValue }),
    })
    const updated = await res.json()
    setLeads(l => l.map(x => x.id === id ? updated : x))
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const text = await file.text()
    const res = await fetch('/api/leads/import', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: text,
    })
    const result = await res.json()
    if (res.ok) {
      showMsg(`Imported ${result.imported} leads${result.skipped ? `, skipped ${result.skipped}` : ''}.`)
      await load()
    } else {
      showMsg(result.error ?? 'Import failed')
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const tabCount = (key: StatusFilter) => {
    const base = leads.filter(l => {
      if (industryFilter && l.industry !== industryFilter) return false
      if (locationFilter && l.location !== locationFilter) return false
      return true
    })
    if (key === 'all') return base.length
    if (key === 'bookmarked') return base.filter(l => l.bookmarked).length
    if (key === 'favorited') return base.filter(l => l.favorited).length
    return base.filter(l => l.status === key).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Leads</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusMsg && (
            <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg w-full sm:w-auto">{statusMsg}</span>
          )}
          <button
            onClick={() => setScraping(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#FF5E8D] border border-[#FF5E8D]/30 hover:bg-[#FF5E8D]/5 px-3 py-2 rounded-lg transition-colors"
          >
            <MapPin size={14} /> Scrape Leads
          </button>
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#475569] border border-[#E2E8F0] hover:bg-[#F7F8FB] px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <Upload size={14} />
            <span>{importing ? 'Importing…' : 'Import CSV'}</span>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} disabled={importing} />
          </label>
          <button
            onClick={() => setAddingLead(true)}
            className="flex items-center gap-1.5 bg-[#FF5E8D] hover:bg-[#E14F79] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-[#FF5E8D] text-white shadow-sm'
                : 'text-[#475569] hover:bg-[#F7F8FB]'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
              {tabCount(key)}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {(industries.length > 0 || locations.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {industries.length > 0 && (
            <select
              value={industryFilter}
              onChange={e => setIndustryFilter(e.target.value)}
              className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] bg-white"
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
          {locations.length > 0 && (
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#FF5E8D]/30 focus:border-[#FF5E8D] bg-white"
            >
              <option value="">All Locations</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
          {(industryFilter || locationFilter) && (
            <button
              onClick={() => { setIndustryFilter(''); setLocationFilter('') }}
              className="text-xs text-[#94A3B8] hover:text-[#475569] px-2 py-1 rounded-lg hover:bg-[#F7F8FB] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
            <Users size={24} className="text-[#FF5E8D]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">
            {tab === 'all' ? 'No leads yet' : `No ${TABS.find(t => t.key === tab)?.label} leads`}
          </p>
          <p className="text-sm text-[#94A3B8]">
            {tab === 'all' ? 'Use "Scrape Leads", "Add Lead", or "Import CSV" to get started.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={setEditLead}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onToggleBookmark={handleToggleBookmark}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {scraping && (
        <Modal title="Scrape Leads from Google Maps" onClose={() => setScraping(false)}>
          <ScrapeModal
            onClose={() => setScraping(false)}
            onDone={async (msg) => { showMsg(msg); await load() }}
          />
        </Modal>
      )}

      {addingLead && (
        <Modal title="Add Lead" onClose={() => setAddingLead(false)}>
          <LeadForm onSubmit={handleAdd} submitLabel="Add Lead" />
        </Modal>
      )}

      {editLead && (
        <Modal title="Edit Lead" onClose={() => setEditLead(null)}>
          <LeadForm initial={editLead} onSubmit={handleEdit} submitLabel="Update Lead" />
        </Modal>
      )}
    </div>
  )
}
