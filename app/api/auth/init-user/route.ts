import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

// One-time endpoint to register the admin user from env
export async function POST() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'ADMIN_EMAIL not set' }, { status: 400 })

  const [existing] = await db.select().from(users).where(eq(users.email, email))
  if (existing) return NextResponse.json({ message: 'User already exists', user: existing })

  const [user] = await db.insert(users).values({ email, name: 'Admin' }).returning()
  return NextResponse.json({ message: 'Admin user created', user }, { status: 201 })
}
