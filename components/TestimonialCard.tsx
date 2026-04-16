'use client'

import { Testimonial } from '@/drizzle/schema'
import { Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react'

interface TestimonialCardProps {
  testimonial: Testimonial
  onEdit: (testimonial: Testimonial) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}

export default function TestimonialCard({ testimonial, onEdit, onDelete, onToggleActive }: TestimonialCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[#0F172A] text-sm mb-0.5">{testimonial.name}</h3>
          {testimonial.company && <p className="text-xs text-[#94A3B8]">{testimonial.company}</p>}
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${
            testimonial.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {testimonial.active ? 'Active' : 'Hidden'}
        </span>
      </div>

      <p className="text-xs text-[#475569] mb-4 line-clamp-3 italic">"{testimonial.testimonial}"</p>

      {testimonial.avatar && (
        <div className="mb-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleActive(testimonial.id, !testimonial.active)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
          title={testimonial.active ? 'Hide' : 'Show'}
        >
          {testimonial.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </button>
        <button
          onClick={() => onEdit(testimonial)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-[#F1F3F7] text-[#475569] transition-colors"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(testimonial.id)}
          className="px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 text-red-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
