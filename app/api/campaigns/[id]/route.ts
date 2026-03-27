import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { campaigns, campaignSends, leads } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id))
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sends = await db
    .select({
      id: campaignSends.id,
      status: campaignSends.status,
      messageId: campaignSends.messageId,
      sentAt: campaignSends.sentAt,
      leadId: campaignSends.leadId,
      leadName: leads.name,
      leadEmail: leads.email,
      leadCompany: leads.name,
    })
    .from(campaignSends)
    .leftJoin(leads, eq(campaignSends.leadId, leads.id))
    .where(eq(campaignSends.campaignId, id))

  return NextResponse.json({ ...campaign, sends })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(campaigns).where(eq(campaigns.id, id))
  return NextResponse.json({ success: true })
}
