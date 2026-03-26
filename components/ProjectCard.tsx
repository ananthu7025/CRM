'use client'

import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { Project } from '@/drizzle/schema'

interface Props {
  project: Project
  onEdit: (p: Project) => void
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const router = useRouter()

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="group relative bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:shadow-md hover:border-[#FF5E8D]/30 transition-all duration-200">
      <div className="mb-3">
        <h3 className="font-semibold text-[#0F172A] text-base mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-[#94A3B8] mt-4">
        <span className="font-medium text-[#FF5E8D] text-sm">
          {project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : '—'}
        </span>
        <span>{fmt(project.startDate)} → {fmt(project.endDate)}</span>
      </div>

      <div className="absolute inset-0 rounded-2xl bg-white/95 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
        <button
          onClick={() => router.push(`/projects/${project.id}`)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F3F7] hover:bg-[#FF5E8D] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={() => onEdit(project)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F3F7] hover:bg-[#0F172A] hover:text-white text-[#475569] text-xs font-medium transition-colors"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFF1F5] hover:bg-red-500 hover:text-white text-red-400 text-xs font-medium transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}
