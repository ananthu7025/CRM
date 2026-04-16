import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { caseStudies } from '@/drizzle/schema'
import { desc, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { withCors } from '@/lib/cors'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
  const isAuth = await getSession()

  // If authenticated, return all case studies; otherwise only published
  let rows: any
  if (isAuth) {
    let query = db.select().from(caseStudies).orderBy(desc(caseStudies.createdAt))
    rows = limit ? await query.limit(limit) : await query
  } else {
    let query = db.select().from(caseStudies).where(eq(caseStudies.published, true)).orderBy(desc(caseStudies.createdAt))
    rows = limit ? await query.limit(limit) : await query
  }

  const res = NextResponse.json({ projects: rows })
  return withCors(res)
}

export async function POST(req: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, slug, thumbnail, industry, stack, description, content, published } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  try {
    const [row] = await db
      .insert(caseStudies)
      .values({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        thumbnail: thumbnail?.trim() || null,
        industry: industry?.trim() || null,
        stack: stack?.trim() || null,
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
