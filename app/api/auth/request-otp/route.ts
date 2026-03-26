import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otps, users } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { Resend } from 'resend'
import { rateLimit, getIp } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

// Cryptographically secure 6-digit OTP
function generateOtp(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000 + ''
}

export async function POST(req: Request) {
  // Rate limit: 3 OTP requests per IP per 15 minutes
  const ip = getIp(req)
  if (!rateLimit(`request-otp:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before requesting another code.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Check user exists in DB
    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
      // Don't reveal whether the email is registered
      return NextResponse.json({ success: true })
    }

    // Invalidate any existing unused OTPs for this email
    await db
      .update(otps)
      .set({ used: true })
      .where(and(eq(otps.email, email), eq(otps.used, false)))

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await db.insert(otps).values({ email, code, expiresAt })

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key') {
      const { error } = await resend.emails.send({
        from: 'LuminousTracker <onboarding@resend.dev>',
        to: email,
        subject: 'Your LuminousTracker OTP',
        html: `
          <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px;">
            <h2 style="color:#FF5E8D;margin-bottom:8px;">LuminousTracker</h2>
            <p style="color:#475569;margin-bottom:24px;">Use the code below to sign in. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#F7F8FB;border:1px solid #E2E8F0;border-radius:16px;padding:24px;text-align:center;">
              <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0F172A;">${code}</span>
            </div>
            <p style="color:#94A3B8;font-size:12px;margin-top:24px;">If you did not request this, ignore this email.</p>
          </div>
        `,
      })
      if (error) console.error('Resend error:', error)
    }
    // No console.log of OTP code — ever

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
