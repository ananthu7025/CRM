import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otps } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { createSession } from '@/lib/auth'

const MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const [otp] = await db
      .select()
      .from(otps)
      .where(and(eq(otps.email, email.toLowerCase()), eq(otps.used, false)))
      .orderBy(otps.createdAt)
      .limit(1)

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Check expiry
    if (new Date() > new Date(otp.expiresAt)) {
      await db.update(otps).set({ used: true }).where(eq(otps.id, otp.id))
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }

    // Check attempts
    if (otp.attempts >= MAX_ATTEMPTS) {
      await db.update(otps).set({ used: true }).where(eq(otps.id, otp.id))
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 400 })
    }

    // Wrong code
    if (otp.code !== code.trim()) {
      await db.update(otps).set({ attempts: otp.attempts + 1 }).where(eq(otps.id, otp.id))
      const remaining = MAX_ATTEMPTS - otp.attempts - 1
      return NextResponse.json({ error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }, { status: 400 })
    }

    // Mark used
    await db.update(otps).set({ used: true }).where(eq(otps.id, otp.id))

    // Create session cookie
    await createSession()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
