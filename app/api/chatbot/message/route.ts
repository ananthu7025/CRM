import { NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'
import { withCors } from '@/lib/cors'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, conversationHistory } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chatbot is not configured' }, { status: 503 })
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const systemPrompt = 'You are Lumos, a helpful assistant for Luminous Logics. You help users learn about our services, portfolio, and how to get in touch. Be friendly, concise, and guide them to relevant pages. Keep responses to 2-3 sentences maximum.'

    // Build messages array for Groq
    const messages: any[] = conversationHistory || []
    messages.push({
      role: 'user',
      content: message,
    })

    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 256,
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    const res = NextResponse.json({
      response: assistantMessage,
      conversationId: `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    })

    return withCors(res)
  } catch (error: any) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}
