import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects } from '@/drizzle/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const data = await db.select().from(projects).orderBy(desc(projects.createdAt))
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const [project] = await db
      .insert(projects)
      .values({
        name: body.name,
        description: body.description,
        budget: body.budget,
        startDate: body.startDate,
        endDate: body.endDate,
      })
      .returning()
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
