'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

interface SendRow {
  id: string
  status: string
  messageId: string | null
  sentAt: string | null
  leadId: string
  leadName: string | null
  leadEmail: string | null
}

interface CampaignDetail {
  id: string
  name: string
  subject: string
  body: string
  status: string
  totalLeads: number
  sentCount: number
  failedCount: number
  createdAt: string
  sentAt: string | null
  sends: SendRow[]
}

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: 'bg-[#94A3B8]/15 text-[#64748B]' },
  sending:   { label: 'Sending',   color: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
  completed: { label: 'Completed', color: 'bg-[#10B981]/15 text-[#10B981]' },
}

const SEND_STATUS = {
  pending: { icon: Clock, color: 'text-[#94A3B8]' },
  sent:    { icon: CheckCircle2, color: 'text-[#10B981]' },
  failed:  { icon: XCircle, color: 'text-red-400' },
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${id}`)
    if (!res.ok) { router.push('/campaigns'); return }
    setCampaign(await res.json())
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  const sendCampaign = async () => {
    if (!confirm(`Send emails to ${campaign?.totalLeads} leads now?`)) return
    setSending(true)
    const res = await fetch(`/api/campaigns/${id}/send`, { method: 'POST' })
    const data = await res.json()
    setSending(false)
    if (res.ok) { setResult(data); await load() }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-white rounded-xl animate-pulse" />
      <div className="h-40 bg-white rounded-2xl animate-pulse" />
    </div>
  )
  if (!campaign) return null

  const cfg = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] text-[#94A3B8] transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A] truncate">{campaign.name}</h1>
            <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">{campaign.totalLeads} leads · Created {new Date(campaign.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        {campaign.status === 'draft' && (
          <button onClick={sendCampaign} disabled={sending}
            className="flex items-center gap-2 bg-[#FF5E8D] hover:bg-[#E14F79] disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0">
            {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Now</>}
          </button>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-4 text-sm text-[#10B981] font-medium">
          ✓ Campaign sent! {result.sent} delivered{result.failed > 0 ? `, ${result.failed} failed` : ''}.
        </div>
      )}

      {/* Stats */}
      {campaign.status === 'completed' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: campaign.totalLeads, color: '#6366F1' },
            { label: 'Sent', value: campaign.sentCount, color: '#10B981' },
            { label: 'Failed', value: campaign.failedCount, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Email preview */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-[#0F172A]">Email Content</p>
        <div className="bg-[#F7F8FB] rounded-xl p-3">
          <p className="text-xs text-[#94A3B8] mb-1">Subject</p>
          <p className="text-sm font-medium text-[#0F172A]">{campaign.subject}</p>
        </div>
        <div className="bg-[#F7F8FB] rounded-xl p-3">
          <p className="text-xs text-[#94A3B8] mb-2">Body</p>
          <pre className="text-sm text-[#475569] whitespace-pre-wrap font-sans leading-relaxed line-clamp-6">{campaign.body}</pre>
        </div>
      </div>

      {/* Lead send statuses */}
      <div>
        <p className="text-sm font-semibold text-[#0F172A] mb-3">Leads ({campaign.sends.length})</p>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          {campaign.sends.map((s, i) => {
            const sc = SEND_STATUS[s.status as keyof typeof SEND_STATUS] ?? SEND_STATUS.pending
            const Icon = sc.icon
            return (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? 'border-t border-[#F1F5F9]' : ''}`}>
                <Icon size={15} className={sc.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{s.leadName}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{s.leadEmail}</p>
                </div>
                <span className="text-xs text-[#94A3B8] flex-shrink-0">
                  {s.status === 'sent' && s.sentAt ? new Date(s.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : s.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
