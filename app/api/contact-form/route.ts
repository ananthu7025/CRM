import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFormSubmissions } from '@/drizzle/schema'
import { withCors } from '@/lib/cors'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'noreply@example.com'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, email, subject, message } = body

    // Validation
    if (!name || !phone || !email || !subject || !message) {
      const res = NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
      return withCors(res)
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      const res = NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
      return withCors(res)
    }

    // Store in database
    const [submission] = await db
      .insert(contactFormSubmissions)
      .values({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      })
      .returning()

    // Send confirmation email to user
    await resend.emails.send({
      from: ADMIN_EMAIL,
      to: email,
      subject: 'We received your message',
      html: `
        <h2>Thank you, ${name}!</h2>
        <p>We've received your message and will get back to you shortly.</p>
        <hr />
        <h3>Message Details:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })

    // Send notification email to admin
    await resend.emails.send({
      from: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p><small>Submission ID: ${submission.id}</small></p>
      `,
    })

    const res = NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully',
        id: submission.id,
      },
      { status: 201 }
    )
    return withCors(res)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Contact form error:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    })
    const res = NextResponse.json(
      {
        error: 'Failed to process your request',
        details: errorMessage,
      },
      { status: 500 }
    )
    return withCors(res)
  }
}

export async function GET(req: Request) {
  const res = NextResponse.json({
    message: 'Contact form API endpoint',
    methods: ['POST'],
  })
  return withCors(res)
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}
