'use client'

import { Pencil, Trash2, Globe, Phone, MapPin, Mail, RefreshCw } from 'lucide-react'
import type { Lead } from '@/drizzle/schema'

const STATUS_CONFIG = {
  not_contacted: { label: 'Not Contacted', color: 'bg-[#94A3B8]/15 text-[#64748B]' },
  contacted:     { label: 'Contacted',     color: 'bg-[#6366F1]/15 text-[#6366F1]' },
  responded:     { label: 'Responded',     color: 'bg-[#10B981]/15 text-[#10B981]' },
}

const NEXT_STATUS: Record<string, string> = {
  not_contacted: 'contacted',
  contacted: 'responded',
  responded: 'not_contacted',
}

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export default function LeadCard({ lead, onEdit, onDelete, onStatusChange }: LeadCardProps) {
  const cfg = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_contacted

  return (
    <div className="group relative bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#0F172A] truncate">{lead.name}</p>
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1.5 text-xs text-[#6366F1] hover:underline mt-0.5 truncate"
          >
            <Mail size={11} />
            {lead.email}
          </a>
        </div>
        <button
          onClick={() => onStatusChange(lead.id, NEXT_STATUS[lead.status] ?? 'not_contacted')}
          title="Click to cycle status"
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80 ${cfg.color}`}
        >
          <RefreshCw size={10} />
          {cfg.label}
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-[#475569]">
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-[#94A3B8] flex-shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-[#94A3B8] flex-shrink-0" />
            <a
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-[#FF5E8D] hover:underline"
            >
              {lead.website}
            </a>
          </div>
        )}
        {lead.location && (
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-[#94A3B8] flex-shrink-0" />
            <span className="truncate">{lead.location}</span>
          </div>
        )}
        {lead.notes && (
          <p className="text-[#94A3B8] italic mt-2 line-clamp-2">{lead.notes}</p>
        )}
      </div>

      {/* Source badge */}
      {lead.source === 'csv' && (
        <span className="absolute bottom-4 right-4 text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
          CSV
        </span>
      )}

      {/* Hover actions */}
      <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl px-1.5 py-1 shadow-sm">
        <button
          onClick={() => onEdit(lead)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7] text-[#94A3B8] hover:text-[#FF5E8D] transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(lead.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
