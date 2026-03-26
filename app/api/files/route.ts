import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { files } from '@/drizzle/schema'
import { eq, desc } from 'drizzle-orm'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const rows = await db
    .select()
    .from(files)
    .where(eq(files.projectId, projectId))
    .orderBy(desc(files.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const projectId = formData.get('projectId') as string | null

  if (!file || !projectId) {
    return NextResponse.json({ error: 'file and projectId are required' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 50 MB.' }, { status: 413 })
  }

  const blob = await put(`projects/${projectId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
    contentType: file.type,
  })

  const [row] = await db
    .insert(files)
    .values({
      projectId,
      name: file.name,
      url: blob.url,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
