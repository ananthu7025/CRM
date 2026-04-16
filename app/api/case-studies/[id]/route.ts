/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { caseStudies } from '@/drizzle/schema'
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
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.slug !== undefined) updates.slug = body.slug.trim().toLowerCase()
  if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail?.trim() || null
  if (body.industry !== undefined) updates.industry = body.industry?.trim() || null
  if (body.stack !== undefined) updates.stack = body.stack?.trim() || null
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (body.content !== undefined) updates.content = body.content?.trim() || null
  if (body.published !== undefined) updates.published = body.published

  updates.updatedAt = new Date()

  try {
    const [row] = await db.update(caseStudies).set(updates).where(eq(caseStudies.id, id)).returning()

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (error: any) {
    if (error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    throw error
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await getSession()
  const hasApiKey = checkApiKey(req)
  if (!isAuth && !hasApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.delete(caseStudies).where(eq(caseStudies.id, id))
  return NextResponse.json({ success: true })
}
