import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const PUBLIC = ['/login', '/api/auth']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Allow Next.js internals and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) return NextResponse.next()

  const token = req.cookies.get('lt_session')?.value
  if (token) {
    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      // invalid/expired token — fall through to redirect
    }
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
