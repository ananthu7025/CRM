'use client'

import { useRouter } from 'next/navigation'
import ProjectForm from '@/components/ProjectForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/drizzle/schema'

export default function NewProjectPage() {
  const router = useRouter()

  const handleSubmit = async (data: Partial<Project>) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/projects')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all text-[#94A3B8]">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">New Project</h1>
          <p className="text-xs text-[#94A3B8]">Fill in the details to create a project</p>
        </div>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" />
      </div>
    </div>
  )
}
