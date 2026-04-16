import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { testimonials } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getSession, checkApiKey } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await getSession()
  const hasApiKey = checkApiKey(req)
  if (!isAuth && !hasApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updates: any = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.company !== undefined) updates.company = body.company?.trim() || null
  if (body.avatar !== undefined) updates.avatar = body.avatar?.trim() || null
  if (body.testimonial !== undefined) updates.testimonial = body.testimonial.trim()
  if (body.active !== undefined) updates.active = body.active
  if (body.displayOrder !== undefined) updates.displayOrder = body.displayOrder

  const [row] = await db.update(testimonials).set(updates).where(eq(testimonials.id, id)).returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await getSession()
  const hasApiKey = checkApiKey(req)
  if (!isAuth && !hasApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.delete(testimonials).where(eq(testimonials.id, id))
  return NextResponse.json({ success: true })
}
