'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MeetingForm from '@/components/MeetingForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/drizzle/schema'
import type { MeetingData } from '@/components/MeetingForm'

export default function NewMeetingPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

  const handleSubmit = async (data: MeetingData) => {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/meetings')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/meetings" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all text-[#94A3B8]">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Schedule Meeting</h1>
          <p className="text-xs text-[#94A3B8]">Set up a new meeting for a project</p>
        </div>
      </div>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <MeetingForm projects={projects} onSubmit={handleSubmit} submitLabel="Schedule Meeting" />
      </div>
    </div>
  )
}
