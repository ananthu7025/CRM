'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Campaign } from '@/drizzle/schema'
import { Send, Plus, Trash2, CheckCircle2, Clock, Loader2 } from 'lucide-react'

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: 'bg-[#94A3B8]/15 text-[#64748B]', icon: Clock },
  sending:   { label: 'Sending',   color: 'bg-[#F59E0B]/15 text-[#F59E0B]', icon: Loader2 },
  completed: { label: 'Completed', color: 'bg-[#10B981]/15 text-[#10B981]', icon: CheckCircle2 },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/campaigns')
    setCampaigns(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
    setCampaigns(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Campaigns</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/campaigns/new"
          className="flex items-center gap-1.5 bg-[#FF5E8D] hover:bg-[#E14F79] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
            <Send size={24} className="text-[#FF5E8D]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">No campaigns yet</p>
          <p className="text-sm text-[#94A3B8]">Create a campaign to start cold emailing leads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
            const StatusIcon = cfg.icon
            return (
              <Link key={c.id} href={`/campaigns/${c.id}`}
                className="group flex items-center justify-between bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-sm hover:border-[#CBD5E1] transition-all">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#0F172A]">{c.name}</p>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <StatusIcon size={10} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] truncate">{c.subject}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                    <span>{c.totalLeads} leads</span>
                    {c.status === 'completed' && (
                      <>
                        <span className="text-[#10B981]">✓ {c.sentCount} sent</span>
                        {c.failedCount > 0 && <span className="text-red-400">✗ {c.failedCount} failed</span>}
                      </>
                    )}
                    {c.sentAt && <span>{new Date(c.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <button onClick={e => { e.preventDefault(); handleDelete(c.id) }}
                  className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
