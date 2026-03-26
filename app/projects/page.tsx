'use client'

import { useEffect, useState, useCallback } from 'react'
import ProjectCard from '@/components/ProjectCard'
import Modal from '@/components/Modal'
import ProjectForm from '@/components/ProjectForm'
import type { Project } from '@/drizzle/schema'
import { FolderKanban } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editProject, setEditProject] = useState<Project | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This will also delete all its notes and meetings.')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(p => p.filter(x => x.id !== id))
  }

  const handleEdit = async (data: Partial<Project>) => {
    if (!editProject) return
    const res = await fetch(`/api/projects/${editProject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const updated = await res.json()
    setProjects(p => p.map(x => (x.id === editProject.id ? updated : x)))
    setEditProject(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Projects</h1>
        <p className="text-sm text-[#94A3B8] mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
            <FolderKanban size={24} className="text-[#FF5E8D]" />
          </div>
          <p className="text-[#0F172A] font-semibold mb-1">No projects yet</p>
          <p className="text-sm text-[#94A3B8]">Click &quot;New Project&quot; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={setEditProject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(null)}>
          <ProjectForm initial={editProject} onSubmit={handleEdit} submitLabel="Update Project" />
        </Modal>
      )}
    </div>
  )
}
