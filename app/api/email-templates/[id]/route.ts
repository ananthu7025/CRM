import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailTemplates } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const [row] = await db.update(emailTemplates).set(body).where(eq(emailTemplates.id, id)).returning()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(emailTemplates).where(eq(emailTemplates.id, id))
  return NextResponse.json({ success: true })
}
