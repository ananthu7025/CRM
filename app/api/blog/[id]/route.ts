/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogs } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Map incoming fields to DB columns
  const updates: any = {}
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.slug !== undefined) updates.slug = body.slug.trim().toLowerCase()
  if (body.publishDate !== undefined) updates.publishDate = body.publishDate ? new Date(body.publishDate).toISOString().split('T')[0] : null
  if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail?.trim() || null
  if (body.tag !== undefined) updates.tag = body.tag?.trim() || null
  if (body.author !== undefined) updates.author = body.author?.trim() || null
  if (body.authorImage !== undefined) updates.authorImage = body.authorImage?.trim() || null
  if (body.readTime !== undefined) updates.readTime = body.readTime ? parseInt(body.readTime) : null
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (body.content !== undefined) updates.content = body.content?.trim() || null
  if (body.published !== undefined) updates.published = body.published

  updates.updatedAt = new Date()

  try {
    const [row] = await db.update(blogs).set(updates).where(eq(blogs.id, id)).returning()

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (error: any) {
    if (error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    throw error
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.delete(blogs).where(eq(blogs.id, id))
  return NextResponse.json({ success: true })
}
