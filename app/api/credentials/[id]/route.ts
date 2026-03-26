import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { credentials } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const [row] = await db
    .update(credentials)
    .set({
      label: body.label,
      username: body.username,
      password: body.password,
      url: body.url,
      notes: body.notes,
    })
    .where(eq(credentials.id, id))
    .returning()
  return NextResponse.json(row)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(credentials).where(eq(credentials.id, id))
  return NextResponse.json({ success: true })
}
