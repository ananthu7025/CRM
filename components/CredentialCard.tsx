'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Pencil, Trash2, Link, User, KeyRound, StickyNote } from 'lucide-react'

export interface CredentialData {
  id: string
  projectId: string
  label: string
  username?: string | null
  password?: string | null
  url?: string | null
  notes?: string | null
  createdAt: string | Date
}

interface Props {
  credential: CredentialData
  onEdit: (c: CredentialData) => void
  onDelete: (id: string) => void
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="ml-1 text-[#94A3B8] hover:text-[#FF5E8D] transition-colors flex-shrink-0" title="Copy">
      {copied ? <span className="text-[10px] font-medium text-green-500">Copied!</span> : <Copy size={11} />}
    </button>
  )
}

function MaskedField({ value, icon }: { value: string; icon: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#94A3B8] flex-shrink-0">{icon}</span>
      <span
        className="text-sm text-[#0F172A] font-mono flex-1 min-w-0 truncate transition-all"
        style={{ filter: show ? 'none' : 'blur(4px)', userSelect: show ? 'text' : 'none' }}
      >
        {value}
      </span>
      <button onClick={() => setShow(v => !v)} className="text-[#94A3B8] hover:text-[#FF5E8D] transition-colors flex-shrink-0">
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      {show && <CopyButton value={value} />}
    </div>
  )
}

export default function CredentialCard({ credential, onEdit, onDelete }: Props) {
  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:shadow-md hover:border-[#FF5E8D]/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF5E8D]/10 flex items-center justify-center flex-shrink-0">
            <KeyRound size={14} className="text-[#FF5E8D]" />
          </div>
          <span className="font-semibold text-[#0F172A] text-sm">{credential.label}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(credential)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F3F7] text-[#94A3B8] hover:text-[#0F172A] transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(credential.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {credential.username && (
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] flex-shrink-0"><User size={12} /></span>
            <span className="text-sm text-[#475569] flex-1 truncate">{credential.username}</span>
            <CopyButton value={credential.username} />
          </div>
        )}

        {credential.password && (
          <MaskedField value={credential.password} icon={<KeyRound size={12} />} />
        )}

        {credential.url && (
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] flex-shrink-0"><Link size={12} /></span>
            <a
              href={credential.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FF5E8D] hover:underline flex-1 truncate"
            >
              {credential.url}
            </a>
            <CopyButton value={credential.url} />
          </div>
        )}

        {credential.notes && (
          <div className="flex items-start gap-2 pt-1 mt-1 border-t border-[#F1F3F7]">
            <span className="text-[#94A3B8] mt-0.5 flex-shrink-0"><StickyNote size={12} /></span>
            <p className="text-xs text-[#94A3B8] line-clamp-2">{credential.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
