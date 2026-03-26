'use client'

import { useState } from 'react'
import { Expand, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

export interface NoteData {
  id: string
  content: string
  createdAt: string | Date
}

interface Props {
  note: NoteData
  index: number
  onExpand: (n: NoteData) => void
  onEdit: (n: NoteData) => void
  onDelete: (id: string) => void
}

export default function NoteCard({ note, index, onExpand, onEdit, onDelete }: Props) {
  const [revealed, setRevealed] = useState(false)

  const date = new Date(note.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:shadow-sm hover:border-[#FF5E8D]/20 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#FF5E8D]">Note #{index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealed(v => !v)}
            title={revealed ? 'Hide content' : 'Reveal content'}
            className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#FF5E8D] transition-colors"
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
            {revealed ? 'Hide' : 'Reveal'}
          </button>
          <span className="text-xs text-[#94A3B8]">{date}</span>
        </div>
      </div>

      <div className="relative">
        <p className={`text-sm text-[#475569] line-clamp-3 leading-relaxed whitespace-pre-wrap transition-all duration-300 select-${revealed ? 'text' : 'none'}`}
          style={{ filter: revealed ? 'none' : 'blur(4px)', userSelect: revealed ? 'text' : 'none' }}
        >
          {note.content}
        </p>
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="absolute inset-0 w-full flex items-center justify-center"
            title="Click to reveal"
          >
            <span className="bg-white/80 border border-[#E2E8F0] text-xs font-medium text-[#475569] px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 hover:bg-[#FF5E8D] hover:text-white hover:border-[#FF5E8D] transition-colors">
              <Eye size={11} /> Click to reveal
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F1F3F7] opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onExpand(note)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F3F7] hover:bg-[#FF5E8D] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <Expand size={11} /> View
        </button>
        <button
          onClick={() => onEdit(note)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F3F7] hover:bg-[#0F172A] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <Pencil size={11} /> Edit
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF1F5] hover:bg-red-500 hover:text-white text-red-400 text-xs font-medium transition-colors ml-auto"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </div>
  )
}
