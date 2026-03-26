import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { meetings, projects } from '@/drizzle/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    const rows = await db
      .select({
        id: meetings.id,
        projectId: meetings.projectId,
        title: meetings.title,
        description: meetings.description,
        datetime: meetings.datetime,
        notes: meetings.notes,
        createdAt: meetings.createdAt,
        projectName: projects.name,
      })
      .from(meetings)
      .leftJoin(projects, eq(meetings.projectId, projects.id))
      .where(projectId ? eq(meetings.projectId, projectId) : undefined)
      .orderBy(desc(meetings.datetime))

    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const [meeting] = await db
      .insert(meetings)
      .values({
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        datetime: new Date(body.datetime),
        notes: body.notes ?? '',
      })
      .returning()
    return NextResponse.json(meeting, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }
}
