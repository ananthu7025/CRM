import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notes } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const [note] = await db
      .update(notes)
      .set({ content: body.content })
      .where(eq(notes.id, id))
      .returning()
    return NextResponse.json(note)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(notes).where(eq(notes.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
