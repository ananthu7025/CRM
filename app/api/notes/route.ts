import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notes } from '@/drizzle/schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const [note] = await db
      .insert(notes)
      .values({ projectId: body.projectId, content: body.content })
      .returning()
    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
