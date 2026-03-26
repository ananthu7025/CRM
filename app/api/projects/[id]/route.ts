import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects, notes, meetings } from '@/drizzle/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [project] = await db.select().from(projects).where(eq(projects.id, id))
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const projectNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.projectId, id))
      .orderBy(desc(notes.createdAt))

    const projectMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.projectId, id))
      .orderBy(desc(meetings.datetime))

    return NextResponse.json({ ...project, notes: projectNotes, meetings: projectMeetings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const [project] = await db
      .update(projects)
      .set({
        name: body.name,
        description: body.description,
        budget: body.budget,
        startDate: body.startDate,
        endDate: body.endDate,
      })
      .where(eq(projects.id, id))
      .returning()
    return NextResponse.json(project)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(projects).where(eq(projects.id, id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
