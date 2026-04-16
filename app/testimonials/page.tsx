'use client'

import { useEffect, useState, useCallback } from 'react'
import { Testimonial } from '@/drizzle/schema'
import TestimonialCard from '@/components/TestimonialCard'
import TestimonialForm from '@/components/TestimonialForm'
import Modal from '@/components/Modal'
import { Plus } from 'lucide-react'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/testimonials')
    const data = await res.json()
    setTestimonials(data.testimonials)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const testimonial = await res.json()
    setTestimonials((t) => [testimonial, ...t])
    setShowModal(false)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setShowModal(true)
  }

  const handleUpdate = async (data: any) => {
    if (!editingTestimonial) return
    const res = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setTestimonials((t) => t.map((x) => (x.id === editingTestimonial.id ? updated : x)))
    setShowModal(false)
    setEditingTestimonial(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    setTestimonials((t) => t.filter((x) => x.id !== id))
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    const updated = await res.json()
    setTestimonials((t) => t.map((x) => (x.id === id ? updated : x)))
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTestimonial(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Testimonials</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{testimonials.length} testimonials</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-[#FF5E8D] hover:bg-[#E14F79] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Testimonial
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-[#E2E8F0] rounded mb-3 w-2/3"></div>
              <div className="h-3 bg-[#E2E8F0] rounded mb-4 w-1/2"></div>
              <div className="h-20 bg-[#E2E8F0] rounded mb-4"></div>
              <div className="h-8 bg-[#E2E8F0] rounded"></div>
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">No testimonials yet</h2>
          <p className="text-sm text-[#94A3B8]">Add your first client testimonial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
          onClose={closeModal}
        >
          <TestimonialForm
            initial={editingTestimonial || undefined}
            onSubmit={editingTestimonial ? handleUpdate : handleAdd}
            submitLabel={editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
          />
        </Modal>
      )}
    </div>
  )
}
