import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otps, users } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check user exists in DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))

    if (!user) {
      // Don't reveal whether email is registered — silently succeed
      return NextResponse.json({ success: true })
    }

    // Invalidate any existing unused OTPs for this email
    await db
      .update(otps)
      .set({ used: true })
      .where(and(eq(otps.email, email.toLowerCase()), eq(otps.used, false)))

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await db.insert(otps).values({
      email: email.toLowerCase(),
      code,
      expiresAt,
    })

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key') {
      const { data, error } = await resend.emails.send({
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
      if (error) {
        console.error('Resend error:', error)
      } else {
        console.log('Email sent, id:', data?.id)
      }
    } else {
      // Development fallback — log to console
      console.log(`\n🔐 OTP for ${email}: ${code}\n`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
