import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { meetings } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const [meeting] = await db
      .update(meetings)
      .set({
        title: body.title,
        description: body.description,
        datetime: body.datetime ? new Date(body.datetime) : undefined,
        notes: body.notes,
        projectId: body.projectId,
      })
      .where(eq(meetings.id, id))
      .returning()
    return NextResponse.json(meeting)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(meetings).where(eq(meetings.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 })
  }
}
