import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { testimonials } from '@/drizzle/schema'
import { asc, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { withCors } from '@/lib/cors'

export async function GET(req: Request) {
  const isAuth = await getSession()

  // If authenticated, return all testimonials; otherwise only active ones
  let rows: any
  if (isAuth) {
    let query = db.select().from(testimonials).orderBy(asc(testimonials.displayOrder))
    rows = await query
  } else {
    let query = db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(asc(testimonials.displayOrder))
    rows = await query
  }

  const res = NextResponse.json({ testimonials: rows })
  return withCors(res)
}

export async function POST(req: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, company, avatar, testimonial, active, displayOrder } = body

  if (!name || !testimonial) {
    return NextResponse.json({ error: 'Name and testimonial are required' }, { status: 400 })
  }

  const [row] = await db
    .insert(testimonials)
    .values({
      name: name.trim(),
      company: company?.trim() || null,
      avatar: avatar?.trim() || null,
      testimonial: testimonial.trim(),
      active: active ?? true,
      displayOrder: displayOrder ?? 0,
    })
    .returning()

  return NextResponse.json(row, { status: 201 })
}
