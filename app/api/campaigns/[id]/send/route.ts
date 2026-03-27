import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { campaigns, campaignSends, leads } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function substitute(template: string, lead: { name: string; website?: string | null; location?: string | null }): string {
  return template
    .replace(/\{\{name\}\}/g, lead.name)
    .replace(/\{\{company\}\}/g, lead.name)
    .replace(/\{\{website\}\}/g, lead.website ?? '')
    .replace(/\{\{location\}\}/g, lead.location ?? '')
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id))
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  if (campaign.status !== 'draft') {
    return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 })
  }

  // Get all pending sends with lead data
  const pending = await db
    .select({
      sendId: campaignSends.id,
      leadId: leads.id,
      leadName: leads.name,
      leadEmail: leads.email,
      leadWebsite: leads.website,
      leadLocation: leads.location,
    })
    .from(campaignSends)
    .innerJoin(leads, eq(campaignSends.leadId, leads.id))
    .where(and(eq(campaignSends.campaignId, id), eq(campaignSends.status, 'pending')))

  if (!pending.length) {
    return NextResponse.json({ error: 'No pending leads in this campaign' }, { status: 400 })
  }

  // Mark campaign as sending
  await db.update(campaigns).set({ status: 'sending' }).where(eq(campaigns.id, id))

  let sentCount = 0
  let failedCount = 0

  for (const row of pending) {
    const lead = { name: row.leadName!, website: row.leadWebsite, location: row.leadLocation }
    const subject = substitute(campaign.subject, lead)
    const html = substitute(campaign.body, lead)

    try {
      const { data, error } = await resend.emails.send({
        from: 'LuminousLogics <noreply@luminoustracker.luminouslogics.com>',
        to: row.leadEmail!,
        subject,
        html,
      })

      if (error || !data) {
        await db.update(campaignSends).set({ status: 'failed' }).where(eq(campaignSends.id, row.sendId))
        failedCount++
      } else {
        await db.update(campaignSends).set({ status: 'sent', messageId: data.id, sentAt: new Date() }).where(eq(campaignSends.id, row.sendId))
        await db.update(leads).set({ status: 'contacted', updatedAt: new Date() }).where(eq(leads.id, row.leadId))
        sentCount++
      }
    } catch {
      await db.update(campaignSends).set({ status: 'failed' }).where(eq(campaignSends.id, row.sendId))
      failedCount++
    }
  }

  await db.update(campaigns).set({
    status: 'completed',
    sentCount,
    failedCount,
    sentAt: new Date(),
  }).where(eq(campaigns.id, id))

  return NextResponse.json({ sent: sentCount, failed: failedCount })
}
