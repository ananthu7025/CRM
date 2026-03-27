import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { campaigns, campaignSends } from '@/drizzle/schema'
import { desc, eq, sql } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { name, subject, body, templateId, leadIds } = await req.json()
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'name, subject and body are required' }, { status: 400 })
  }
  if (!leadIds?.length) {
    return NextResponse.json({ error: 'At least one lead must be selected' }, { status: 400 })
  }

  const [campaign] = await db.insert(campaigns).values({
    name,
    subject,
    body,
    templateId: templateId ?? null,
    totalLeads: leadIds.length,
  }).returning()

  await db.insert(campaignSends).values(
    leadIds.map((leadId: string) => ({ campaignId: campaign.id, leadId }))
  )

  return NextResponse.json(campaign, { status: 201 })
}
