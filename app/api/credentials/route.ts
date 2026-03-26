import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { credentials } from '@/drizzle/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const rows = await db
    .select()
    .from(credentials)
    .where(eq(credentials.projectId, projectId))
    .orderBy(desc(credentials.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const [row] = await db
    .insert(credentials)
    .values({
      projectId: body.projectId,
      label: body.label,
      username: body.username,
      password: body.password,
      url: body.url,
      notes: body.notes,
    })
    .returning()
  return NextResponse.json(row, { status: 201 })
}
