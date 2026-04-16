import { NextResponse } from 'next/server'

export function withCors(res: NextResponse): NextResponse {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

export function handleCorsOptions(): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  return withCors(res)
}
