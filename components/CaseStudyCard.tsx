'use client'

import { CaseStudy } from '@/drizzle/schema'
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react'

interface CaseStudyCardProps {
  caseStudy: CaseStudy
  onEdit: (caseStudy: CaseStudy) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, published: boolean) => void
}

export default function CaseStudyCard({ caseStudy, onEdit, onDelete, onTogglePublish }: CaseStudyCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:shadow-md transition-shadow">
      {caseStudy.thumbnail && (
        <img
          src={caseStudy.thumbnail}
          alt={caseStudy.title}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-1 truncate">{caseStudy.title}</h3>
          <p className="text-xs text-[#94A3B8] truncate">{caseStudy.slug}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${
            caseStudy.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {caseStudy.published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {caseStudy.industry && <p className="text-xs text-[#475569]">🏢 <span className="font-medium">{caseStudy.industry}</span></p>}
        {caseStudy.stack && <p className="text-xs text-[#475569]">⚙️ <span className="font-medium">{caseStudy.stack}</span></p>}
      </div>

      {caseStudy.description && <p className="text-xs text-[#475569] mb-4 line-clamp-2">{caseStudy.description}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onTogglePublish(caseStudy.id, !caseStudy.published)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
          title={caseStudy.published ? 'Unpublish' : 'Publish'}
        >
          {caseStudy.published ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={() => onEdit(caseStudy)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(caseStudy.id)}
          className="px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 text-red-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
