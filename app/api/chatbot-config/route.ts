import { NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'

export async function GET() {
  const config = {
    bot: {
      name: 'Lumos',
      avatar: '/images/luminous-assets/alis.png',
      greeting: "Hey there! Need any help? 👋",
      intro: {
        title: "Hi there, I'm Lumos 👋",
        message: "I'm here to help you explore Luminous Logics — specifically our services and how we ship products.",
      },
      systemPrompt: 'You are Lumos, a helpful assistant for Luminous Logics. You help users learn about our services, portfolio, and how to get in touch. Be friendly, concise, and guide them to relevant pages. Keep responses to 2-3 sentences maximum.',
      initialMenuItems: [
        {
          label: 'Explore services',
          href: '/services',
          icon: '💡',
        },
        {
          label: 'How we work',
          href: '/services',
          icon: '⚙️',
        },
        {
          label: 'Book a meeting',
          href: '/contact-us',
          icon: '📅',
        },
        {
          label: 'Our Work',
          href: '/case-study',
          icon: '💼',
        },
        {
          label: 'Read Blog',
          href: '/blog',
          icon: '📖',
        },
        {
          label: 'Contact Us',
          href: '/contact-us',
          icon: '✉️',
        },
      ],
    },
  }

  const res = NextResponse.json(config)
  return withCors(res)
}
