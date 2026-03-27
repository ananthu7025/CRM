import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const [row] = await db
    .update(leads)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(leads).where(eq(leads.id, id))
  return NextResponse.json({ success: true })
}
