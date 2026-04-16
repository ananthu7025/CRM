import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFormSubmissions } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(contactFormSubmissions)
    .orderBy(desc(contactFormSubmissions.createdAt))

  return NextResponse.json({ submissions: rows })
}
