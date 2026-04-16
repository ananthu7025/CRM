import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFormSubmissions } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

export async function GET(req: Request) {

  const rows = await db
    .select()
    .from(contactFormSubmissions)
    .orderBy(desc(contactFormSubmissions.createdAt))

  return NextResponse.json({ submissions: rows })
}
