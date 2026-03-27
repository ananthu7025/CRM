import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/drizzle/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const rows = status
    ? await db.select().from(leads).where(eq(leads.status, status)).orderBy(desc(leads.createdAt))
    : await db.select().from(leads).orderBy(desc(leads.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, phone, website, location, notes, status, source } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const [row] = await db.insert(leads).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    website: website?.trim() || null,
    location: location?.trim() || null,
    notes: notes?.trim() || null,
    status: status ?? 'not_contacted',
    source: source ?? 'manual',
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
