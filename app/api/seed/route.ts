import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projects, notes, meetings } from '@/drizzle/schema'

export async function POST() {
  try {
    const [p1, p2] = await db
      .insert(projects)
      .values([
        {
          name: 'Website Redesign',
          description: 'Complete overhaul of the company website with modern UI/UX and improved performance.',
          budget: '250000',
          startDate: '2026-01-01',
          endDate: '2026-06-30',
        },
        {
          name: 'Mobile App v2',
          description: 'Second version of the mobile app with new features, better performance, and cross-platform support.',
          budget: '180000',
          startDate: '2026-02-01',
          endDate: '2026-08-31',
        },
      ])
      .returning()

    await db.insert(notes).values([
      { projectId: p1.id, content: 'Figma designs approved by stakeholders. Ready to hand off to dev team.' },
      { projectId: p1.id, content: 'DB credentials for staging:\nHost: staging.db.example.com\nUser: admin\nPass: xxxxxxx' },
      { projectId: p2.id, content: 'React Native chosen over Flutter. Team is more experienced with it.' },
    ])

    await db.insert(meetings).values([
      {
        projectId: p1.id,
        title: 'Kickoff Meeting',
        description: 'Initial project kickoff with all stakeholders.',
        datetime: new Date('2026-01-05T10:00:00'),
        notes: 'Agreed on Jan 1 start. Budget confirmed at ₹2.5L. Weekly syncs every Monday.',
      },
      {
        projectId: p1.id,
        title: 'Design Review',
        description: 'Review Figma prototypes with design team.',
        datetime: new Date('2026-01-20T14:00:00'),
        notes: 'Minor tweaks requested on homepage hero. Color palette approved.',
      },
      {
        projectId: p2.id,
        title: 'Tech Stack Decision',
        description: 'Finalize frontend framework and backend architecture.',
        datetime: new Date('2026-02-10T11:00:00'),
        notes: 'React Native selected. Node.js + Express for API. PostgreSQL for DB.',
      },
    ])

    return NextResponse.json({ success: true, message: 'Seed data inserted successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Seed failed', details: String(err) }, { status: 500 })
  }
}
