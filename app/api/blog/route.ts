/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogs } from '@/drizzle/schema'
import { desc, eq } from 'drizzle-orm'
import { getSession, checkApiKey } from '@/lib/auth'
import { withCors } from '@/lib/cors'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
  const isAuth = await getSession()

  // If authenticated, return all blogs (including unpublished); otherwise only published
  let rows: any
  if (isAuth) {
    let query = db.select().from(blogs).orderBy(desc(blogs.publishDate))
    rows = limit ? await query.limit(limit) : await query
  } else {
    let query = db.select().from(blogs).where(eq(blogs.published, true)).orderBy(desc(blogs.publishDate))
    rows = limit ? await query.limit(limit) : await query
  }

  const res = NextResponse.json({ blogs: rows })
  return withCors(res)
}

export async function POST(req: Request) {
  const isAuth = await getSession()
  const hasApiKey = checkApiKey(req)
  if (!isAuth && !hasApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, slug, publishDate, thumbnail, tag, author, readTime, description, content, published } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  try {
    const [row] = await db
      .insert(blogs)
      .values({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        publishDate: publishDate ? new Date(publishDate).toISOString().split('T')[0] : null,
        thumbnail: thumbnail?.trim() || null,
        tag: tag?.trim() || null,
        author: author?.trim() || null,
        readTime: readTime ? parseInt(readTime) : null,
        description: description?.trim() || null,
        content: content?.trim() || null,
        published: published ?? false,
      })
      .returning()

    return NextResponse.json(row, { status: 201 })
  } catch (error: any) {
    if (error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    throw error
  }
}
