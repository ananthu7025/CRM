import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailTemplates } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { name, subject, body } = await req.json()
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'name, subject and body are required' }, { status: 400 })
  }
  const [row] = await db.insert(emailTemplates).values({ name, subject, body }).returning()
  return NextResponse.json(row, { status: 201 })
}
