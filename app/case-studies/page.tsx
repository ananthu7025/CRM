'use client'

import { useEffect, useState, useCallback } from 'react'
import { CaseStudy } from '@/drizzle/schema'
import CaseStudyCard from '@/components/CaseStudyCard'
import CaseStudyForm from '@/components/CaseStudyForm'
import Modal from '@/components/Modal'
import { Plus } from 'lucide-react'

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/case-studies')
    const data = await res.json()
    setCaseStudies(data.projects || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (data: any) => {
    const res = await fetch('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const caseStudy = await res.json()
    setCaseStudies((c) => [caseStudy, ...c])
    setShowModal(false)
  }

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy)
    setShowModal(true)
  }

  const handleUpdate = async (data: any) => {
    if (!editingCaseStudy) return
    const res = await fetch(`/api/case-studies/${editingCaseStudy.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setCaseStudies((c) => c.map((x) => (x.id === editingCaseStudy.id ? updated : x)))
    setShowModal(false)
    setEditingCaseStudy(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case study?')) return
    await fetch(`/api/case-studies/${id}`, { method: 'DELETE' })
    setCaseStudies((c) => c.filter((x) => x.id !== id))
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    const res = await fetch(`/api/case-studies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    })
    const updated = await res.json()
    setCaseStudies((c) => c.map((x) => (x.id === id ? updated : x)))
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCaseStudy(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Case Studies</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{caseStudies.length} case studies</p>
        </div>
        <button
          onClick={() => {
            setEditingCaseStudy(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-[#FF5E8D] hover:bg-[#E14F79] text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Case Study
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 animate-pulse">
              <div className="h-32 bg-[#E2E8F0] rounded mb-4"></div>
              <div className="h-4 bg-[#E2E8F0] rounded mb-3 w-2/3"></div>
              <div className="h-3 bg-[#E2E8F0] rounded mb-4 w-1/2"></div>
              <div className="h-20 bg-[#E2E8F0] rounded mb-4"></div>
              <div className="h-8 bg-[#E2E8F0] rounded"></div>
            </div>
          ))}
        </div>
      ) : caseStudies.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">💼</div>
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">No case studies yet</h2>
          <p className="text-sm text-[#94A3B8]">Add your first case study to showcase your work</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard
              key={caseStudy.id}
              caseStudy={caseStudy}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editingCaseStudy ? 'Edit Case Study' : 'New Case Study'}
          onClose={closeModal}
        >
          <CaseStudyForm
            initial={editingCaseStudy || undefined}
            onSubmit={editingCaseStudy ? handleUpdate : handleAdd}
            submitLabel={editingCaseStudy ? 'Update Case Study' : 'Create Case Study'}
          />
        </Modal>
      )}
    </div>
  )
}
