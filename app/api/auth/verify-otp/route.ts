import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otps } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { createSession } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rate-limit'

const MAX_ATTEMPTS = 5

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i]
  return diff === 0
}

export async function POST(req: Request) {
  // Rate limit: 10 verify attempts per IP per 15 minutes
  const ip = getIp(req)
  if (!rateLimit(`verify-otp:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null
    const code = typeof body?.code === 'string' ? body.code.trim() : null

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Validate code is 6 digits only
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
    }

    const [otp] = await db
      .select()
      .from(otps)
      .where(and(eq(otps.email, email), eq(otps.used, false)))
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

    // Constant-time comparison — prevents timing attacks
    if (!timingSafeEqual(otp.code, code)) {
      await db.update(otps).set({ attempts: otp.attempts + 1 }).where(eq(otps.id, otp.id))
      const remaining = MAX_ATTEMPTS - otp.attempts - 1
      return NextResponse.json({
        error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      }, { status: 400 })
    }

    // Mark used
    await db.update(otps).set({ used: true }).where(eq(otps.id, otp.id))

    await createSession()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
